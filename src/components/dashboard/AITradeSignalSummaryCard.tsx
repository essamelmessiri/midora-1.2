
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Percent, Info, Zap } from "lucide-react";

export function AITradeSignalSummaryCard() {
  // Placeholder data
  const signal = {
    asset: "XAU/USD",
    type: "BUY",
    entryZone: "1950.50 - 1952.00",
    stopLoss: "1945.00",
    target: "1975.00",
    confidence: 85,
    reasoning: "Strong bullish momentum detected with order block confirmation on H4.",
    timestamp: new Date().toLocaleString(),
  };

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5 text-accent" />
            AI Trade Signal
          </CardTitle>
          <Badge variant={signal.type === "BUY" ? "default" : "destructive"} className={signal.type === "BUY" ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-red-500/20 text-red-500 border-red-500/30"}>
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
            <p className="text-foreground">{signal.confidence}%</p>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-muted-foreground flex items-center mb-1">
            <Info className="mr-1 h-4 w-4" /> Reasoning:
          </h4>
          <p className="text-xs text-foreground p-2 bg-muted/50 rounded-md">{signal.reasoning}</p>
        </div>
      </CardContent>
    </Card>
  );
}
