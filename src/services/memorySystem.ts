import { supabase } from '@/lib/supabase/client';

export interface MemorySnapshot {
  id: string;
  timestamp: string;
  session_type: 'Asia' | 'Europe' | 'US';
  market_sentiment: {
    score: number;
    label: string;
    reasoning: string;
  };
  technical_analysis: {
    patterns: string[];
    levels: { type: string; price: number; strength: number }[];
    indicators: Record<string, any>;
  };
  news_context?: {
    headlines: string[];
    sentiment: any;
    impact_assessment: any;
  };
  ai_confidence: number;
  market_conditions: string;
  key_levels: {
    support: number[];
    resistance: number[];
    pivots: number[];
  };
  created_at: string;
}

export interface TradeReflection {
  id: string;
  trade_signal_id?: string;
  asset: string;
  signal_type: 'BUY' | 'SELL' | 'AVOID';
  signal_timestamp: string;
  signal_price?: number;
  predicted_direction: 'up' | 'down' | 'neutral' | 'uncertain';
  confidence_score: number;
  technical_reasoning?: string;
  news_reasoning?: string;
  session_context?: string;
  actual_outcome: string;
  outcome_price?: number;
  price_range_summary?: string;
  outcome_reason?: string;
  reflection_note: string;
  lessons_learned?: any;
  accuracy_score?: number;
  created_at: string;
}

export interface SessionContext {
  id: string;
  session_date: string;
  session_type: 'Asia' | 'Europe' | 'US';
  emotional_state: 'fear' | 'greed' | 'confidence' | 'hesitation' | 'neutral';
  market_mood: string;
  volatility_level: 'low' | 'medium' | 'high' | 'extreme';
  key_events: string[];
  price_action_summary?: string;
  volume_analysis?: string;
  session_outcome?: string;
  created_at: string;
}

export interface MemorySystemService {
  // Memory Snapshots
  createMemorySnapshot: (snapshot: Omit<MemorySnapshot, 'id' | 'created_at'>) => Promise<MemorySnapshot>;
  getRecentMemorySnapshots: (limit?: number) => Promise<MemorySnapshot[]>;
  findSimilarMarketConditions: (currentConditions: string, limit?: number) => Promise<MemorySnapshot[]>;
  
  // Trade Reflections
  createTradeReflection: (reflection: Omit<TradeReflection, 'id' | 'created_at'>) => Promise<TradeReflection>;
  getTradeReflections: (asset?: string, limit?: number) => Promise<TradeReflection[]>;
  getAccuracyStats: (timeframe?: string) => Promise<any>;
  
  // Session Contexts
  createSessionContext: (context: Omit<SessionContext, 'id' | 'created_at'>) => Promise<SessionContext>;
  getCurrentSessionContext: (sessionType: 'Asia' | 'Europe' | 'US') => Promise<SessionContext | null>;
  getSessionPatterns: (timeframe?: string) => Promise<any>;
}

class SupabaseMemorySystemService implements MemorySystemService {
  async createMemorySnapshot(snapshot: Omit<MemorySnapshot, 'id' | 'created_at'>): Promise<MemorySnapshot> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('memory_snapshots')
      .insert(snapshot)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create memory snapshot: ${error.message}`);
    }

    return data;
  }

  async getRecentMemorySnapshots(limit: number = 10): Promise<MemorySnapshot[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('memory_snapshots')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch memory snapshots: ${error.message}`);
    }

    return data || [];
  }

  async findSimilarMarketConditions(currentConditions: string, limit: number = 5): Promise<MemorySnapshot[]> {
    // TODO: Implement vector similarity search when pgvector is available
    // For now, return recent snapshots as a placeholder
    console.log('Vector search not yet implemented, returning recent snapshots');
    return this.getRecentMemorySnapshots(limit);
  }

  async createTradeReflection(reflection: Omit<TradeReflection, 'id' | 'created_at'>): Promise<TradeReflection> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('trade_reflections')
      .insert(reflection)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create trade reflection: ${error.message}`);
    }

    return data;
  }

  async getTradeReflections(asset?: string, limit: number = 20): Promise<TradeReflection[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase
      .from('trade_reflections')
      .select('*')
      .order('signal_timestamp', { ascending: false })
      .limit(limit);

    if (asset) {
      query = query.eq('asset', asset);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch trade reflections: ${error.message}`);
    }

    return data || [];
  }

  async getAccuracyStats(timeframe: string = '30 days'): Promise<any> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // TODO: Implement complex aggregation query
    // For now, return mock data
    return {
      totalTrades: 45,
      winRate: 0.67,
      avgConfidence: 0.78,
      accuracyByConfidence: {
        high: { trades: 20, accuracy: 0.85 },
        medium: { trades: 18, accuracy: 0.67 },
        low: { trades: 7, accuracy: 0.43 }
      }
    };
  }

  async createSessionContext(context: Omit<SessionContext, 'id' | 'created_at'>): Promise<SessionContext> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('session_contexts')
      .insert(context)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session context: ${error.message}`);
    }

    return data;
  }

  async getCurrentSessionContext(sessionType: 'Asia' | 'Europe' | 'US'): Promise<SessionContext | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('session_contexts')
      .select('*')
      .eq('session_date', today)
      .eq('session_type', sessionType)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch session context: ${error.message}`);
    }

    return data;
  }

  async getSessionPatterns(timeframe: string = '90 days'): Promise<any> {
    // TODO: Implement session pattern analysis
    // For now, return mock data
    return {
      emotionalStateDistribution: {
        confidence: 0.35,
        neutral: 0.25,
        greed: 0.20,
        fear: 0.15,
        hesitation: 0.05
      },
      sessionPerformance: {
        Asia: { successRate: 0.72, avgVolatility: 'medium' },
        Europe: { successRate: 0.68, avgVolatility: 'high' },
        US: { successRate: 0.75, avgVolatility: 'medium' }
      }
    };
  }
}

