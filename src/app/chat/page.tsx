import TopBar from "@/components/layout/TopBar";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline">Chat with Synr AI</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 overflow-y-auto">
                {/* Placeholder chat messages */}
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg max-w-xs">
                    Hello! How can I help you today?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                    What are the current gold trends?
                  </div>
                </div>
                 <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg max-w-xs">
                    Gold is currently showing an upward trend due to market volatility.
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex w-full items-center space-x-2">
                  <Input type="text" placeholder="Type your message..." className="flex-1" />
                  <Button type="submit" size="icon" aria-label="Send message">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}
