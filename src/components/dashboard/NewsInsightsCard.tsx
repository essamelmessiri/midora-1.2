
"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config"; // Ensure this path is correct

interface NewsInsight {
  id: string;
  headline: string;
  aiSummary: string;
  sentiment: "positive" | "negative" | "neutral";
  expectedGoldReaction: "up" | "down" | "neutral";
  timestamp: Timestamp; // Firestore Timestamp
  confidence?: number; // Optional: 0-1
  source?: string; // Optional: e.g., "Bloomberg"
}

// Mock data - remove or comment out when Firestore connection is live
const mockNewsInsights: NewsInsight[] = [
  {
    id: "1",
    headline: "Fed Hints at Easing Monetary Policy Amidst Economic Slowdown",
    aiSummary: "Potential policy easing could weaken USD, making gold more attractive, thus pushing prices up.",
    sentiment: "positive", // Positive for gold
    expectedGoldReaction: "up",
    timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
    confidence: 0.85,
    source: "MarketWatch",
  },
  {
    id: "2",
    headline: "Strong US Jobs Report Exceeds Expectations, Dollar Surges",
    aiSummary: "A strong dollar typically pressures gold prices downwards as it becomes more expensive for holders of other currencies.",
    sentiment: "negative", // Negative for gold
    expectedGoldReaction: "down",
    timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)), // 5 hours ago
    confidence: 0.92,
    source: "Reuters",
  },
  {
    id: "3",
    headline: "Geopolitical Tensions Rise in Eastern Europe, Sparking Safe-Haven Demand",
    aiSummary: "Increased uncertainty often leads investors to seek safety in gold, boosting its price.",
    sentiment: "positive",
    expectedGoldReaction: "up",
    timestamp: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1 day ago
    confidence: 0.78,
    source: "Bloomberg",
  },
   {
    id: "4",
    headline: "Central Bank Gold Purchases Hit Record High in Q1",
    aiSummary: "Significant central bank buying indicates strong underlying support for gold, likely leading to price increases.",
    sentiment: "positive",
    expectedGoldReaction: "up",
    timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
    confidence: 0.95,
    source: "Financial Times",
  },
];


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
  const [insights, setInsights] = useState<NewsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHighConfidenceOnly, setShowHighConfidenceOnly] = useState(false);

  useEffect(() => {
    // Comment out the mock data line and uncomment Firestore listener when backend is ready
    // setInsights(mockNewsInsights.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()));
    // setIsLoading(false);

    // --- Firestore Listener ---
    setIsLoading(true);
    const q = query(collection(db, "news_insights"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const fetchedInsights: NewsInsight[] = [];
        querySnapshot.forEach((doc) => {
          fetchedInsights.push({ id: doc.id, ...doc.data() } as NewsInsight);
        });
        setInsights(fetchedInsights);
        setIsLoading(false);
        setError(null);
      }, 
      (err) => {
        console.error("Error fetching news insights:", err);
        setError("Failed to load news insights. Displaying mock data as fallback.");
        // Fallback to mock data on error
        setInsights(mockNewsInsights.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()));
        setIsLoading(false);
      }
    );
    return () => unsubscribe(); // Cleanup listener
     // --- End Firestore Listener ---

  }, []);

  const handleFlagIrrelevant = (insightId: string) => {
    console.log("Flagging insight as irrelevant:", insightId);
    // Here you would typically call a Cloud Function or update Firestore
    // to handle this feedback, e.g., moving it to another collection or marking it.
  };

  const filteredInsights = showHighConfidenceOnly 
    ? insights.filter(insight => insight.confidence && insight.confidence > 0.80) 
    : insights;

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
              High Confidence Only (&gt;80%)
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
        {!isLoading && filteredInsights.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              {showHighConfidenceOnly ? "No high confidence insights available." : "No news insights available."}
            </p>
          </div>
        )}
        {!isLoading && filteredInsights.length > 0 && (
          <ScrollArea className="h-full max-h-[350px] pr-3"> {/* Adjust max-h as needed */}
            <div className="space-y-4">
              {filteredInsights.map((item) => (
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
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.timestamp.toDate().toLocaleDateString()} {item.timestamp.toDate().toLocaleTimeString()}</span>
                    {item.confidence && (
                      <Badge variant="outline" className="text-xs">Conf: {(item.confidence * 100).toFixed(0)}%</Badge>
                    )}
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
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
