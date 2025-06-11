
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, CheckCircle, DollarSign, Info, Zap } from "lucide-react";

interface AlertItem {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  timestamp: string;
  type: "pivot" | "entry" | "news" | "signal";
}

const alertsData: AlertItem[] = [
  { id: "1", icon: AlertTriangle, iconColor: "text-yellow-500", title: "Pivot Breakout", description: "XAUUSD broke above H1 Pivot 1955.00", timestamp: "2 mins ago", type: "pivot" },
  { id: "2", icon: CheckCircle, iconColor: "text-green-500", title: "Entry Hit", description: "BUY signal for EURUSD hit entry at 1.0850", timestamp: "5 mins ago", type: "entry" },
  { id: "3", icon: DollarSign, iconColor: "text-red-500", title: "Economic News", description: "US CPI data released: Higher than expected", timestamp: "10 mins ago", type: "news" },
  { id: "4", icon: Zap, iconColor: "text-blue-500", title: "New AI Signal", description: "SELL signal generated for GBPJPY", timestamp: "12 mins ago", type: "signal" },
  { id: "5", icon: Info, iconColor: "text-gray-400", title: "Market Update", description: "Volatility increasing in Asian session", timestamp: "15 mins ago", type: "news" },
];

export function LiveAlertsFeed() {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-accent" />
          Live Alerts Feed
        </CardTitle>
        <CardDescription>Real-time trading alerts and notifications.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full max-h-[300px] pr-3"> {/* Adjust max-h as needed */}
          <div className="space-y-3">
            {alertsData.map(alert => (
              <div key={alert.id} className="flex items-start space-x-3 p-2.5 bg-muted/30 rounded-md">
                <alert.icon className={`h-5 w-5 mt-0.5 shrink-0 ${alert.iconColor}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{alert.title}</h4>
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>
                <Badge variant="outline" className="text-xs capitalize">{alert.type}</Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
