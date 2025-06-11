
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, MinusCircle, Gauge, Zap, FileText } from "lucide-react"; 

export function MarketSentimentCard() {
  const [sentimentValue, setSentimentValue] = useState(75); // 0-100
  const [sentimentLabel, setSentimentLabel] = useState("Confident");
  const [sessionMood, setSessionMood] = useState("Cautious in US session");
  const [sentimentExplanation, setSentimentExplanation] = useState("Sentiment is driven by a mix of volume and recent price action showing buyer interest."); // Placeholder

  useEffect(() => {
    const interval = setInterval(() => {
      const newSentiment = Math.floor(Math.random() * 101);
      setSentimentValue(newSentiment);

      let newLabel = "Uncertain";
      let newExplanation = "Market conditions are mixed, with no clear directional bias from key indicators.";
      if (newSentiment > 75) {
        newLabel = "Greedy";
        newExplanation = "High buying volume and strong upward momentum suggest a greedy market sentiment.";
      } else if (newSentiment > 55) {
        newLabel = "Confident";
        newExplanation = "Positive momentum and stable volume indicate confident market participation.";
      } else if (newSentiment < 25) {
        newLabel = "Fear";
        newExplanation = "Increased volatility and selling pressure point towards a fearful market sentiment.";
      } else if (newSentiment < 45) { // Between 25 and 45 is Fearful, but let's refine
        newLabel = "Fearful"; // A step between Fear and Uncertain
         newExplanation = "Notable selling interest and volatility spikes suggest growing market fear.";
      }
      setSentimentLabel(newLabel);
      setSentimentExplanation(newExplanation);
      
      const sessions = ["Asia", "Europe", "US"];
      const moods = ["Optimistic", "Cautious", "Neutral", "Volatile"];
      const currentSession = sessions[Math.floor(Math.random() * sessions.length)];
      const currentMood = moods[Math.floor(Math.random() * moods.length)];
      setSessionMood(`${currentMood} in ${currentSession} session`);

    }, 60000); // Update every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = () => {
    if (sentimentValue > 75) return "text-red-500"; // Greedy
    if (sentimentValue > 55) return "text-green-500"; // Confident
    if (sentimentValue < 25) return "text-orange-600"; // Fear
    if (sentimentValue < 45) return "text-orange-500"; // Fearful
    return "text-yellow-500"; // Uncertain (45-55)
  };
  
  const getSentimentIcon = () => {
    if (sentimentValue > 75) return <TrendingUp className="h-6 w-6" />; 
    if (sentimentValue > 55) return <TrendingUp className="h-6 w-6" />; 
    if (sentimentValue < 25) return <TrendingDown className="h-6 w-6" />;
    if (sentimentValue < 45) return <TrendingDown className="h-6 w-6" />;
    return <MinusCircle className="h-6 w-6" />; 
  };

  // Adjusted for a half-dial feel
  const sentimentLevels = [
    { label: "Fear", value: 0, color: "bg-orange-600" },
    { label: "Fearful", value: 25, color: "bg-orange-500"},
    { label: "Uncertain", value: 50, color: "bg-yellow-500" },
    { label: "Confident", value: 75, color: "bg-green-500" },
    { label: "Greedy", value: 100, color: "bg-red-500" },
  ];

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gauge className="mr-2 h-5 w-5 text-primary" />
          Market Sentiment
        </CardTitle>
        <CardDescription>{sessionMood}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-around items-center space-y-3 pt-2">
        <div className={`text-center text-2xl font-bold ${getSentimentColor()} flex items-center`}>
          {getSentimentIcon()}
          <span className="ml-2">{sentimentLabel}</span>
        </div>
        
        <div className="w-full px-2">
          <Progress value={sentimentValue} aria-label={`Market sentiment: ${sentimentLabel} at ${sentimentValue}%`} className="h-5 rounded-full"/>
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5 px-1">
            {sentimentLevels.map((level, index) => (
               <div key={level.label} className="flex flex-col items-center text-center" style={{ flexBasis: index === 0 || index === sentimentLevels.length -1 ? 'auto': '20%'}}>
                 <span className="font-medium">{level.label}</span>
                 <span>|</span>
               </div>
            ))}
          </div>
        </div>
        <Badge variant="outline" className="text-md py-1 px-3">
          Index: {sentimentValue} / 100
        </Badge>
        <div className="text-center space-y-1 px-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center justify-center">
                <FileText className="mr-1.5 h-4 w-4" />
                Explanation
            </h4>
            <p className="text-xs text-foreground p-2 bg-muted/30 rounded-md min-h-[40px]">
                {sentimentExplanation}
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
