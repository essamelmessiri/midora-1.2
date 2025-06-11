import TopBar from "@/components/layout/TopBar";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MarketAnalysisPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Market Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Market Analysis content will be displayed here.</p>
                <img src="https://placehold.co/800x400.png" alt="Placeholder chart" className="mt-4 rounded-md shadow-md" data-ai-hint="finance chart" />
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}
