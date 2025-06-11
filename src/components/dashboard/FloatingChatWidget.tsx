
"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, SendHorizonal, Loader2, X } from "lucide-react";
import { chatWithSynrAI, DashboardChatInput, DashboardChatOutput } from "@/ai/flows/dashboard-chat-flow";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "initial", sender: "ai", text: "Hello! How can I assist you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: inputValue.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const aiInput: DashboardChatInput = { userMessage: userMessage.text };
      const aiOutput: DashboardChatOutput = await chatWithSynrAI(aiInput);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: "ai", text: aiOutput.aiResponse };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="primary"
            size="icon"
            className="fixed bottom-4 left-4 z-50 rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label="Open Chat"
          >
            <Bot className="h-7 w-7" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-[350px] md:w-[400px] h-[500px] md:h-[600px] p-0 border-none shadow-2xl rounded-lg bg-card flex flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()} // Prevents focus on first input if any
        >
          <Card className="flex flex-col h-full border-0 shadow-none">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-primary" />
                  Synr AI Chat
                </CardTitle>
                <CardDescription>Ask me anything about markets!</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close chat</span>
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-4">
              <ScrollArea ref={scrollAreaRef} className="h-full pr-3">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.text}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2 justify-start">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                       <p className="text-sm text-muted-foreground">Synr is thinking...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} aria-label="Send message">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </>
  );
}
