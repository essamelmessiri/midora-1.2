
# SYNR X - Genkit AI Flows

This directory contains all the Genkit flows that power the AI capabilities of the SYNR X trading platform. Each flow is designed to be a modular piece of AI logic that can be called from a backend system.

## Available Flows

Below is a list of the currently implemented flows, their purpose, primary inputs, and expected outputs.

---

### 1. Analyze News Flow (`analyze-news-flow.ts`)

-   **Purpose**: Processes financial news articles (headline and optional content) to extract key insights.
-   **Main Function**: `async function analyzeNewsText(input: NewsAnalysisInput): Promise<NewsAnalysisOutput>`
-   **Key Inputs (`NewsAnalysisInput`)**:
    -   `headline`: string (The main headline of the news article)
    -   `content?`: string (The full content of the news article, if available)
    -   `source?`: string (The source of the news article)
-   **Key Outputs (`NewsAnalysisOutput`)**:
    -   `keyEntities`: string[] (List of key financial/geopolitical entities)
    -   `topics`: string[] (Main topics covered)
    -   `sentiment`: object (`score`: number -1 to 1, `label`: 'positive'|'negative'|'neutral')
    -   `impactEstimation`: object (Estimated impact on a target asset, typically Gold, including `direction`, `magnitude`, `confidence`, `reasoning`)
    -   `summary`: string (Concise AI-generated summary)
-   **Usage Notes**: Useful for understanding the potential market implications of a news item. The `targetAsset` in `impactEstimation` defaults to 'Gold' but the LLM is prompted to infer a more specific asset if the news context strongly suggests it.

---

### 2. Explain Trade Signal Flow (`explain-trade-signal-flow.ts`)

-   **Purpose**: Generates a concise, human-readable explanation for a given trade signal, considering its context. The explanation is limited to a maximum of 30 words.
-   **Main Function**: `async function explainTradeSignal(input: ExplainTradeSignalInput): Promise<ExplainTradeSignalOutput>`
-   **Key Inputs (`ExplainTradeSignalInput`)**:
    -   `asset`: string (e.g., "Gold XAU/USD")
    -   `signalType`: 'BUY' | 'SELL' | 'AVOID'
    -   `confidence`: number (0-1)
    -   `technicalContext?`: string (Summary of technical factors)
    -   `newsContext?`: string (Summary of relevant news)
    -   `sessionInfo?`: string (Market session)
-   **Key Outputs (`ExplainTradeSignalOutput`)**:
    -   `explanation`: string (Max 30-word explanation, e.g., "Suggesting BUY for Gold due to strong bullish technicals and positive market sentiment.")
-   **Usage Notes**: Intended to be called after a trade signal is generated by the decision engine to provide clarity to the user.

---

### 3. Dashboard Chat Flow (`dashboard-chat-flow.ts`)

-   **Purpose**: Powers a conversational AI assistant that can answer user queries about market conditions, recent signals, or general trading topics.
-   **Main Function**: `async function chatWithSynrAI(input: DashboardChatInput): Promise<DashboardChatOutput>`
-   **Key Inputs (`DashboardChatInput`)**:
    -   `userMessage`: string (The user's current message)
    -   `chatHistory?`: array of `{role: 'user'|'model', content: string}` (For conversational context)
    -   `currentSignalContext?`: string (Context about the latest trade signal, if relevant)
-   **Key Outputs (`DashboardChatOutput`)**:
    -   `aiResponse`: string (The chatbot's reply)
-   **Usage Notes**: This flow is designed for interactive chat. The quality of responses, especially regarding specific signals or past events, depends heavily on the context provided in `chatHistory` and `currentSignalContext`.

---

### 4. Generate Trade Reflection Flow (`generate-trade-reflection-flow.ts`)

-   **Purpose**: Analyzes a completed trade (signal + actual outcome) and generates a concise (max 50 words) analytical reflection note.
-   **Main Function**: `async function generateTradeReflection(input: TradeReflectionInput): Promise<TradeReflectionOutput>`
-   **Key Inputs (`TradeReflectionInput`)**:
    -   Details of the original signal (asset, type, price, confidence, technical/news reasons, session).
    -   Details of the trade outcome (actual result, price movement, known reasons for outcome).
-   **Key Outputs (`TradeReflectionOutput`)**:
    -   `reflectionNote`: string (Max 50-word reflection, e.g., "BUY on Gold was successful as strong CPI data pushed prices up. Confidence was appropriate.")
-   **Usage Notes**: Part of the continuous learning system. This flow is called after a trade's outcome is known to generate insights for improving future signal generation or confidence scoring.

---

### 5. Summarize Market Trends Flow (`summarize-market-trends.ts`)

-   **Purpose**: Takes a general description of market conditions (price action, news snippets, sentiment) and provides an AI-generated summary of current trends, potential trade suggestions (defaulting to Gold), and a confidence score for the analysis.
-   **Main Function**: `async function summarizeMarketTrends(input: SummarizeMarketTrendsInput): Promise<SummarizeMarketTrendsOutput>`
-   **Key Inputs (`SummarizeMarketTrendsInput`)**:
    -   `marketData`: string (Text block describing market conditions)
    -   `targetAsset?`: string (Primary asset for focus, defaults to 'Gold')
-   **Key Outputs (`SummarizeMarketTrendsOutput`)**:
    -   `trendSummary`: string (Concise summary of current market trends for the target asset)
    -   `suggestedTrades`: string (Plausible trade suggestions or "No clear trade setup identified.")
    -   `confidence`: number (0-1, AI's confidence in the analysis)
    -   `reasoning`: string (Brief reasoning for the summary and suggestions)
-   **Usage Notes**: Can be used to get a quick AI take on a broad set of market information. The quality of output depends on the richness and relevance of the `marketData` provided.

---

All flows are implemented using Genkit and are intended to be called from a backend system which handles data fetching, storage, and orchestration.
Ensure environment variables, especially those for AI model providers, are correctly configured.
