import { collection, query, orderBy, onSnapshot, Timestamp, QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface NewsInsight {
  id: string;
  headline: string;
  aiSummary: string;
  sentiment: "positive" | "negative" | "neutral";
  expectedGoldReaction: "up" | "down" | "neutral";
  timestamp: Timestamp;
  confidence?: number;
  source?: string;
}

export interface NewsInsightsService {
  subscribeToInsights: (callback: (insights: NewsInsight[]) => void, onError?: (error: Error) => void) => () => void;
  flagAsIrrelevant: (insightId: string) => Promise<void>;
}

class FirebaseNewsInsightsService implements NewsInsightsService {
  subscribeToInsights(
    callback: (insights: NewsInsight[]) => void, 
    onError?: (error: Error) => void
  ): () => void {
    const q = query(collection(db, "news_insights"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const insights: NewsInsight[] = [];
        querySnapshot.forEach((doc) => {
          insights.push({ id: doc.id, ...doc.data() } as NewsInsight);
        });
        callback(insights);
      }, 
      (error) => {
        console.error("Error fetching news insights:", error);
        if (onError) {
          onError(new Error(`Failed to load news insights: ${error.message}`));
        }
      }
    );

    return unsubscribe;
  }

  async flagAsIrrelevant(insightId: string): Promise<void> {
    // TODO: Implement flagging logic (e.g., move to another collection or mark as irrelevant)
    console.log("Flagging insight as irrelevant:", insightId);
    // This could call a Cloud Function or update Firestore directly
  }
}

// Mock service for development/fallback
class MockNewsInsightsService implements NewsInsightsService {
  private mockData: NewsInsight[] = [
    {
      id: "1",
      headline: "Fed Hints at Easing Monetary Policy Amidst Economic Slowdown",
      aiSummary: "Potential policy easing could weaken USD, making gold more attractive, thus pushing prices up.",
      sentiment: "positive",
      expectedGoldReaction: "up",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
      confidence: 0.85,
      source: "MarketWatch",
    },
    {
      id: "2",
      headline: "Strong US Jobs Report Exceeds Expectations, Dollar Surges",
      aiSummary: "A strong dollar typically pressures gold prices downwards as it becomes more expensive for holders of other currencies.",
      sentiment: "negative",
      expectedGoldReaction: "down",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)),
      confidence: 0.92,
      source: "Reuters",
    },
    {
      id: "3",
      headline: "Geopolitical Tensions Rise in Eastern Europe, Sparking Safe-Haven Demand",
      aiSummary: "Increased uncertainty often leads investors to seek safety in gold, boosting its price.",
      sentiment: "positive",
      expectedGoldReaction: "up",
      timestamp: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      confidence: 0.78,
      source: "Bloomberg",
    },
  ];

  subscribeToInsights(callback: (insights: NewsInsight[]) => void): () => void {
    // Simulate real-time updates with mock data
    setTimeout(() => {
      callback(this.mockData);
    }, 100);

    return () => {}; // No cleanup needed for mock
  }

  async flagAsIrrelevant(insightId: string): Promise<void> {
    console.log("Mock: Flagging insight as irrelevant:", insightId);
  }
}

// Export service instance with fallback to mock
export const newsInsightsService: NewsInsightsService = 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
    ? new FirebaseNewsInsightsService() 
    : new MockNewsInsightsService();