// Mock service for development
class MockMemorySystemService implements MemorySystemService {
  private mockSnapshots: MemorySnapshot[] = [];
  private mockReflections: TradeReflection[] = [];
  private mockSessions: SessionContext[] = [];

  async createMemorySnapshot(snapshot: Omit<MemorySnapshot, 'id' | 'created_at'>): Promise<MemorySnapshot> {
    const newSnapshot: MemorySnapshot = {
      ...snapshot,
      id: `snapshot_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.mockSnapshots.unshift(newSnapshot);
    return newSnapshot;
  }

  async getRecentMemorySnapshots(limit: number = 10): Promise<MemorySnapshot[]> {
    return this.mockSnapshots.slice(0, limit);
  }

  async findSimilarMarketConditions(currentConditions: string, limit: number = 5): Promise<MemorySnapshot[]> {
    // Return random snapshots for mock
    return this.mockSnapshots.slice(0, limit);
  }

  async createTradeReflection(reflection: Omit<TradeReflection, 'id' | 'created_at'>): Promise<TradeReflection> {
    const newReflection: TradeReflection = {
      ...reflection,
      id: `reflection_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.mockReflections.unshift(newReflection);
    return newReflection;
  }

  async getTradeReflections(asset?: string, limit: number = 20): Promise<TradeReflection[]> {
    let filtered = this.mockReflections;
    if (asset) {
      filtered = filtered.filter(r => r.asset === asset);
    }
    return filtered.slice(0, limit);
  }

  async getAccuracyStats(): Promise<any> {
    return {
      totalTrades: 45,
      winRate: 0.67,
      avgConfidence: 0.78,
      accuracyByConfidence: {
        high: { trades: 20, accuracy: 0.85 },
        medium: { trades: 18, accuracy: 0.67 },
        low: { trades: 7, accuracy: 0.43 }
      }
    };
  }

  async createSessionContext(context: Omit<SessionContext, 'id' | 'created_at'>): Promise<SessionContext> {
    const newContext: SessionContext = {
      ...context,
      id: `session_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.mockSessions.unshift(newContext);
    return newContext;
  }

  async getCurrentSessionContext(sessionType: 'Asia' | 'Europe' | 'US'): Promise<SessionContext | null> {
    const today = new Date().toISOString().split('T')[0];
    return this.mockSessions.find(s => 
      s.session_date === today && s.session_type === sessionType
    ) || null;
  }

  async getSessionPatterns(): Promise<any> {
    return {
      emotionalStateDistribution: {
        confidence: 0.35,
        neutral: 0.25,
        greed: 0.20,
        fear: 0.15,
        hesitation: 0.05
      },
      sessionPerformance: {
        Asia: { successRate: 0.72, avgVolatility: 'medium' },
        Europe: { successRate: 0.68, avgVolatility: 'high' },
        US: { successRate: 0.75, avgVolatility: 'medium' }
      }
    };
  }
}

// Export service instance
export const memorySystemService: MemorySystemService = 
  process.env.NODE_ENV === 'development'
    ? new MockMemorySystemService()
    : new SupabaseMemorySystemService();