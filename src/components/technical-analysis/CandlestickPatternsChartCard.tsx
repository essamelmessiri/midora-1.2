
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { ScanLine, Repeat } from "lucide-react"; // Using ScanLine as a generic pattern icon

export function CandlestickPatternsChartCard() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ScanLine className="mr-2 h-5 w-5 text-primary" />
          Candlestick Patterns (Doji, Engulfing)
        </CardTitle>
        <CardDescription>Identifying key candlestick patterns like Doji and Engulfing formations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden shadow-inner">
           <Image 
            src="https://placehold.co/800x450.png" 
            alt="Candlestick Patterns Chart Placeholder" 
            width={800} 
            height={450}
            className="object-cover w-full h-full"
            data-ai-hint="candlestick patterns"
          />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1 flex items-center">
            <Repeat className="mr-2 h-4 w-4 text-accent" />
            AI Commentary
          </h4>
          <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            Placeholder: AI insights on significant candlestick patterns observed will be displayed here. 
            For example, comments on recent Dojis indicating indecision or Engulfing patterns suggesting momentum.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
