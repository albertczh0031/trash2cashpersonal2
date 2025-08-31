import { SidebarTrigger } from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label"
import { Bell, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useChatNotifications } from "@/components/providers/ChatNotificationProvider";
import NotificationBell from "@/components/Notifications"; // ← add

export default function TopBar({ username, loading }){
    // Use global chat notifications
    const { unreadCounts, activeViewingChatroom } = useChatNotifications();
      
    // Calculate total unread messages across all chatrooms, excluding the currently active one
    const unreadChat = Object.entries(unreadCounts)
    .filter(([chatroomId]) => chatroomId !== activeViewingChatroom?.toString())
    .reduce((total, [, count]) => total + count, 0);

    return(
        <header className="sticky top-0 z-10 flex items-center px-2 py-2 h-10">
            <div className="pr-2 border-r-2 border-gray-400">
                <SidebarTrigger />
            </div>
            <div className="px-3 w-full">
                <Label className="text-[18px]">{loading ? "Loading User..." : username}</Label>
            </div>

            {/* Where the notifications and chat buttons are */}
              {/* Notification Bell */}
              <div className="px-3">
                  <NotificationBell/>
              </div>

              {/* Messages / Chat */}
              <div className="px-3">
                <Link href={`/chat`}>
                <MessageCircle/>
                {unreadChat > 0 && (
                    <span className="absolute top-2 right-4 block h-3.5 w-3.5 rounded-full bg-red-600"></span>
                )}
                </Link>
              </div>
        </header>
    )
}