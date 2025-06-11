"use client";
import { useState } from "react";
import { summarizeMarketTrends, SummarizeMarketTrendsInput, SummarizeMarketTrendsOutput } from "@/ai/flows/summarize-market-trends";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FormSchema = z.object({
  marketData: z.string().min(10, { message: "Market data must be at least 10 characters." }),
});
type FormData = z.infer<typeof FormSchema>;

export function AITradeSignalCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<SummarizeMarketTrendsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAiResponse(null);
    try {
      const input: SummarizeMarketTrendsInput = { marketData: data.marketData };
      const response = await summarizeMarketTrends(input);
      setAiResponse(response);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>AI Trade Signal Summary</CardTitle>
        <CardDescription>Enter market data to get AI-powered trade insights.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="marketData" className="mb-2 block">Market Data</Label>
            <Textarea
              id="marketData"
              placeholder="Paste relevant market news, price movements, sentiment indicators..."
              className="min-h-[100px]"
              {...register("marketData")}
              disabled={isLoading}
            />
            {errors.marketData && <p className="text-sm text-destructive mt-1">{errors.marketData.message}</p>}
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {aiResponse && (
            <div className="space-y-4 rounded-md border p-4 bg-card/50">
              <div>
                <h4 className="font-semibold text-primary">Market Summary:</h4>
                <p className="text-sm text-muted-foreground">{aiResponse.summary}</p>
              </div>
              <div>
                <h4 className="font-semibold text-accent">Suggested Trades:</h4>
                <p className="text-sm text-muted-foreground">{aiResponse.suggestedTrades}</p>
              </div>
              <div>
                <h4 className="font-semibold">Confidence:</h4>
                <p className="text-sm text-muted-foreground">{(aiResponse.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Analyzing..." : "Get AI Signals"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
