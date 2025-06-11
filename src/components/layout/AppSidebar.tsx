
"use client";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BarChart3, // Used for Market Analysis
  BrainCircuit,
  Newspaper,
  MessageCircle,
  Settings,
  Github,
  LineChart // New icon for Technical Analysis
} from "lucide-react";
import { Logo } from "./Logo";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/market-analysis", label: "Market Analysis", icon: BarChart3 },
  { href: "/technical-analysis", label: "Technical Analysis", icon: LineChart }, // New Item
  { href: "/ai-signals", label: "AI Signals", icon: BrainCircuit },
  { href: "/smart-news", label: "Smart News", icon: Newspaper },
  { href: "/chat", label: "Chat with Synr", icon: MessageCircle },
];

const settingsItem = { href: "/settings", label: "Settings", icon: Settings };

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r"
      defaultOpen={typeof window !== 'undefined' ? window.innerWidth > 768 : true}
    >
      <SidebarHeader className="h-16 flex items-center justify-center md:justify-start md:px-4">
        {/* Logo is now in TopBar for desktop, this space can be used for mobile header if sidebar is standalone */}
        <div className="md:hidden"> 
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-grow">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: "right", align: "center" }}
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <Separator className="my-2" />
        <SidebarMenu>
          <SidebarMenuItem>
             <Link href={settingsItem.href} passHref legacyBehavior>
                <SidebarMenuButton
                    isActive={pathname === settingsItem.href}
                    tooltip={{ children: settingsItem.label, side: "right", align: "center" }}
                    aria-label={settingsItem.label}
                >
                    <settingsItem.icon className="h-5 w-5" />
                    <span>{settingsItem.label}</span>
                </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
