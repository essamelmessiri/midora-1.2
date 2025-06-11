import { useState, useEffect, useCallback } from 'react';
import { marketDataService, type MarketCandle } from '@/services/marketData';

export interface UseMarketDataOptions {
  symbol: string;
  limit?: number;
  enableRealtime?: boolean;
}

export interface UseMarketDataReturn {
  candles: MarketCandle[];
  latestCandle: MarketCandle | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarketData({
  symbol,
  limit = 100,
  enableRealtime = true
}: UseMarketDataOptions): UseMarketDataReturn {
  const [candles, setCandles] = useState<MarketCandle[]>([]);
  const [latestCandle, setLatestCandle] = useState<MarketCandle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [candlesData, latestData] = await Promise.all([
        marketDataService.getLatestCandles(symbol, limit),
        marketDataService.getLatestCandle(symbol)
      ]);
      
      setCandles(candlesData);
      setLatestCandle(latestData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch market data';
      setError(errorMessage);
      console.error('Market data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, limit]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime) return;

    const unsubscribe = marketDataService.subscribeToCandles(symbol, (newCandle) => {
      setCandles(prevCandles => {
        const existingIndex = prevCandles.findIndex(c => c.time === newCandle.time);
        let updatedCandles = [...prevCandles];
        
        if (existingIndex !== -1) {
          // Update existing candle
          updatedCandles[existingIndex] = newCandle;
        } else {
          // Add new candle
          updatedCandles.push(newCandle);
          updatedCandles.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
          
          // Keep only the latest 'limit' candles
          if (updatedCandles.length > limit) {
            updatedCandles = updatedCandles.slice(-limit);
          }
        }
        
        return updatedCandles;
      });
      
      setLatestCandle(newCandle);
    });

    return unsubscribe;
  }, [symbol, enableRealtime, limit]);

  return {
    candles,
    latestCandle,
    isLoading,
    error,
    refetch: fetchData
  };
}