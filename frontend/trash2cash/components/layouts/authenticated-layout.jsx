// components/layouts/authenticated-layout.jsx
"use client";

import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ChatNotificationProvider from "@/components/providers/ChatNotificationProvider";
import TopBar from "./topbar";

export default function Layout({ children }) {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetches the username of the current user
  useEffect(() => {
    const accessToken = localStorage.getItem('access');

    if (accessToken) {
      fetch(`http://127.0.0.1:8000/api/user-profile/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    }
  }, []);

  return (
    <ChatNotificationProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1">
            {/* Topbar */}
            <TopBar loading={loading} username={user.username}/>

            {/* Main Part */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        
      </SidebarProvider>
    </ChatNotificationProvider>
  );
}
