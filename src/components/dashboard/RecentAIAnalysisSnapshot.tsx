
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, BarChartBig, TrendingUp, TrendingDown, LocateFixed, SearchCode, Zap } from "lucide-react";

interface AnalysisItem {
  title: string;
  value: string;
  icon: React.ElementType;
  status?: "bullish" | "bearish" | "neutral";
}

const analysisData: { title: string; icon: React.ElementType; items: AnalysisItem[] }[] = [
  {
    title: "Structural Elements",
    icon: Layers,
    items: [
      { title: "Detected Order Blocks", value: "OB at 1955.20 (H4), 1948.50 (H1)", icon: Layers },
      { title: "Key Value Gaps", value: "FVG between 1960.00 - 1962.50 (H1)", icon: Layers },
    ],
  },
  {
    title: "Candlestick Patterns",
    icon: BarChartBig,
    items: [
      { title: "H1 Chart", value: "Bullish Engulfing near 1950.00", icon: BarChartBig, status: "bullish" },
      { title: "M15 Chart", value: "Pin Bar rejection at 1958.75", icon: BarChartBig, status: "bearish" },
    ],
  },
  {
    title: "Current Bias",
    icon: TrendingUp,
    items: [
      { title: "4H Timeframe", value: "Bullish", icon: TrendingUp, status: "bullish" },
      { title: "1H Timeframe", value: "Neutral", icon: TrendingDown, status: "neutral" }, // Example of neutral
      { title: "15M Timeframe", value: "Slightly Bearish", icon: TrendingDown, status: "bearish" },
    ],
  },
  {
    title: "Pivot Positioning",
    icon: LocateFixed,
    items: [
      { title: "Daily Pivot", value: "Currently above (1945.60)", icon: LocateFixed },
      { title: "4H Pivot", value: "Testing support at 1952.10", icon: LocateFixed },
    ],
  },
];

export function RecentAIAnalysisSnapshot() {
  const getStatusColor = (status?: "bullish" | "bearish" | "neutral") => {
    if (status === "bullish") return "text-green-500";
    if (status === "bearish") return "text-red-500";
    return "text-yellow-500"; // Neutral
  };

  const getStatusBadgeVariant = (status?: "bullish" | "bearish" | "neutral") => {
    if (status === "bullish") return "default"; // Will use primary color or a custom green one
    if (status === "bearish") return "destructive";
    return "secondary"; // Neutral
  };


  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <SearchCode className="mr-2 h-5 w-5 text-primary" />
          Recent AI Analysis
        </CardTitle>
        <CardDescription>Snapshot of the latest AI-driven market insights.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysisData.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center">
              <section.icon className="mr-2 h-4 w-4 text-accent" />
              {section.title}
            </h3>
            <ul className="space-y-1.5 pl-1">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-xs text-muted-foreground flex items-start">
                  <item.icon className={`mr-2 h-3 w-3 mt-0.5 shrink-0 ${getStatusColor(item.status)}`} />
                  <div>
                    <span className="font-medium text-foreground">{item.title}:</span> {item.value}
                    {item.status && (
                       <Badge 
                        variant={getStatusBadgeVariant(item.status)} 
                        className={`ml-2 text-xs px-1.5 py-0.5 ${
                          item.status === "bullish" ? "bg-green-500/20 text-green-500 border-green-500/30" : 
                          item.status === "bearish" ? "bg-red-500/20 text-red-500 border-red-500/30" :
                          "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                        }`}
                       >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
