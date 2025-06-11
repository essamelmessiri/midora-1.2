
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { StretchHorizontal, Repeat } from "lucide-react"; // Using StretchHorizontal for gaps

export function ValueGapsChartCard() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <StretchHorizontal className="mr-2 h-5 w-5 text-primary" />
          Value Gaps (FVG)
        </CardTitle>
        <CardDescription>Highlighting Fair Value Gaps (FVGs) indicating market imbalances.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden shadow-inner">
          <Image 
            src="https://placehold.co/800x450.png" 
            alt="Value Gaps Chart Placeholder" 
            width={800} 
            height={450}
            className="object-cover w-full h-full"
            data-ai-hint="value gaps chart"
          />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1 flex items-center">
            <Repeat className="mr-2 h-4 w-4 text-accent" />
            AI Commentary
          </h4>
          <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            Placeholder: AI analysis on identified Fair Value Gaps. 
            Commentary might include the significance of these gaps as potential areas of interest for future price action.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
