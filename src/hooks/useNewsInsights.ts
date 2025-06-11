import { useState, useEffect } from 'react';
import { newsInsightsService, type NewsInsight } from '@/services/newsInsights';

export interface UseNewsInsightsOptions {
  highConfidenceOnly?: boolean;
  confidenceThreshold?: number;
}

export interface UseNewsInsightsReturn {
  insights: NewsInsight[];
  isLoading: boolean;
  error: string | null;
  flagAsIrrelevant: (insightId: string) => Promise<void>;
}

export function useNewsInsights({
  highConfidenceOnly = false,
  confidenceThreshold = 0.80
}: UseNewsInsightsOptions = {}): UseNewsInsightsReturn {
  const [allInsights, setAllInsights] = useState<NewsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = newsInsightsService.subscribeToInsights(
      (insights) => {
        setAllInsights(insights);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const filteredInsights = highConfidenceOnly 
    ? allInsights.filter(insight => insight.confidence && insight.confidence > confidenceThreshold)
    : allInsights;

  const flagAsIrrelevant = async (insightId: string) => {
    try {
      await newsInsightsService.flagAsIrrelevant(insightId);
    } catch (err) {
      console.error('Failed to flag insight:', err);
    }
  };

  return {
    insights: filteredInsights,
    isLoading,
    error,
    flagAsIrrelevant
  };
}