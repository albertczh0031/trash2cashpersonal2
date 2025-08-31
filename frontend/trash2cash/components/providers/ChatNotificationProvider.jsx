"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

// Create context for chat notifications
const ChatNotificationContext = createContext();

export function useChatNotifications() {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error("useChatNotifications must be used within ChatNotificationProvider");
  }
  return context;
}

export default function ChatNotificationProvider({ children }) {
  const [soundNotificationsEnabled, setSoundNotificationsEnabled] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [token, setToken] = useState(null);
  const [activeViewingChatroom, setActiveViewingChatroom] = useState(null); // Track which chatroom user is currently viewing
  const previousUnreadCountsRef = useRef({});

  // Debug: log when active chatroom changes
  useEffect(() => {
    console.log("📍 Active viewing chatroom changed to:", activeViewingChatroom || "None");
  }, [activeViewingChatroom]);

  // Get token from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token") || localStorage.getItem("access");
    console.log("🔑 ChatNotificationProvider: Token retrieved:", accessToken ? "Found" : "Not found");
    if (accessToken) {
      setToken(accessToken);
    }
  }, []);

  // Function to play notification sound
  const playNotificationSound = () => {
    if (!soundNotificationsEnabled) return;
    
    try {
      // Create a pleasant notification sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure the sound: gentle two-tone notification
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
      oscillator.frequency.setValueAtTime(1108, audioContext.currentTime + 0.15); // C#6 note
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log("Could not play notification sound:", error);
      // Fallback: try the browser's default notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmETBz+f4e+2bSAFJHfH8N2QQAoUXrTp66hVFApGn+DyvmETCAWF');
        audio.volume = 0.1;
        audio.play().catch(() => {
          console.log("All notification sound methods failed");
        });
      } catch (fallbackError) {
        console.log("Fallback notification sound also failed:", fallbackError);
      }
    }
  };

  // Function to fetch unread counts globally
  const fetchUnreadCounts = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://trash2cashpersonal.onrender.com/api/chat/chatroom-unread-counts/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const newUnreadCounts = data.unread_counts || {};
        
        // Check for new unread messages and play notification sound
        const previousCounts = previousUnreadCountsRef.current;
        let hasNewUnreadMessages = false;
        
        for (const chatroomId in newUnreadCounts) {
          const newCount = newUnreadCounts[chatroomId] || 0;
          const previousCount = previousCounts[chatroomId] || 0;
          
          // If unread count increased AND it's not the chatroom the user is currently viewing
          if (newCount > previousCount && parseInt(chatroomId) !== activeViewingChatroom) {
            hasNewUnreadMessages = true;
            break;
          }
        }
        
        if (hasNewUnreadMessages) {
          console.log(`🔔 New unread messages detected! Playing notification sound... (Excluding chatroom ${activeViewingChatroom})`);
          playNotificationSound();
        }
        
        // Update references
        previousUnreadCountsRef.current = { ...newUnreadCounts };
        setUnreadCounts(newUnreadCounts);
      }
    } catch (error) {
      console.error("Failed to fetch unread counts:", error);
    }
  };

  // Global polling for unread counts every 2 seconds for better responsiveness
  useEffect(() => {
    if (!token) return;
    
    // Fetch immediately
    fetchUnreadCounts();
    
    // Set up polling
    const interval = setInterval(fetchUnreadCounts, 2000);
    return () => clearInterval(interval);
  }, [token]);

  const contextValue = {
    soundNotificationsEnabled,
    setSoundNotificationsEnabled,
    unreadCounts,
    playNotificationSound,
    fetchUnreadCounts,
    activeViewingChatroom,
    setActiveViewingChatroom,
  };

  return (
    <ChatNotificationContext.Provider value={contextValue}>
      {children}
    </ChatNotificationContext.Provider>
  );
}
