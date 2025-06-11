# Synr X Memory System Schema

## Overview
The memory system stores AI analysis history, trade reflections, and market insights to provide contextual awareness and learning capabilities.

## Database Schema

### 1. Memory Snapshots Table (`memory_snapshots`)
Stores periodic AI analysis snapshots for historical context.

```sql
CREATE TABLE memory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_type TEXT NOT NULL CHECK (session_type IN ('Asia', 'Europe', 'US')),
  market_sentiment JSONB NOT NULL, -- {score: number, label: string, reasoning: string}
  technical_analysis JSONB NOT NULL, -- {patterns: [], levels: [], indicators: {}}
  news_context JSONB, -- {headlines: [], sentiment: {}, impact_assessment: {}}
  ai_confidence DECIMAL(3,2) NOT NULL CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  market_conditions TEXT NOT NULL, -- Brief description of overall conditions
  key_levels JSONB, -- {support: [], resistance: [], pivots: []}
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Indexes
  INDEX idx_memory_snapshots_timestamp (timestamp DESC),
  INDEX idx_memory_snapshots_session (session_type, timestamp DESC)
);
```

### 2. Trade Reflections Table (`trade_reflections`)
Stores post-trade analysis for learning and improvement.

```sql
CREATE TABLE trade_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_signal_id UUID, -- Reference to original signal if available
  asset TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'AVOID')),
  signal_timestamp TIMESTAMPTZ NOT NULL,
  signal_price DECIMAL(10,2),
  predicted_direction TEXT NOT NULL CHECK (predicted_direction IN ('up', 'down', 'neutral', 'uncertain')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Original reasoning
  technical_reasoning TEXT,
  news_reasoning TEXT,
  session_context TEXT,
  
  -- Actual outcome
  actual_outcome TEXT NOT NULL, -- "Win", "Loss", "Neutral", etc.
  outcome_price DECIMAL(10,2),
  price_range_summary TEXT, -- Description of price movement
  outcome_reason TEXT, -- Why the outcome occurred
  
  -- AI reflection
  reflection_note TEXT NOT NULL, -- AI-generated reflection (max 50 words)
  lessons_learned JSONB, -- Structured insights
  accuracy_score DECIMAL(3,2), -- How accurate was the prediction
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Indexes
  INDEX idx_trade_reflections_asset_timestamp (asset, signal_timestamp DESC),
  INDEX idx_trade_reflections_outcome (actual_outcome, signal_timestamp DESC),
  INDEX idx_trade_reflections_confidence (confidence_score DESC, signal_timestamp DESC)
);
```

### 3. AI Insights Table (`ai_insights`)
Stores AI-generated insights and patterns for knowledge building.

```sql
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'correlation', 'anomaly', 'prediction')),
  asset TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  supporting_data JSONB, -- Evidence supporting the insight
  market_conditions JSONB, -- Conditions when insight was generated
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'confirmed', 'rejected')),
  validation_date TIMESTAMPTZ,
  tags TEXT[], -- For categorization and search
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Indexes
  INDEX idx_ai_insights_type_asset (insight_type, asset, created_at DESC),
  INDEX idx_ai_insights_confidence (confidence DESC, created_at DESC),
  INDEX idx_ai_insights_tags USING GIN (tags)
);
```

### 4. Session Context Table (`session_contexts`)
Tracks emotional state and market mood by trading session.

```sql
CREATE TABLE session_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date DATE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('Asia', 'Europe', 'US')),
  emotional_state TEXT NOT NULL CHECK (emotional_state IN ('fear', 'greed', 'confidence', 'hesitation', 'neutral')),
  market_mood TEXT NOT NULL,
  volatility_level TEXT NOT NULL CHECK (volatility_level IN ('low', 'medium', 'high', 'extreme')),
  key_events TEXT[], -- Major events during the session
  price_action_summary TEXT,
  volume_analysis TEXT,
  session_outcome TEXT, -- Overall assessment of the session
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Constraints
  UNIQUE(session_date, session_type),
  
  -- Indexes
  INDEX idx_session_contexts_date_type (session_date DESC, session_type),
  INDEX idx_session_contexts_emotional_state (emotional_state, session_date DESC)
);
```

## Vector Search Integration (pgvector)

### 5. Memory Embeddings Table (`memory_embeddings`)
For semantic search and similarity matching of market conditions.

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE memory_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('market_analysis', 'news_summary', 'trade_signal', 'reflection')),
  content_id UUID NOT NULL, -- Reference to the actual content
  content_text TEXT NOT NULL, -- The text that was embedded
  embedding VECTOR(1536), -- OpenAI ada-002 embedding size
  metadata JSONB, -- Additional context for filtering
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Indexes
  INDEX idx_memory_embeddings_content (content_type, content_id),
  INDEX idx_memory_embeddings_vector USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
);
```

## Usage Patterns

### 1. Contextual Memory Retrieval
```sql
-- Find similar market conditions from the past
SELECT ms.*, 
       me.embedding <=> $1 AS similarity_score
FROM memory_snapshots ms
JOIN memory_embeddings me ON me.content_id = ms.id
WHERE me.content_type = 'market_analysis'
  AND me.embedding <=> $1 < 0.2  -- Similarity threshold
ORDER BY similarity_score
LIMIT 5;
```

### 2. Learning from Past Trades
```sql
-- Analyze accuracy by confidence level
SELECT 
  CASE 
    WHEN confidence_score >= 0.8 THEN 'High'
    WHEN confidence_score >= 0.6 THEN 'Medium'
    ELSE 'Low'
  END as confidence_bucket,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN actual_outcome LIKE 'Win%' THEN 1 END) as wins,
  AVG(accuracy_score) as avg_accuracy
FROM trade_reflections
WHERE signal_timestamp >= NOW() - INTERVAL '30 days'
GROUP BY confidence_bucket;
```

### 3. Session Pattern Analysis
```sql
-- Identify emotional state patterns by session
SELECT 
  session_type,
  emotional_state,
  COUNT(*) as frequency,
  AVG(CASE WHEN session_outcome LIKE 'Positive%' THEN 1 ELSE 0 END) as success_rate
FROM session_contexts
WHERE session_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY session_type, emotional_state
ORDER BY session_type, frequency DESC;
```

## Implementation Notes

1. **Embedding Generation**: Use OpenAI's text-embedding-ada-002 model for generating embeddings
2. **Batch Processing**: Process embeddings in batches to optimize API usage
3. **Similarity Search**: Use cosine similarity for finding related market conditions
4. **Data Retention**: Implement archival strategy for old data (e.g., compress data older than 1 year)
5. **Privacy**: Ensure no sensitive user data is stored in embeddings