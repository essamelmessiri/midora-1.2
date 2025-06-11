// Test data and utilities for AI flows and components

export const mockMarketData = `
Gold (XAU/USD) is currently trading at $1,952.30, showing strong bullish momentum after breaking above the key resistance level at $1,950. 

Technical Analysis:
- RSI is at 65, indicating healthy upward momentum without being overbought
- 20-period EMA has crossed above 50-period EMA, confirming bullish trend
- Order block identified at $1,948-$1,950 level providing strong support
- Fair Value Gap (FVG) detected between $1,960-$1,962 acting as potential target

Market Sentiment:
- US Dollar weakening following dovish Fed comments
- Inflation concerns driving safe-haven demand
- Geopolitical tensions in Eastern Europe supporting gold prices

Session Analysis:
- Asian session showed consolidation around $1,950
- European session broke resistance with strong volume
- US session expected to continue momentum with key economic data releases

Risk Factors:
- Strong US jobs data could reverse current trend
- Fed policy meeting next week may impact direction
- Technical resistance at $1,965 psychological level
`;

export const mockNewsHeadlines = [
  {
    headline: "Federal Reserve Signals Potential Policy Shift Amid Economic Uncertainty",
    content: "The Federal Reserve indicated today that it may consider adjusting its monetary policy stance in response to evolving economic conditions. Fed Chair Jerome Powell emphasized the central bank's commitment to data-dependent decision-making, particularly regarding inflation targets and employment metrics. Market analysts interpret this as a potentially dovish shift that could impact USD strength and boost gold prices.",
    source: "Reuters"
  },
  {
    headline: "Geopolitical Tensions Escalate in Eastern Europe, Boosting Safe-Haven Assets",
    content: "Rising tensions between major powers in Eastern Europe have led to increased demand for safe-haven assets, with gold prices surging to multi-week highs. Investors are seeking refuge in precious metals amid uncertainty about potential economic sanctions and their global impact. The situation has also affected energy markets and currency stability.",
    source: "Bloomberg"
  },
  {
    headline: "US Inflation Data Shows Persistent Price Pressures Despite Fed Efforts",
    content: "The latest Consumer Price Index (CPI) data revealed that inflation remains above the Federal Reserve's 2% target, despite aggressive monetary policy measures. Core inflation, excluding food and energy, showed particular strength in housing and services sectors. This persistent inflation is driving renewed interest in gold as an inflation hedge.",
    source: "Financial Times"
  }
];

export const mockTradeSignals = [
  {
    asset: "XAU/USD",
    signalType: "BUY" as const,
    entryZone: "1950.50 - 1952.00",
    stopLoss: "1945.00",
    target: "1975.00",
    confidence: 0.85,
    technicalContext: "EMA crossover, RSI oversold recovery, Order block support at 1950",
    newsContext: "Fed dovish comments, inflation concerns, geopolitical tensions",
    sessionInfo: "US Session"
  },
  {
    asset: "XAU/USD",
    signalType: "SELL" as const,
    entryZone: "1965.00 - 1967.00",
    stopLoss: "1972.00",
    target: "1945.00",
    confidence: 0.72,
    technicalContext: "Double top formation, RSI overbought, resistance at 1965",
    newsContext: "Strong USD data, hawkish Fed member comments",
    sessionInfo: "London Session"
  }
];

export const mockTradeReflections = [
  {
    asset: "XAU/USD",
    signalType: "BUY" as const,
    signalPrice: 1951.25,
    predictedDirection: "up" as const,
    confidence: 0.85,
    keyTechnicalReasons: "EMA crossover, Order block support, RSI oversold recovery",
    keyNewsEvents: "Fed dovish comments, inflation data above expectations",
    sessionInfo: "US Session",
    actualOutcome: "Win - Hit Take Profit at 1975.50",
    outcomePriceRange: "Price reached high of 1976.20 before closing at target",
    reasonForActualOutcome: "Market responded positively to Fed comments as expected"
  },
  {
    asset: "XAU/USD",
    signalType: "SELL" as const,
    signalPrice: 1966.75,
    predictedDirection: "down" as const,
    confidence: 0.72,
    keyTechnicalReasons: "Double top formation, RSI overbought",
    keyNewsEvents: "Strong US jobs data, hawkish Fed member speech",
    sessionInfo: "London Session",
    actualOutcome: "Loss - Hit Stop Loss at 1972.00",
    outcomePriceRange: "Price initially moved down to 1963.50 then reversed sharply",
    reasonForActualOutcome: "Unexpected geopolitical news caused safe-haven buying"
  }
];

// Utility functions for testing
export const generateRandomMarketData = () => {
  const scenarios = [
    "bullish momentum with strong technical support",
    "bearish pressure from USD strength",
    "consolidation around key psychological levels",
    "breakout above resistance with high volume",
    "pullback to test previous support levels"
  ];
  
  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const currentPrice = (1950 + Math.random() * 50).toFixed(2);
  
  return `Gold (XAU/USD) is currently showing ${randomScenario} at $${currentPrice}. Market sentiment remains cautious ahead of key economic data releases.`;
};

export const simulateAIFlowDelay = (minMs: number = 500, maxMs: number = 2000) => {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};