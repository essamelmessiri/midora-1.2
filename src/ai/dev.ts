
import { config } from 'dotenv';
config();

// Ensure all existing and new flows are imported here to be discoverable by Genkit.
import '@/ai/flows/summarize-market-trends.ts';
import '@/ai/flows/dashboard-chat-flow.ts';
import '@/ai/flows/analyze-news-flow.ts';
import '@/ai/flows/explain-trade-signal-flow.ts';
import '@/ai/flows/generate-trade-reflection-flow.ts';
