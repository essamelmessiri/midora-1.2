
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { LocateFixed, Repeat } from "lucide-react"; // Using LocateFixed for pivots

export function PivotLevelsChartCard() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <LocateFixed className="mr-2 h-5 w-5 text-primary" />
          Daily & 4H Pivot Levels
        </CardTitle>
        <CardDescription>Displaying key daily and 4-hour pivot points for support/resistance analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden shadow-inner">
          <Image 
            src="https://placehold.co/800x450.png" 
            alt="Pivot Levels Chart Placeholder" 
            width={800} 
            height={450}
            className="object-cover w-full h-full"
            data-ai-hint="pivot levels chart"
          />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1 flex items-center">
            <Repeat className="mr-2 h-4 w-4 text-accent" />
            AI Commentary
          </h4>
          <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
            Placeholder: AI commentary on price interaction with daily and 4H pivot levels. 
            This would include observations on tests, rejections, or breakouts of these key levels.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
