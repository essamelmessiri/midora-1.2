
import TopBar from "@/components/layout/TopBar";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { MarketStructureChartCard } from "@/components/technical-analysis/MarketStructureChartCard";
import { CandlestickPatternsChartCard } from "@/components/technical-analysis/CandlestickPatternsChartCard";
import { PivotLevelsChartCard } from "@/components/technical-analysis/PivotLevelsChartCard";
import { ValueGapsChartCard } from "@/components/technical-analysis/ValueGapsChartCard";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TechnicalAnalysisPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <SidebarInset>
          <ScrollArea className="flex-1">
            <main className="p-4 md:p-6 space-y-6">
              <h1 className="text-3xl font-bold text-foreground font-headline">Technical Analysis</h1>
              
              <MarketStructureChartCard />
              <CandlestickPatternsChartCard />
              <PivotLevelsChartCard />
              <ValueGapsChartCard />

            </main>
          </ScrollArea>
        </SidebarInset>
      </div>
    </div>
  );
}
