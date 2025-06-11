import TopBar from "@/components/layout/TopBar";
import AppSidebar from "@/components/layout/AppSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="font-headline">Settings</CardTitle>
                <CardDescription>Manage your account and application preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Profile</h3>
                  <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Demo User" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="user@example.com" />
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-foreground">Notifications</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                      <span>Email Notifications</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                        Receive updates and alerts via email.
                      </span>
                    </Label>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                      <span>Push Notifications</span>
                       <span className="font-normal leading-snug text-muted-foreground">
                        Get real-time alerts on your device.
                      </span>
                    </Label>
                    <Switch id="push-notifications" />
                  </div>
                </div>
                 <Separator />
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </div>
  );
}
