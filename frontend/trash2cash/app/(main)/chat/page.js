"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useChatNotifications } from "@/components/providers/ChatNotificationProvider";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

export default function ChatRoomPage() {
  const searchParams = useSearchParams();
  const chatroom_id = searchParams.get('chatroom');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [token, setToken] = useState(null);
  const [chatrooms, setChatrooms] = useState([]);
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); // Track user ID separately
  const [recentSentMessages, setRecentSentMessages] = useState(new Set()); // Track messages we just sent
  const [typingUsers, setTypingUsers] = useState([]); // Track who is typing
  const [isTyping, setIsTyping] = useState(false); // Track if current user is typing
  
  // Use global chat notifications
  const { unreadCounts, setActiveViewingChatroom, fetchUnreadCounts } = useChatNotifications();
  
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Typing indicator functions
  const setTypingStatus = async (isTyping) => {
    if (!token || !selectedChatroom) return;
    
    try {
      await fetch("http://trash2cashpersonal.onrender.com/api/chat/typing/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatroom_id: selectedChatroom,
          is_typing: isTyping
        })
      });
    } catch (error) {
      console.error("Failed to set typing status:", error);
    }
  };

  const fetchTypingStatus = async () => {
    if (!token || !selectedChatroom) return;
    
    try {
      const response = await fetch(`http://trash2cashpersonal.onrender.com/api/chat/typing/${selectedChatroom}/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTypingUsers(data.typing_users || []);
      }
    } catch (error) {
      console.error("Failed to fetch typing status:", error);
    }
  };

  const markMessagesAsRead = async (chatroomId) => {
    if (!token || !chatroomId) return;
    
    try {
      const response = await fetch("http://trash2cashpersonal.onrender.com/api/chat/mark-as-read/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ chatroom_id: chatroomId }),
      });
      
      if (response.ok) {
        // Immediately refresh unread counts to update the sidebar
        await fetchUnreadCounts();
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Set typing status
    if (!isTyping) {
      setIsTyping(true);
      setTypingStatus(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingStatus(false);
    }, 500);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);
    
    // Get current user info
    if (accessToken) {
      console.log('Fetching user profile with token:', accessToken); // Debug log
      fetch("http://trash2cashpersonal.onrender.com/api/user-profile/", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      })
        .then(res => {
          console.log('Profile API response status:', res.status); // Debug log
          if (!res.ok) {
            throw new Error(`Profile API failed with status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('User profile data:', data); // Debug log
          console.log('Available properties:', Object.keys(data)); // Debug log
          console.log('Raw data values:', data); // Debug log to see exact structure
          
          // Store the user ID for reference - check multiple possible fields
          const userId = data.id || data.user_id || data.pk;
          console.log('Extracted userId:', userId, 'Type:', typeof userId);
          
          if (userId) {
            setCurrentUserId(userId);
            console.log('User ID set to:', userId);
          }
          
          // Try to find username field - check multiple possible fields
          let username = data.username || data.user || data.name || data.email;
          console.log('Found username:', username, 'Type:', typeof username);
          
          if (username && typeof username === 'string' && !username.match(/^\d+$/)) {
            // Have a proper username (not just a number)
            setCurrentUser(username);
            console.log('Current user set to username:', username);
          } else {
            console.log('No proper username found. Username value:', username);
            // Will resolve the username later from messages
            setCurrentUser(null);
          }
        })
        .catch(err => {
          console.error("Failed to fetch user profile:", err);
          // Fallback: try to get username from token payload (if it's a JWT)
          try {
            const tokenParts = accessToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('Token payload:', payload); // Debug log
              const fallbackUsername = payload.username || payload.user_id || payload.sub;
              if (fallbackUsername) {
                console.log('Using fallback username from token:', fallbackUsername);
                setCurrentUser(fallbackUsername);
              }
            }
          } catch (tokenError) {
            console.error("Failed to parse token:", tokenError);
          }
        });
    }
  }, []);

  // Fetch chatrooms for the logged-in user
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch("http://trash2cashpersonal.onrender.com/api/chat/my-chatrooms/", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch chatrooms');
        return res.json();
      })
      .then((data) => {
        // Sort chatrooms by last message timestamp (most recent first)
        const sortedData = data.sort((a, b) => {
          const timeA = a.last_message ? new Date(a.last_message.timestamp).getTime() : 0;
          const timeB = b.last_message ? new Date(b.last_message.timestamp).getTime() : 0;
          return timeB - timeA; // Descending order (newest first)
        });
        setChatrooms(sortedData);
        console.log('Chatrooms data (sorted):', sortedData); // Debug log
        
        // Auto-select chatroom from URL parameter or first chatroom if none selected
        const urlChatroomId = chatroom_id ? parseInt(chatroom_id) : null;
        if (urlChatroomId && sortedData.some(room => room.id === urlChatroomId)) {
          // Select the chatroom from URL if it exists
          setSelectedChatroom(urlChatroomId);
        } else if (sortedData.length > 0 && !selectedChatroom) {
          // Fallback to first chatroom if none selected
          setSelectedChatroom(sortedData[0].id);
        }
        
        // If currentUser is still an ID, try to find the username from participants
        if (currentUser && (typeof currentUser === 'number' || /^\d+$/.test(currentUser))) {
          console.log('Trying to find username from chatroom participants for user ID:', currentUser);
          // Look through all chatrooms to find our username
          for (const room of data) {
            if (room.participants && Array.isArray(room.participants)) {
              console.log('Room participants:', room.participants);
              // If we find ourselves in this room, we can determine our username
              // This is a bit of a hack, but it should work for now
            }
          }
        }
      })
      .catch((err) => setError("Failed to load chatrooms"))
      .finally(() => setLoading(false));
  }, [token]);

  // Fetch messages for the selected chatroom
  useEffect(() => {
    if (!token || !selectedChatroom) return;
    setLoading(true);
    fetch(`http://trash2cashpersonal.onrender.com/api/chat/messages/${selectedChatroom}/`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
      })
      .then((messagesData) => {
        setMessages(messagesData);
        // Mark messages as read when viewing the chatroom
        markMessagesAsRead(selectedChatroom);
      })
      .catch((err) => setError("Failed to load messages"))
      .finally(() => setLoading(false));
  }, [token, selectedChatroom]);

  // Auto-resolve current username from sent messages if we only have the ID
  useEffect(() => {
    console.log('Username resolution check:', { currentUserId, currentUser, messagesLength: messages.length });
    
    // If we have a user ID but no username (or username is just the ID), resolve it
    if (currentUserId && (!currentUser || currentUser == currentUserId) && messages.length > 0) {
      console.log('Attempting to resolve username for user ID:', currentUserId);
      
      // Try to find our username from messages where sender_id matches our ID
      const ourMessage = messages.find(msg => msg.sender_id === currentUserId);
      if (ourMessage && ourMessage.sender) {
        console.log('Resolved username from message with matching sender_id:', ourMessage.sender);
        setCurrentUser(ourMessage.sender);
      } else {
        console.log('No matching message found. Available sender_ids:', messages.map(m => m.sender_id));
      }
    }
  }, [messages, currentUser, currentUserId]);

  // Auto-refresh messages every 3 seconds for real-time feel
  useEffect(() => {
    if (!token || !selectedChatroom) return;
    
    const interval = setInterval(() => {
      fetch(`http://trash2cashpersonal.onrender.com/api/chat/messages/${selectedChatroom}/`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((messagesData) => {
          setMessages(messagesData);
          // Mark any new messages as read since user is actively viewing this chatroom
          markMessagesAsRead(selectedChatroom);
        })
        .catch(() => {}); // Silent fail for background refresh
    }, 1000);

    return () => clearInterval(interval);
  }, [token, selectedChatroom]);

  // Poll for typing status every 1 second
  useEffect(() => {
    if (!token || !selectedChatroom) return;
    
    const interval = setInterval(fetchTypingStatus, 1000);
    return () => clearInterval(interval);
  }, [token, selectedChatroom]);

  // Poll for chatroom updates every second to catch new messages and reorder
  useEffect(() => {
    if (!token) return;
    
    // Set up polling to refresh chatrooms and maintain order
    const interval = setInterval(() => {
      refreshChatrooms();
    }, 1000); // Every second
    
    return () => clearInterval(interval);
  }, [token]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Clear active viewing chatroom when leaving the chat page
      setActiveViewingChatroom(null);
    };
  }, [setActiveViewingChatroom]);

  // Notify global provider about which chatroom is currently being viewed
  useEffect(() => {
    setActiveViewingChatroom(selectedChatroom);
    
    // Cleanup: clear the active chatroom when chatroom is deselected
    return () => {
      if (!selectedChatroom) {
        setActiveViewingChatroom(null);
      }
    };
  }, [selectedChatroom, setActiveViewingChatroom]);

  // Function to refresh chatrooms and maintain sorting
  const refreshChatrooms = async () => {
    if (!token) return;
    
    try {
      const response = await fetch("http://trash2cashpersonal.onrender.com/api/chat/my-chatrooms/", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Sort chatrooms by last message timestamp (most recent first)
        const sortedData = data.sort((a, b) => {
          const timeA = a.last_message ? new Date(a.last_message.timestamp).getTime() : 0;
          const timeB = b.last_message ? new Date(b.last_message.timestamp).getTime() : 0;
          return timeB - timeA; // Descending order (newest first)
        });
        setChatrooms(sortedData);
      }
    } catch (error) {
      console.error("Failed to refresh chatrooms:", error);
    }
    
    // Also refresh unread counts
    fetchUnreadCounts();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!token || !selectedChatroom || !input.trim()) return;
    
    const messageContent = input.trim();
    setInput("");
    setLoading(true);
    
    // Stop typing indicator
    setIsTyping(false);
    setTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    try {
      const response = await fetch(`http://trash2cashpersonal.onrender.com/api/chat/send/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ chatroom_id: selectedChatroom, content: messageContent }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      // Immediately fetch updated messages
      const messagesResponse = await fetch(`http://trash2cashpersonal.onrender.com/api/chat/messages/${selectedChatroom}/`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (messagesResponse.ok) {
        const updatedMessages = await messagesResponse.json();
        setMessages(updatedMessages);
        
        // Refresh chatrooms to update sorting by last activity
        await refreshChatrooms();
      }
    } catch (err) {
      setError("Failed to send message");
      setInput(messageContent); // Restore message on error
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div style={{ display: "flex", height: "90vh", maxHeight: "800px", border: "1px solid #e1e5e9", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
      <ChatSidebar
        chatrooms={chatrooms}
        selectedChatroom={selectedChatroom}
        setSelectedChatroom={setSelectedChatroom}
        unreadCounts={unreadCounts}
        loading={loading}
        error={error}
        currentUser={currentUser}
        formatTimestamp={formatTimestamp}
      />

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChatroom ? (
          <>
            <ChatHeader
              chatrooms={chatrooms}
              selectedChatroom={selectedChatroom}
              currentUser={currentUser}
              currentUserId={currentUserId}
            />

            <MessageList
              messages={messages}
              currentUser={currentUser}
              currentUserId={currentUserId}
              typingUsers={typingUsers}
              formatTimestamp={formatTimestamp}
            />

            <MessageInput
              input={input}
              loading={loading}
              handleInputChange={handleInputChange}
              sendMessage={sendMessage}
            />
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "#718096",
            fontSize: "1.125rem"
          }}>
            Select a chatroom to start messaging
          </div>
        )}
      </div>
    </div>
  );
}