import { 
  summarizeMarketTrends, 
  type SummarizeMarketTrendsInput, 
  type SummarizeMarketTrendsOutput 
} from '@/ai/flows/summarize-market-trends';
import { 
  explainTradeSignal, 
  type ExplainTradeSignalInput, 
  type ExplainTradeSignalOutput 
} from '@/ai/flows/explain-trade-signal-flow';
import { 
  chatWithSynrAI, 
  type DashboardChatInput, 
  type DashboardChatOutput 
} from '@/ai/flows/dashboard-chat-flow';
import { 
  analyzeNewsText, 
  type NewsAnalysisInput, 
  type NewsAnalysisOutput 
} from '@/ai/flows/analyze-news-flow';
import { 
  generateTradeReflection, 
  type TradeReflectionInput, 
  type TradeReflectionOutput 
} from '@/ai/flows/generate-trade-reflection-flow';

export interface AIFlowsService {
  summarizeMarketTrends: (input: SummarizeMarketTrendsInput) => Promise<SummarizeMarketTrendsOutput>;
  explainTradeSignal: (input: ExplainTradeSignalInput) => Promise<ExplainTradeSignalOutput>;
  chatWithSynr: (input: DashboardChatInput) => Promise<DashboardChatOutput>;
  analyzeNews: (input: NewsAnalysisInput) => Promise<NewsAnalysisOutput>;
  generateTradeReflection: (input: TradeReflectionInput) => Promise<TradeReflectionOutput>;
}

class GenkitAIFlowsService implements AIFlowsService {
  async summarizeMarketTrends(input: SummarizeMarketTrendsInput): Promise<SummarizeMarketTrendsOutput> {
    try {
      return await summarizeMarketTrends(input);
    } catch (error) {
      console.error('Error in summarizeMarketTrends:', error);
      throw new Error(`Failed to summarize market trends: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async explainTradeSignal(input: ExplainTradeSignalInput): Promise<ExplainTradeSignalOutput> {
    try {
      return await explainTradeSignal(input);
    } catch (error) {
      console.error('Error in explainTradeSignal:', error);
      throw new Error(`Failed to explain trade signal: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async chatWithSynr(input: DashboardChatInput): Promise<DashboardChatOutput> {
    try {
      return await chatWithSynrAI(input);
    } catch (error) {
      console.error('Error in chatWithSynr:', error);
      throw new Error(`Failed to chat with Synr: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeNews(input: NewsAnalysisInput): Promise<NewsAnalysisOutput> {
    try {
      return await analyzeNewsText(input);
    } catch (error) {
      console.error('Error in analyzeNews:', error);
      throw new Error(`Failed to analyze news: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateTradeReflection(input: TradeReflectionInput): Promise<TradeReflectionOutput> {
    try {
      return await generateTradeReflection(input);
    } catch (error) {
      console.error('Error in generateTradeReflection:', error);
      throw new Error(`Failed to generate trade reflection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Mock service for testing and development
class MockAIFlowsService implements AIFlowsService {
  async summarizeMarketTrends(input: SummarizeMarketTrendsInput): Promise<SummarizeMarketTrendsOutput> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      trendSummary: `Based on the provided market data, Gold is showing bullish momentum with strong support at key levels. Current price action suggests continued upward pressure.`,
      suggestedTrades: `Consider BUY on Gold if price breaks above 1955 resistance, with SL at 1948 and target at 1975.`,
      confidence: 0.85,
      reasoning: `Analysis based on technical indicators showing oversold conditions and positive market sentiment from recent economic data.`
    };
  }

  async explainTradeSignal(input: ExplainTradeSignalInput): Promise<ExplainTradeSignalOutput> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      explanation: `Suggesting ${input.signalType} for ${input.asset} due to ${input.technicalContext || 'strong technical setup'} and ${input.newsContext || 'favorable market conditions'}.`
    };
  }

  async chatWithSynr(input: DashboardChatInput): Promise<DashboardChatOutput> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      aiResponse: `I understand you're asking about "${input.userMessage}". Based on current market conditions, I'd recommend staying cautious and watching key support/resistance levels. Would you like me to explain any specific technical patterns?`
    };
  }

  async analyzeNews(input: NewsAnalysisInput): Promise<NewsAnalysisOutput> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      keyEntities: ['Federal Reserve', 'USD', 'Gold', 'Inflation'],
      topics: ['Monetary Policy', 'Economic Data', 'Market Sentiment'],
      sentiment: {
        score: 0.3,
        label: 'positive' as const
      },
      impactEstimation: {
        targetAsset: 'Gold',
        direction: 'up' as const,
        magnitude: 'medium' as const,
        confidence: 0.75,
        reasoning: 'Positive sentiment towards gold as a hedge against potential monetary policy changes.'
      },
      summary: `The news indicates potential positive impact on gold prices due to monetary policy uncertainty and inflation concerns.`
    };
  }

  async generateTradeReflection(input: TradeReflectionInput): Promise<TradeReflectionOutput> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      reflectionNote: `${input.signalType} signal for ${input.asset} ${input.actualOutcome.includes('Win') ? 'succeeded' : 'failed'} due to ${input.reasonForActualOutcome || 'market conditions'}. ${input.confidence > 0.8 ? 'High confidence was justified.' : 'Confidence level was appropriate.'}`
    };
  }
}

// Export service instance - use mock in development, real in production
export const aiFlowsService: AIFlowsService = 
  process.env.NODE_ENV === 'development' && !process.env.GOOGLE_GENAI_API_KEY
    ? new MockAIFlowsService()
    : new GenkitAIFlowsService();