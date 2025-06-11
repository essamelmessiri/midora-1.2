
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { GitBranch, Repeat } from "lucide-react";

export function MarketStructureChartCard() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <GitBranch className="mr-2 h-5 w-5 text-primary" />
          Market Structure (BOS/CHoCH)
        </CardTitle>
        <CardDescription>Visualizing Break of Structure and Change of Character points.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden shadow-inner">
          <Image 
            src="https://placehold.co/800x450.png" 
            alt="Market Structure Chart Placeholder" 
            width={800} 
            height={450}
            className="object-cover w-full h-full"
            data-ai-hint="market structure chart"
          />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1 flex items-center">
            <Repeat className="mr-2 h-4 w-4 text-accent" />
            AI Commentary
          </h4>
          <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            Placeholder: AI analysis of recent market structure shifts will appear here. 
            This section would typically highlight key BOS and CHoCH events, indicating potential trend continuations or reversals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
