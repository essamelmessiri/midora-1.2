"use client";
import { Bell, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import AppSidebar from "./AppSidebar"; // Import AppSidebar here
import { useSidebar } from "@/components/ui/sidebar";

export default function TopBar() {
  const { toggleSidebar, isMobile } = useSidebar();
  const sessions = ["Asia", "Europe", "US"];
  // TODO: Make session dynamic. For now, cycle through them for demo.
  const currentSession = sessions[Math.floor(Date.now() / 5000) % sessions.length];


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        {isMobile && (
           <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <AppSidebar />
            </SheetContent>
          </Sheet>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        <Logo />
      </div>

      <div className="flex-1 text-center text-sm font-medium">
        Current Session: <span style={{ color: 'hsl(var(--accent))' }}>{currentSession}</span>
      </div>

      <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>
    </header>
  );
}
