
'use server';
/**
 * @fileOverview A Genkit flow for analyzing financial news articles.
 *
 * This flow processes news text (headline and optional content) to extract:
 * - Key financial or geopolitical entities.
 * - Main topics covered.
 * - Overall sentiment (score and label).
 * - Estimated impact on a key financial asset (typically Gold).
 * - A concise AI-generated summary focusing on financial relevance.
 *
 * @exports analyzeNewsText - The main function to call this flow.
 * @exports NewsAnalysisInput - Zod schema for the input.
 * @exports NewsAnalysisOutput - Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsAnalysisInputSchema = z.object({
  headline: z.string().describe('The main headline of the news article.'),
  content: z.string().optional().describe('The full content of the news article, if available.'),
  source: z.string().optional().describe('The source of the news article (e.g., Bloomberg, Reuters).'),
});
export type NewsAnalysisInput = z.infer<typeof NewsAnalysisInputSchema>;

const SentimentSchema = z.object({
  score: z.number().min(-1).max(1).describe('A numerical sentiment score from -1 (very negative) to 1 (very positive). 0 is neutral.'),
  label: z.enum(['positive', 'negative', 'neutral']).describe('The overall sentiment label.'),
});

const ImpactEstimationSchema = z.object({
  targetAsset: z.string().optional().default('Gold').describe('The financial asset most likely to be impacted (e.g., Gold, USD, SPX). Defaults to Gold if not specified.'),
  direction: z.enum(['up', 'down', 'neutral', 'uncertain']).describe('The estimated direction of impact on the target asset.'),
  magnitude: z.enum(['high', 'medium', 'low', 'uncertain']).optional().describe('The estimated magnitude of the impact.'),
  confidence: z.number().min(0).max(1).optional().describe('Confidence score (0-1) for this impact estimation.'),
  reasoning: z.string().describe('A brief explanation for the estimated impact.'),
});

const NewsAnalysisOutputSchema = z.object({
  keyEntities: z.array(z.string()).describe('List of key financial or geopolitical entities mentioned (e.g., FED, ECB, OPEC, USA, China, inflation, interest rates, specific companies).'),
  topics: z.array(z.string()).describe('Main topics covered in the news (e.g., monetary policy, earnings report, geopolitical tension, economic data).'),
  sentiment: SentimentSchema.describe('Overall sentiment of the news article.'),
  impactEstimation: ImpactEstimationSchema.describe('Estimated impact on a key financial asset. The target asset defaults to Gold unless the news context strongly implies another specific asset (e.g., a company name implies its stock, an oil-specific event implies Oil).'),
  summary: z.string().describe('A concise AI-generated summary of the news article, focusing on its financial relevance and market impact.'),
});
export type NewsAnalysisOutput = z.infer<typeof NewsAnalysisOutputSchema>;

export async function analyzeNewsText(input: NewsAnalysisInput): Promise<NewsAnalysisOutput> {
  return analyzeNewsFlow(input);
}

const newsAnalysisPrompt = ai.definePrompt({
  name: 'newsAnalysisPrompt',
  input: {schema: NewsAnalysisInputSchema},
  output: {schema: NewsAnalysisOutputSchema},
  prompt: `You are an expert financial news analyst AI. Your task is to analyze the provided news article (headline and optional content) and extract key information.

News Source: {{{source}}}
Headline: {{{headline}}}
{{#if content}}
Content: {{{content}}}
{{/if}}

Based on the news, provide the following analysis strictly in the specified JSON output format:
1.  **Key Entities**: Identify major financial or geopolitical entities, concepts, or organizations mentioned (e.g., FED, CPI, specific countries, commodities like Oil, currencies like USD).
2.  **Topics**: Determine the main topics (e.g., monetary policy, fiscal policy, inflation, employment data, geopolitical conflict, company earnings).
3.  **Sentiment**: Assess the overall sentiment of the news *as it pertains to financial markets*. Provide a score between -1 (very negative) and 1 (very positive), and a label ('positive', 'negative', 'neutral').
4.  **Impact Estimation**:
    *   Identify the primary financial asset most likely to be impacted. If the news is generally about the economy or doesn't specify a clear asset, assume the impact is on **Gold (XAU/USD)**. If the news is very specific (e.g., about a particular company's earnings or an oil-specific event), then identify that asset (e.g., the company's stock symbol, Oil).
    *   Estimate the likely direction of impact on this target asset ('up', 'down', 'neutral', 'uncertain').
    *   Optionally, estimate the magnitude ('high', 'medium', 'low', 'uncertain').
    *   Provide a confidence score (0-1) for your impact estimation.
    *   Briefly explain your reasoning for the estimated impact.
5.  **Summary**: Provide a concise summary (around 2-3 sentences) of the news, focusing on its key takeaways for financial markets and its potential impact.

Ensure your entire response is a single JSON object matching the output schema.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const analyzeNewsFlow = ai.defineFlow(
  {
    name: 'analyzeNewsFlow',
    inputSchema: NewsAnalysisInputSchema,
    outputSchema: NewsAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await newsAnalysisPrompt(input);
    if (!output) {
      throw new Error('News analysis LLM call returned no output. Ensure the model is responding correctly and the prompt is clear.');
    }
    return output;
  }
);

