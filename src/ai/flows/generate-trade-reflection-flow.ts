
'use server';
/**
 * @fileOverview A Genkit flow for generating self-reflection notes on trade signals after their outcome.
 *
 * This flow analyzes a trade signal and its actual outcome to produce a concise analytical reflection.
 * The reflection aims to explain potential reasons for success or failure and highlight insights learned,
 * in a maximum of 50 words.
 *
 * @exports generateTradeReflection - The main function to call this flow.
 * @exports TradeReflectionInput - Zod schema for the input.
 * @exports TradeReflectionOutput - Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TradeReflectionInputSchema = z.object({
  asset: z.string().describe('The financial asset traded (e.g., Gold XAU/USD, EURUSD).'),
  signalType: z.enum(['BUY', 'SELL', 'AVOID']).describe('The type of trade signal issued.'),
  signalPrice: z.number().optional().describe('The price at which the signal was generated or triggered.'),
  predictedDirection: z.enum(['up', 'down', 'neutral', 'uncertain']).describe('The predicted direction of price movement by the signal.'),
  confidence: z.number().min(0).max(1).describe('The confidence score of the original signal (0-1).'),
  keyTechnicalReasons: z.string().optional().describe('A brief summary of key technical indicators or patterns supporting the signal at the time it was issued.'),
  keyNewsEvents: z.string().optional().describe('A brief summary of relevant news events or sentiment around the time of the signal.'),
  sessionInfo: z.string().optional().describe('The market session during which the signal was active (e.g., London, New York).'),
  actualOutcome: z.string().describe('The actual result of the trade (e.g., "Win - Hit Take Profit at 1975", "Loss - Hit Stop Loss at 1945", "Neutral - Exited at Breakeven", "Loss - Reversed against prediction after initial move").'),
  outcomePriceRange: z.string().optional().describe('A summary of how the price moved after the signal (e.g., "Price reached a high of 1980 and a low of 1948 before closing trade period.", "Price moved +15 pips then reversed to -30 pips.").'),
  reasonForActualOutcome: z.string().optional().describe('Any pre-identified reason for the outcome, if known (e.g., "Unexpected news event caused reversal", "Market structure shifted contrary to expectation").'),
});
export type TradeReflectionInput = z.infer<typeof TradeReflectionInputSchema>;

const TradeReflectionOutputSchema = z.object({
  reflectionNote: z.string().max(300).describe('A concise, analytical reflection (max 50 words) on the trade signal and its outcome. It should explain potential reasons for success or failure and insights learned. Example: "BUY on Gold was successful due to strong technicals aligning with post-CPI bullish sentiment. Confidence was appropriate." or "SELL on Gold failed as unexpected dovish FED comments reversed the bearish trend. News impact was underestimated."'),
});
export type TradeReflectionOutput = z.infer<typeof TradeReflectionOutputSchema>;

export async function generateTradeReflection(input: TradeReflectionInput): Promise<TradeReflectionOutput> {
  return generateTradeReflectionFlow(input);
}

const reflectionPrompt = ai.definePrompt({
  name: 'tradeReflectionPrompt',
  input: {schema: TradeReflectionInputSchema},
  output: {schema: TradeReflectionOutputSchema},
  prompt: `You are an AI Trade Analyst. Your task is to reflect on a past trade signal and its outcome.
Analyze the provided information and generate a concise (strictly maximum 50 words) reflection note.
The note should aim to explain why the trade might have performed as it did, considering the initial reasoning, market behavior, and actual outcome.
Highlight any key learnings, confirmations, or misjudgments.

Trade Details at time of Signal:
Asset: {{{asset}}}
Signal Type: {{{signalType}}}
{{#if signalPrice}}Signal Price: {{{signalPrice}}}{{/if}}
Predicted Direction: {{{predictedDirection}}}
Signal Confidence: {{#if confidence}}{{multiply confidence 100 |toFixed 0}}%{{else}}N/A{{/if}}
{{#if keyTechnicalReasons}}Original Technical Rationale: {{{keyTechnicalReasons}}}{{/if}}
{{#if keyNewsEvents}}Original News Context: {{{keyNewsEvents}}}{{/if}}
{{#if sessionInfo}}Session when signal was active: {{{sessionInfo}}}{{/if}}

Trade Outcome:
Actual Result: {{{actualOutcome}}}
{{#if outcomePriceRange}}Observed Price Movement Summary: {{{outcomePriceRange}}}{{/if}}
{{#if reasonForActualOutcome}}Identified Reason for Outcome (if any): {{{reasonForActualOutcome}}}{{/if}}

Based on all this, provide your reflection note (max 50 words):`,
});

const generateTradeReflectionFlow = ai.defineFlow(
  {
    name: 'generateTradeReflectionFlow',
    inputSchema: TradeReflectionInputSchema,
    outputSchema: TradeReflectionOutputSchema,
  },
  async (input) => {
    const {output} = await reflectionPrompt(input);
    if (!output) {
      throw new Error('Trade reflection LLM call returned no output. Ensure the model is responding.');
    }
    return output;
  }
);
