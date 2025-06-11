
'use server';
/**
 * @fileOverview A Genkit flow for handling chat interactions with the Synr AI assistant.
 *
 * This flow powers a chatbot that can answer user queries about market decisions,
 * summarize news and market mood, and suggest caution zones. It can optionally
 * take context about the current trade signal or chat history.
 *
 * @exports chatWithSynrAI - The main function to call this flow.
 * @exports DashboardChatInput - Zod schema for the input.
 * @exports DashboardChatOutput - Zod schema for the output.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const DashboardChatInputSchema = z.object({
  userMessage: z.string().describe("The user's current message to the AI assistant."),
  chatHistory: z.array(ChatMessageSchema).optional().describe("Previous messages in the conversation, for maintaining context. Each message should have a 'role' ('user' or 'model') and 'content'."),
  currentSignalContext: z.string().optional().describe("Context about the latest trade signal, if relevant to the user's query. E.g., 'Current signal is BUY Gold at 85% confidence due to strong technicals.'"),
});
export type DashboardChatInput = z.infer<typeof DashboardChatInputSchema>;

const DashboardChatOutputSchema = z.object({
  aiResponse: z.string().describe("The AI assistant's response to the user's message."),
});
export type DashboardChatOutput = z.infer<typeof DashboardChatOutputSchema>;

export async function chatWithSynrAI(input: DashboardChatInput): Promise<DashboardChatOutput> {
  return chatWithSynrAIFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'dashboardChatPrompt',
  input: {schema: DashboardChatInputSchema},
  output: {schema: DashboardChatOutputSchema},
  prompt: `You are Synr, a friendly, highly knowledgeable, and concise AI trading assistant for Gold (XAU/USD).
Your primary goal is to provide helpful insights and clear explanations.
You do not have real-time access to live financial data feeds or the ability to execute trades.
When asked about current data or specific predictions, simulate informed opinions or general market knowledge as a trading assistant would.

{{#if chatHistory}}
Conversation History:
{{#each chatHistory}}
{{#if (eq role "user")}}User: {{content}}{{/if}}
{{#if (eq role "model")}}Synr: {{content}}{{/if}}
{{/each}}
{{/if}}

{{#if currentSignalContext}}
Current Trade Signal Context: {{currentSignalContext}}
(Use this context if the user's query seems related to the current signal.)
{{/if}}

User's latest message: {{{userMessage}}}

Based on the user's message, and any provided history or signal context, respond helpfully.
If the user asks "Why this signal?", use the "Current Trade Signal Context" to explain.
If asked to summarize news, provide a general overview based on common financial knowledge, mentioning you don't have live news feeds.
If asked about market mood or caution zones, give general advice (e.g., "Market seems cautious ahead of CPI data," or "Be mindful of increased volatility around major news releases.").
Keep your responses concise and easy to understand.

Synr's response:`,
});

const chatWithSynrAIFlow = ai.defineFlow(
  {
    name: 'chatWithSynrAIFlow',
    inputSchema: DashboardChatInputSchema,
    outputSchema: DashboardChatOutputSchema,
  },
  async (input) => {
    const {output} = await chatPrompt(input);
    if (!output) {
        throw new Error("AI chat response was empty. Ensure the model is responding.");
    }
    return output;
  }
);
