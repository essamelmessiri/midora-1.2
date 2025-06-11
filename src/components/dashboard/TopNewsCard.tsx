
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Newspaper, Zap, Flame, TrendingDown, CalendarClock, Building } from "lucide-react"; // Added CalendarClock, Building

interface NewsItem {
  id: number;
  title: string;
  source: string;
  url: string;
  dataAiHint?: string;
  impact: "high" | "medium" | "low";
  timestamp: string; // e.g., "5m ago", "1h ago"
  category?: string; // e.g., "USD", "XAUUSD", "Economy"
}

const newsItems: NewsItem[] = [
  { id: 1, title: "Federal Reserve Hints at Potential Rate Adjustment in Q3", source: "Bloomberg", url: "#", impact: "high", timestamp: "2m ago", category: "USD" },
  { id: 2, title: "Gold Prices Surge Past $2050 Amidst Geopolitical Tensions", source: "Reuters", url: "#", impact: "high", timestamp: "10m ago", category: "XAUUSD" },
  { id: 3, title: "European Central Bank Maintains Current Interest Rates", source: "Financial Times", url: "#", impact: "medium", timestamp: "25m ago", category: "EUR" },
  { id: 4, title: "Tech Stocks Rally: Nasdaq Hits Record High", source: "Wall Street Journal", url: "#", impact: "medium", timestamp: "45m ago", category: "Stocks" },
  { id: 5, title: "Crude Oil Inventories Show Unexpected Decrease", source: "OilPrice.com", url: "#", impact: "high", timestamp: "1h ago", category: "Oil" },
  { id: 6, title: "Bank of Japan Governor Signals Shift in Monetary Policy", source: "Nikkei Asia", url: "#", impact: "medium", timestamp: "1h 15m ago", category: "JPY" },
  { id: 7, title: "Global Supply Chain Issues Easing, Report Suggests", source: "Associated Press", url: "#", impact: "low", timestamp: "2h ago", category: "Economy" },
  { id: 8, title: "UK Inflation Rate Drops Slightly but Remains Elevated", source: "BBC News", url: "#", impact: "medium", timestamp: "2h 30m ago", category: "GBP" },
  { id: 9, title: "Major Crypto Exchange Announces Platform Upgrade", source: "CoinDesk", url: "#", impact: "low", timestamp: "3h ago", category: "Crypto" },
  { id: 10, title: "US Non-Farm Payrolls Exceed Expectations", source: "ForexLive", url: "#", impact: "high", timestamp: "Yesterday", category: "USD" },
];

// Sort by impact (high > medium > low), then by recency (conceptual, use timestamp if available)
const sortedNewsItems = [...newsItems].sort((a, b) => {
  const impactOrder = { high: 0, medium: 1, low: 2 };
  if (impactOrder[a.impact] < impactOrder[b.impact]) return -1;
  if (impactOrder[a.impact] > impactOrder[b.impact]) return 1;
  // Add secondary sort by timestamp if needed (more complex for "xm ago" strings)
  return 0; 
});

const ImpactIcon = ({ impact }: { impact: "high" | "medium" | "low" }) => {
  if (impact === "high") return <Flame className="h-3.5 w-3.5 text-red-500" />;
  if (impact === "medium") return <Zap className="h-3.5 w-3.5 text-yellow-500" />;
  return <TrendingDown className="h-3.5 w-3.5 text-green-500" />; // Low impact
};


export function TopNewsCard() {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Newspaper className="mr-2 h-5 w-5 text-primary"/>
          Top News Highlights
        </CardTitle>
        <CardDescription>Latest financial headlines, sorted by impact. Displaying mock data.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full max-h-[300px] pr-3"> {/* Adjust height as needed */}
          <div className="space-y-3">
            {sortedNewsItems.map(item => (
              <div key={item.id} className="pb-2.5 border-b border-border last:border-b-0 bg-muted/20 p-2.5 rounded-md hover:bg-muted/40 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="outline" className="text-xs py-0.5">
                        <ImpactIcon impact={item.impact} />
                        <span className="ml-1.5 capitalize">{item.impact} Impact</span>
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                        <CalendarClock className="h-3 w-3 mr-1" />
                        {item.timestamp}
                    </span>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group text-sm font-medium text-foreground hover:text-accent transition-colors block"
                  data-ai-hint={item.dataAiHint}
                >
                  {item.title}
                  <ExternalLink className="h-3 w-3 ml-1 inline-block opacity-0 group-hover:opacity-70 transition-opacity shrink-0" />
                </a>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {item.source}
                    </p>
                    {item.category && <Badge variant="secondary" className="text-xs py-0.5">{item.category}</Badge>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

