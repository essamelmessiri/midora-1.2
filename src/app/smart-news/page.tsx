import TopBar from "@/components/layout/TopBar";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { TopNewsCard } from "@/components/dashboard/TopNewsCard";

export default function SmartNewsPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <TopNewsCard />
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}
