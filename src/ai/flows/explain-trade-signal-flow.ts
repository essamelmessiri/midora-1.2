
'use server';
/**
 * @fileOverview A Genkit flow for generating human-like explanations for trade signals.
 *
 * This flow receives trade signal details, contextual information (technical, news, session),
 * and outputs a concise, human-readable explanation for the decision, limited to a maximum of 30 words.
 *
 * @exports explainTradeSignal - The main function to call this flow.
 * @exports ExplainTradeSignalInput - Zod schema for the input.
 * @exports ExplainTradeSignalOutput - Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTradeSignalInputSchema = z.object({
  asset: z.string().describe('The financial asset for the signal (e.g., Gold XAU/USD, EURUSD).'),
  signalType: z.enum(['BUY', 'SELL', 'AVOID']).describe('The type of trade signal issued (BUY, SELL, AVOID).'),
  confidence: z.number().min(0).max(1).describe('The confidence score of the signal (0-1).'),
  technicalContext: z.string().optional().describe('A brief summary of key technical indicators or patterns supporting the signal (e.g., "EMA crossover, RSI overbought").'),
  newsContext: z.string().optional().describe('A brief summary of relevant news events or sentiment influencing the signal (e.g., "Positive inflation report, Fed dovish comments").'),
  sessionInfo: z.string().optional().describe('The market session during which the signal is active (e.g., London, New York, Asia).'),
});
export type ExplainTradeSignalInput = z.infer<typeof ExplainTradeSignalInputSchema>;

const ExplainTradeSignalOutputSchema = z.object({
  explanation: z.string().max(200).describe('A concise, human-readable explanation for the trade signal, maximum 30 words. Example: "Suggesting BUY for Gold due to strong bullish technicals and positive market sentiment during the US session."'),
});
export type ExplainTradeSignalOutput = z.infer<typeof ExplainTradeSignalOutputSchema>;

export async function explainTradeSignal(input: ExplainTradeSignalInput): Promise<ExplainTradeSignalOutput> {
  return explainTradeSignalFlow(input);
}

const explanationPrompt = ai.definePrompt({
  name: 'explainTradeSignalPrompt',
  input: {schema: ExplainTradeSignalInputSchema},
  output: {schema: ExplainTradeSignalOutputSchema},
  prompt: `You are an AI Trade Analyst. Your task is to generate a concise, human-readable explanation for a given trade signal.
The explanation must be **maximum 30 words**.

Trade Signal Details:
Asset: {{{asset}}}
Signal Type: {{{signalType}}}
Confidence: {{#if confidence}}{{multiply confidence 100 |toFixed 0}}%{{else}}N/A{{/if}}
{{#if technicalContext}}Technical Context: {{{technicalContext}}}{{/if}}
{{#if newsContext}}News Context: {{{newsContext}}}{{/if}}
{{#if sessionInfo}}Market Session: {{{sessionInfo}}}{{/if}}

Based on these details, provide a clear and brief explanation.
Focus on the most critical factors.
Example: "Recommending BUY for Gold due to bullish EMA crossover and positive CPI news in the US session."
Another example: "AVOID trade on EURUSD due to conflicting technical signals and upcoming high-impact news."

Your explanation (max 30 words):`,
});

const explainTradeSignalFlow = ai.defineFlow(
  {
    name: 'explainTradeSignalFlow',
    inputSchema: ExplainTradeSignalInputSchema,
    outputSchema: ExplainTradeSignalOutputSchema,
  },
  async (input) => {
    const {output} = await explanationPrompt(input);
    if (!output) {
      throw new Error('Trade signal explanation LLM call returned no output. Ensure the model is responding correctly.');
    }
    // Enforce word limit more strictly if needed, though prompt aims for it.
    // const words = output.explanation.split(' ').length;
    // if (words > 30) {
    //   // Could truncate or throw an error, for now, we rely on the prompt.
    // }
    return output;
  }
);
