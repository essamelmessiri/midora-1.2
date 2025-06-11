import TopBar from "@/components/layout/TopBar";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AITradeSignalCard } from "@/components/dashboard/AITradeSignalCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function AISignalsPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center items-start">
            <div className="w-full max-w-2xl">
              <AITradeSignalCard />
            </div>
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}
