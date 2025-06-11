"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Smile,
  Frown,
  Meh,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter,
  Flag,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useNewsInsights } from "@/hooks/useNewsInsights";
import type { NewsInsight } from "@/services/newsInsights";

const SentimentIcon = ({ sentiment }: { sentiment: NewsInsight["sentiment"] }) => {
  if (sentiment === "positive") return <Smile className="h-5 w-5 text-green-500" />;
  if (sentiment === "negative") return <Frown className="h-5 w-5 text-red-500" />;
  return <Meh className="h-5 w-5 text-yellow-500" />;
};

const ReactionIcon = ({ reaction }: { reaction: NewsInsight["expectedGoldReaction"] }) => {
  if (reaction === "up") return <ArrowUp className="h-5 w-5 text-green-500" />;
  if (reaction === "down") return <ArrowDown className="h-5 w-5 text-red-500" />;
  return <Minus className="h-5 w-5 text-yellow-500" />;
};

export function NewsInsightsCard() {
  const [showHighConfidenceOnly, setShowHighConfidenceOnly] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  
  const { insights, isLoading, error, flagAsIrrelevant } = useNewsInsights({
    highConfidenceOnly: showHighConfidenceOnly,
    confidenceThreshold: 0.80
  });

  const handleExpandInsight = (insightId: string) => {
    setExpandedInsight(expandedInsight === insightId ? null : insightId);
  };

  const handleFlagIrrelevant = async (insightId: string) => {
    try {
      await flagAsIrrelevant(insightId);
    } catch (err) {
      console.error('Failed to flag insight:', err);
    }
  };

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            News Insights
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="confidence-filter" className="text-sm text-muted-foreground">
              High Confidence Only (>80%)
            </Label>
            <Switch 
              id="confidence-filter" 
              checked={showHighConfidenceOnly}
              onCheckedChange={setShowHighConfidenceOnly}
              aria-label="Toggle high confidence filter"
            />
          </div>
        </div>
        <CardDescription>AI-interpreted signals and summaries from financial news.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading insights...</p>
          </div>
        )}
        {!isLoading && error && (
           <div className="flex flex-col items-center justify-center h-full text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-center">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">Showing example data.</p>
          </div>
        )}
        {!isLoading && insights.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              {showHighConfidenceOnly ? "No high confidence insights available." : "No news insights available."}
            </p>
          </div>
        )}
        {!isLoading && insights.length > 0 && (
          <ScrollArea className="h-full max-h-[350px] pr-3">
            <div className="space-y-4">
              {insights.map((item) => (
                <div key={item.id} className="p-3 bg-muted/30 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="text-sm font-semibold text-foreground leading-tight flex-1 pr-2">
                      {item.headline}
                    </h4>
                    <div className="flex items-center space-x-2 shrink-0">
                      <SentimentIcon sentiment={item.sentiment} />
                      <ReactionIcon reaction={item.expectedGoldReaction} />
                    </div>
                  </div>
                  {item.source && (
                    <p className="text-xs text-muted-foreground mb-1">Source: {item.source}</p>
                  )}
                  <p className="text-xs text-foreground mb-2 p-2 bg-background/50 rounded-md">
                    <span className="font-medium">AI Summary:</span> {item.aiSummary}
                  </p>
                  
                  {/* Expandable detailed analysis */}
                  {expandedInsight === item.id && (
                    <div className="mt-2 p-2 bg-primary/10 rounded-md border border-primary/20">
                      <h5 className="text-xs font-medium text-primary mb-1">Detailed Analysis</h5>
                      <div className="text-xs text-foreground space-y-1">
                        <p><strong>Sentiment Score:</strong> {item.sentiment} (confidence: {item.confidence ? `${(item.confidence * 100).toFixed(0)}%` : 'N/A'})</p>
                        <p><strong>Expected Gold Impact:</strong> {item.expectedGoldReaction}</p>
                        <p><strong>Reasoning:</strong> This analysis is based on historical correlations between similar news events and gold price movements, combined with current market sentiment indicators.</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span>{item.timestamp.toDate().toLocaleDateString()} {item.timestamp.toDate().toLocaleTimeString()}</span>
                    <div className="flex items-center gap-2">
                      {item.confidence && (
                        <Badge variant="outline" className="text-xs">Conf: {(item.confidence * 100).toFixed(0)}%</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 text-muted-foreground hover:text-primary"
                        onClick={() => handleExpandInsight(item.id)}
                        aria-label="Show detailed analysis"
                      >
                        <HelpCircle className="h-3.5 w-3.5 mr-1" />
                        {expandedInsight === item.id ? 'Hide' : 'Why?'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-1 text-muted-foreground hover:text-destructive"
                        onClick={() => handleFlagIrrelevant(item.id)}
                        aria-label="Flag as irrelevant"
                      >
                        <Flag className="h-3.5 w-3.5 mr-1" /> Flag
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}