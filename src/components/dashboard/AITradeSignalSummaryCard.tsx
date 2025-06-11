"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Percent, Info, Zap, HelpCircle, Loader2 } from "lucide-react";
import { aiFlowsService } from "@/services/aiFlows";
import type { ExplainTradeSignalInput } from "@/ai/flows/explain-trade-signal-flow";

interface TradeSignal {
  asset: string;
  type: "BUY" | "SELL" | "AVOID";
  entryZone: string;
  stopLoss: string;
  target: string;
  confidence: number;
  reasoning: string;
  timestamp: string;
  technicalContext?: string;
  newsContext?: string;
  sessionInfo?: string;
}

export function AITradeSignalSummaryCard() {
  const [signal, setSignal] = useState<TradeSignal>({
    asset: "XAU/USD",
    type: "BUY",
    entryZone: "1950.50 - 1952.00",
    stopLoss: "1945.00",
    target: "1975.00",
    confidence: 85,
    reasoning: "Strong bullish momentum detected with order block confirmation on H4.",
    timestamp: new Date().toLocaleString(),
    technicalContext: "EMA crossover, RSI oversold, Order block at 1950",
    newsContext: "Positive inflation data, Fed dovish comments",
    sessionInfo: "US Session"
  });

  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);

  const handleExplainSignal = async () => {
    if (expandedExplanation) {
      setExpandedExplanation(null);
      return;
    }

    setIsLoadingExplanation(true);
    try {
      const input: ExplainTradeSignalInput = {
        asset: signal.asset,
        signalType: signal.type,
        confidence: signal.confidence / 100,
        technicalContext: signal.technicalContext,
        newsContext: signal.newsContext,
        sessionInfo: signal.sessionInfo
      };

      const result = await aiFlowsService.explainTradeSignal(input);
      setExpandedExplanation(result.explanation);
    } catch (error) {
      console.error('Failed to get signal explanation:', error);
      setExpandedExplanation('Unable to generate detailed explanation at this time.');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5 text-accent" />
            AI Trade Signal
          </CardTitle>
          <Badge 
            variant={signal.type === "BUY" ? "default" : signal.type === "SELL" ? "destructive" : "secondary"} 
            className={
              signal.type === "BUY" 
                ? "bg-green-500/20 text-green-500 border-green-500/30" 
                : signal.type === "SELL"
                ? "bg-red-500/20 text-red-500 border-red-500/30"
                : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
            }
          >
            {signal.asset} - {signal.type}
          </Badge>
        </div>
        <CardDescription>Latest AI-generated trade signal. Last updated: {signal.timestamp}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Entry Zone:</span>
            <p className="text-foreground">{signal.entryZone}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Stop Loss:</span>
            <p className="text-destructive">{signal.stopLoss}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Target:</span>
            <p className="text-green-500">{signal.target}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground flex items-center">
              <Percent className="mr-1 h-4 w-4" /> Confidence:
            </span>
            <div className="flex items-center gap-2">
              <p className="text-foreground">{signal.confidence}%</p>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    signal.confidence >= 80 ? 'bg-green-500' : 
                    signal.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-muted-foreground flex items-center">
              <Info className="mr-1 h-4 w-4" /> Reasoning:
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExplainSignal}
              disabled={isLoadingExplanation}
              className="h-auto p-1 text-muted-foreground hover:text-primary"
            >
              {isLoadingExplanation ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <HelpCircle className="h-3.5 w-3.5 mr-1" />
              )}
              {expandedExplanation ? 'Hide Details' : 'Why?'}
            </Button>
          </div>
          <p className="text-xs text-foreground p-2 bg-muted/50 rounded-md">{signal.reasoning}</p>
          
          {expandedExplanation && (
            <div className="mt-2 p-2 bg-primary/10 rounded-md border border-primary/20">
              <h5 className="text-xs font-medium text-primary mb-1">AI Explanation</h5>
              <p className="text-xs text-foreground">{expandedExplanation}</p>
            </div>
          )}
        </div>

        {/* Context Information */}
        <div className="grid grid-cols-1 gap-2 text-xs">
          {signal.technicalContext && (
            <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
              <span className="font-medium text-blue-600">Technical:</span> {signal.technicalContext}
            </div>
          )}
          {signal.newsContext && (
            <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
              <span className="font-medium text-green-600">News:</span> {signal.newsContext}
            </div>
          )}
          {signal.sessionInfo && (
            <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
              <span className="font-medium text-purple-600">Session:</span> {signal.sessionInfo}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}