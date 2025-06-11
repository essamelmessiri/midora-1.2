
import TopBar from "@/components/layout/TopBar";
import AppSidebar from "@/components/layout/AppSidebar";
import { GoldPriceChartCard } from "@/components/dashboard/GoldPriceChartCard";
import { MarketSentimentCard } from "@/components/dashboard/MarketSentimentCard";
import { TopNewsCard } from "@/components/dashboard/TopNewsCard";
import { SidebarInset } from "@/components/ui/sidebar";

// New Dashboard Cards
import { AITradeSignalSummaryCard } from "@/components/dashboard/AITradeSignalSummaryCard";
import { SynrQuickChatBox } from "@/components/dashboard/SynrQuickChatBox";
import { RecentAIAnalysisSnapshot } from "@/components/dashboard/RecentAIAnalysisSnapshot";
import { LiveAlertsFeed } from "@/components/dashboard/LiveAlertsFeed";
import { FloatingChatWidget } from "@/components/dashboard/FloatingChatWidget";
import { NewsInsightsCard } from "@/components/dashboard/NewsInsightsCard"; // Import the new card


export default function Home() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Adjusted Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              {/* Row 1 */}
              <div className="lg:col-span-4 md:col-span-2 h-full">
                <GoldPriceChartCard />
              </div>
              <div className="lg:col-span-2 md:col-span-2 h-full">
                <MarketSentimentCard />
              </div>

              {/* Row 2: TopNews, AI Trade Signal, News Insights */}
              <div className="lg:col-span-2 md:col-span-1 h-full">
                <TopNewsCard />
              </div>
              <div className="lg:col-span-2 md:col-span-1 h-full">
                <AITradeSignalSummaryCard />
              </div>
              <div className="lg:col-span-2 md:col-span-2 h-full"> {/* Adjusted span for md */}
                <NewsInsightsCard />
              </div>
              
              {/* Row 3: Recent AI Analysis, Live Alerts */}
              <div className="lg:col-span-3 md:col-span-1 h-full">
                <RecentAIAnalysisSnapshot />
              </div>
              <div className="lg:col-span-3 md:col-span-1 h-full">
                <LiveAlertsFeed />
              </div>

              {/* Row 4: Synr Quick Chat Box */}
              <div className="lg:col-span-6 md:col-span-2 h-full">
                <SynrQuickChatBox />
              </div>
            </div>
          </main>
        </SidebarInset>
        <FloatingChatWidget />
      </div>
    </div>
  );
}
