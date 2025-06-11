
"use client";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, HelpCircle } from "lucide-react";

export function SynrQuickChatBox() {
  const exampleQueries = [
    "What's the outlook for XAUUSD?",
    "Summarize today's market news.",
    "Any active trade signals for EURUSD?",
  ];

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="mr-2 h-5 w-5 text-primary" />
          Synr Quick Chat
        </CardTitle>
        <CardDescription>Ask Synr AI anything about the markets.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex w-full items-center space-x-2">
          <Input type="text" placeholder="Ask Synr anything..." className="flex-1" />
          <Button type="submit" size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center">
            <HelpCircle className="mr-1 h-3 w-3"/>
            Example queries:
            </h4>
          <ul className="space-y-1">
            {exampleQueries.map((query, index) => (
              <li key={index} className="text-xs text-foreground p-1.5 bg-muted/30 hover:bg-muted/70 rounded-md cursor-pointer transition-colors">
                {query}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/chat" passHref legacyBehavior>
          <Button variant="outline" className="w-full">
            Go to Full Chat Page
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
