
'use server';
/**
 * @fileOverview A Genkit flow to summarize current market trends and suggest potential trade ideas.
 *
 * This flow takes general market data (text describing price movements, news snippets, sentiment)
 * as input and uses an LLM to provide a summary of trends, suggest possible trades (for Gold by default),
 * and give a confidence score for its analysis.
 *
 * @exports summarizeMarketTrends - The main function to call this flow.
 * @exports SummarizeMarketTrendsInput - Zod schema for the input.
 * @exports SummarizeMarketTrendsOutput - Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMarketTrendsInputSchema = z.object({
  marketData: z
    .string()
    .describe('A text block describing the latest market conditions. This could include price action summaries, key news headlines, sentiment indicators, or technical observations.'),
  targetAsset: z.string().optional().default('Gold').describe('The primary financial asset to focus the trend summary and trade suggestions on. Defaults to Gold.'),
});
export type SummarizeMarketTrendsInput = z.infer<typeof SummarizeMarketTrendsInputSchema>;

const SummarizeMarketTrendsOutputSchema = z.object({
  trendSummary: z.string().describe('A concise summary of the current market trends observed from the input data, focusing on the target asset.'),
  suggestedTrades: z.string().describe('Plausible trade suggestions (e.g., "Consider BUY on Gold if price breaks above 1955 resistance, with SL at 1948.") based on the summarized trends. If no clear trade, state "No clear trade setup identified."'),
  confidence: z
    .number().min(0).max(1)
    .describe('A confidence score (0-1) indicating the AI\'s perceived reliability of its analysis and suggestions based on the provided data.'),
  reasoning: z.string().describe('Brief reasoning behind the trend summary and any trade suggestions.'),
});
export type SummarizeMarketTrendsOutput = z.infer<typeof SummarizeMarketTrendsOutputSchema>;

export async function summarizeMarketTrends(input: SummarizeMarketTrendsInput): Promise<SummarizeMarketTrendsOutput> {
  return summarizeMarketTrendsFlow(input);
}

const summarizeMarketTrendsPrompt = ai.definePrompt({
  name: 'summarizeMarketTrendsPrompt',
  input: {schema: SummarizeMarketTrendsInputSchema},
  output: {schema: SummarizeMarketTrendsOutputSchema},
  prompt: `You are an AI Market Analyst. Your task is to analyze the provided market data, summarize the current trends for {{targetAsset}}, suggest potential trade ideas for {{targetAsset}}, provide a confidence score for your analysis, and briefly state your reasoning.

Provided Market Data:
{{{marketData}}}

Based on this data:
1.  **Trend Summary**: What are the key current trends for {{targetAsset}}? (e.g., bullish, bearish, consolidating, volatile).
2.  **Suggested Trades**: Are there any potential trade setups for {{targetAsset}} (BUY, SELL, or AVOID)? If so, briefly describe (e.g., "Consider BUY if X happens"). If not, state that.
3.  **Confidence**: How confident are you in this analysis and suggestions (0.0 to 1.0)?
4.  **Reasoning**: Briefly explain the basis for your summary and suggestions.

Provide your response in the specified JSON format. Focus on {{targetAsset}}.`,
});

const summarizeMarketTrendsFlow = ai.defineFlow(
  {
    name: 'summarizeMarketTrendsFlow',
    inputSchema: SummarizeMarketTrendsInputSchema,
    outputSchema: SummarizeMarketTrendsOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeMarketTrendsPrompt(input);
    if (!output) {
      throw new Error('Market trend summarization LLM call returned no output. Ensure the model is responding.');
    }
    return output;
  }
);
