import { supabase } from '@/lib/supabase/client';

export interface MarketCandle {
  symbol: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  created_at?: string;
}

export interface MarketDataService {
  getLatestCandles: (symbol: string, limit?: number) => Promise<MarketCandle[]>;
  getLatestCandle: (symbol: string) => Promise<MarketCandle | null>;
  subscribeToCandles: (symbol: string, callback: (candle: MarketCandle) => void) => () => void;
}

class SupabaseMarketDataService implements MarketDataService {
  async getLatestCandles(symbol: string, limit: number = 100): Promise<MarketCandle[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('symbol', symbol)
      .order('time', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch market data: ${error.message}`);
    }

    return (data || []).reverse(); // Return in chronological order
  }

  async getLatestCandle(symbol: string): Promise<MarketCandle | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .eq('symbol', symbol)
      .order('time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch latest candle: ${error.message}`);
    }

    return data;
  }

  subscribeToCandles(symbol: string, callback: (candle: MarketCandle) => void): () => void {
    if (!supabase) {
      console.warn('Supabase client not initialized. Real-time updates disabled.');
      return () => {};
    }

    const channel = supabase
      .channel(`market_data_${symbol}_inserts`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'market_data', 
          filter: `symbol=eq.${symbol}` 
        },
        (payload) => {
          const newCandle = payload.new as MarketCandle;
          if (newCandle && newCandle.time && newCandle.open !== undefined) {
            callback(newCandle);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to real-time updates for ${symbol}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || err) {
          console.error('Supabase subscription error:', status, err);
        }
      });

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel).catch(err => 
          console.error("Error removing Supabase channel:", err)
        );
      }
    };
  }
}

// Export singleton instance
export const marketDataService = new SupabaseMarketDataService();