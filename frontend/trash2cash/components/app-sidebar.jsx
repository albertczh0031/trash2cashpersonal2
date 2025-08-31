"use client";

import { useEffect, useState } from "react";
import {
  ChartNoAxesCombined,
  History,
  CirclePercent,
  Store,
  User,
  Camera,
  Newspaper,
  House,
  LogOut,
} from "lucide-react";
import { SignoutButton } from "@/components/SignoutButton";
import { refreshAccessToken } from "@/utils/refreshAccessToken";
import { useChatNotifications } from "@/components/providers/ChatNotificationProvider";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const { unreadCounts, activeViewingChatroom } = useChatNotifications();

  const unreadChat = Object.entries(unreadCounts)
    .filter(([chatroomId]) => chatroomId !== activeViewingChatroom?.toString())
    .reduce((total, [, count]) => total + count, 0);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        let token = localStorage.getItem("access");
        if (!token) throw new Error("No authentication token found");

        let response = await fetch("https://trash2cashpersonal.onrender.com/api/user-role/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          const access = await refreshAccessToken();
          response = await fetch("https://trash2cashpersonal.onrender.com/api/user-role/", {
            headers: { Authorization: `Bearer ${access}` },
          });
        }

        if (!response.ok) throw new Error("Failed to fetch user role");

        const data = await response.json();
        setRole(data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  const userMenu = [
    { title: "HomePage", url: "/dashboard", icon: House },
    { title: "Update Password", url: "/account/change-password", icon: User },
    { title: "Snap to Recycle", url: "/upload", icon: Camera },
    { title: "Rewards", url: "/rewards", icon: CirclePercent },
    { title: "History", url: "/appointment", icon: History },
    { title: "Statistics", url: "/statistics", icon: ChartNoAxesCombined },
    { title: "Market", url: "/market", icon: Store },
  ];

  const adminMenu = [
    { title: "HomePage", url: "/dashboard", icon: House },
    { title: "Update Password", url: "/account/change-password", icon: User },
    { title: "Manage Center Details", url: "/recycling-centres/1", icon: Store },
    { title: "Customer Appointment", url: "/appointment-view", icon: Newspaper },
    { title: "Statistics", url: "/statistics", icon: ChartNoAxesCombined },
    { title: "Market", url: "#", icon: Store },
  ];

  const items = role === "admin" ? adminMenu : userMenu;

  if (loading) return <div>Loading...</div>;

  return (
    <Sidebar
      collapsible="icon"
      className="bg-gradient-to-br from-green-50 to-green-100 border-r border-green-200 shadow-md"
    >
      <SidebarContent>
        <SidebarGroup>
          {/* Expanded logo + title */}
<SidebarGroupLabel className="text-3xl font-bold text-center justify-center group-data-[collapsible=icon]:hidden">
  Trash2Cash
</SidebarGroupLabel>


          <div className="flex gap-4 items-center justify-center mb-2 group-data-[collapsible=icon]:hidden">
            <div className="relative w-28 h-28 group-data-[collapsible=icon]:hidden">
              <Image
                src="/icons/zerowastesolutions.png"
                width={112}
                height={112}
                priority
                alt="Zero Waste Solutions"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>

{/* Collapsed small logo centered */}
<div className="hidden group-data-[collapsible=icon]:flex justify-center mb-2">
  <div className="w-6 flex items-center justify-center">
    <Image
      src="/icons/zerowastesolutions.png"
      width={24}
      height={24}
      alt="Zero Waste Solutions"
    />
  </div>
</div>


<SidebarGroupContent>
  <SidebarMenu>
    {items.map((item) => {
      const isActive = pathname === item.url;
      return (
<SidebarMenuItem key={item.title}>
  <SidebarMenuButton asChild>
    <Link
      href={item.url}
      className={`
        flex items-center gap-3 rounded-md transition-colors
        hover:bg-green-200
        ${isActive ? "bg-green-300 text-green-800" : ""}
        group-data-[collapsible=icon]:justify-center 
        group-data-[collapsible=icon]:px-0 
        group-data-[collapsible=icon]:py-2
      `}
    >
      {/* Fixed width icon wrapper */}
      <div className="w-6 flex items-center justify-center">
        <item.icon className="w-5 h-5" />
      </div>

      {/* Label — hidden in collapsed mode */}
<span className="group-data-[collapsible=icon]:hidden text-lg font-semibold">
  {item.title}
</span>

    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>

      );
    })}
  </SidebarMenu>
</SidebarGroupContent>

        </SidebarGroup>

        {/* Footer with sign out */}
        <SidebarFooter className="flex justify-center">
          {/* Expanded: full button */}
          <div className="group-data-[collapsible=icon]:hidden w-full">
            <SignoutButton />
          </div>

{/* Collapsed: Sign out icon only */}
<div className="hidden group-data-[collapsible=icon]:flex justify-center p-2">
  <div className="w-6 flex items-center justify-center">
    <LogOut className="w-5 h-5 text-green-700" />
  </div>
</div>

        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
