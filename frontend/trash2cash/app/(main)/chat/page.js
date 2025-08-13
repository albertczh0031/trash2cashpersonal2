"use client";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";

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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Typing indicator functions
  const setTypingStatus = async (isTyping) => {
    if (!token || !selectedChatroom) return;
    
    try {
      await fetch("https://trash2cashpersonal.onrender.com/api/chat/typing/", {
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
      const response = await fetch(`https://trash2cashpersonal.onrender.com/api/chat/typing/${selectedChatroom}/`, {
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
    }, 2000);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    setToken(accessToken);
    
    // Get current user info
    if (accessToken) {
      console.log('Fetching user profile with token:', accessToken); // Debug log
      fetch("https://trash2cashpersonal.onrender.com/api/user-profile/", {
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
    fetch("https://trash2cashpersonal.onrender.com/api/chat/my-chatrooms/", {
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
        setChatrooms(data);
        console.log('Chatrooms data:', data); // Debug log
        
        // Auto-select chatroom from URL parameter or first chatroom if none selected
        const urlChatroomId = chatroom_id ? parseInt(chatroom_id) : null;
        if (urlChatroomId && data.some(room => room.id === urlChatroomId)) {
          // Select the chatroom from URL if it exists
          setSelectedChatroom(urlChatroomId);
        } else if (data.length > 0 && !selectedChatroom) {
          // Fallback to first chatroom if none selected
          setSelectedChatroom(data[0].id);
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
    fetch(`https://trash2cashpersonal.onrender.com/api/chat/messages/${selectedChatroom}/`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
      })
      .then(setMessages)
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
      fetch(`https://trash2cashpersonal.onrender.com/api/chat/messages/${selectedChatroom}/`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then(setMessages)
        .catch(() => {}); // Silent fail for background refresh
    }, 3000);

    return () => clearInterval(interval);
  }, [token, selectedChatroom]);

  // Poll for typing status every 1 second
  useEffect(() => {
    if (!token || !selectedChatroom) return;
    
    const interval = setInterval(fetchTypingStatus, 1000);
    return () => clearInterval(interval);
  }, [token, selectedChatroom]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Function to refresh chatrooms and maintain sorting
  const refreshChatrooms = async () => {
    if (!token) return;
    
    try {
      const response = await fetch("https://trash2cashpersonal.onrender.com/api/chat/my-chatrooms/", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatrooms(data);
      }
    } catch (error) {
      console.error("Failed to refresh chatrooms:", error);
    }
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
      const response = await fetch(`https://trash2cashpersonal.onrender.com/api/chat/send/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ chatroom_id: selectedChatroom, content: messageContent }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      // Immediately fetch updated messages
      const messagesResponse = await fetch(`https://trash2cashpersonal.onrender.com/api/chat/messages/${selectedChatroom}/`, {
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

  const getChatroomName = (room) => {
    if (room.participants.length === 2) {
      // Private chat - show the other person's name
      const otherUser = room.participants.find(p => p !== currentUser);
      return otherUser || `Chat #${room.id}`;
    } else {
      // Group chat
      return `Group Chat (${room.participants.length} members)`;
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 1; }
          30% { opacity: 0.3; }
        }
      `}</style>
      <div style={{ display: "flex", height: "90vh", maxHeight: "800px", border: "1px solid #e1e5e9", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
      {/* Sidebar */}
      <div style={{ 
        width: "300px", 
        borderRight: "1px solid #e1e5e9", 
        padding: "1rem", 
        overflowY: "auto",
        backgroundColor: "#f8f9fa"
      }}>
        <h3 style={{ margin: "0 0 1rem 0", color: "#1a202c", fontSize: "1.25rem" }}>Messages</h3>
        
        {error && (
          <div style={{ 
            background: "#fed7d7", 
            color: "#c53030", 
            padding: "0.5rem", 
            borderRadius: "4px", 
            marginBottom: "1rem",
            fontSize: "0.875rem"
          }}>
            {error}
          </div>
        )}
        
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {loading && chatrooms.length === 0 ? (
            <li style={{ padding: "1rem", textAlign: "center", color: "#666" }}>Loading...</li>
          ) : Array.isArray(chatrooms) && chatrooms.length > 0 ? (
            chatrooms.map((room) => (
              <li
                key={room.id}
                style={{
                  cursor: "pointer",
                  background: selectedChatroom === room.id ? "#e2e8f0" : "transparent",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  border: selectedChatroom === room.id ? "1px solid #cbd5e0" : "1px solid transparent",
                  transition: "all 0.2s",
                }}
                onClick={() => setSelectedChatroom(room.id)}
                onMouseEnter={(e) => {
                  if (selectedChatroom !== room.id) {
                    e.target.style.backgroundColor = "#f7fafc";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChatroom !== room.id) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ fontWeight: "600", color: "#2d3748", marginBottom: "0.25rem" }}>
                  {getChatroomName(room)}
                </div>
                {room.last_message && (
                  <div style={{ 
                    color: "#718096", 
                    fontSize: "0.75rem", 
                    marginBottom: "0.25rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    <strong>{room.last_message.sender}:</strong> {room.last_message.content}
                  </div>
                )}
                <small style={{ color: "#718096", fontSize: "0.7rem" }}>
                  {room.last_message 
                    ? formatTimestamp(room.last_message.timestamp)
                    : `${room.participants.length} participant${room.participants.length !== 1 ? 's' : ''}`
                  }
                </small>
              </li>
            ))
          ) : (
            <li style={{ padding: "1rem", textAlign: "center", color: "#718096" }}>
              No chatrooms found.
            </li>
          )}
        </ul>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChatroom ? (
          <>
            {/* Chat Header */}
            <div style={{ 
              padding: "1rem", 
              borderBottom: "1px solid #e1e5e9", 
              backgroundColor: "#fff",
              borderBottomLeftRadius: "0",
              borderBottomRightRadius: "0"
            }}>
              <h4 style={{ margin: 0, color: "#1a202c" }}>
                {chatrooms.find(room => room.id === selectedChatroom) && 
                 getChatroomName(chatrooms.find(room => room.id === selectedChatroom))}
              </h4>
              <small style={{ color: "#718096" }}>
                {chatrooms.find(room => room.id === selectedChatroom)?.participants.join(", ")}
              </small>
              {/* DEBUG INFO - TO BE REMOVED */}
              <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.5rem" }}>
                Debug: Current user = &quot;{currentUser || 'not set'}&quot; (ID: {currentUserId || 'not set'})
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              overflowY: "auto", 
              padding: "1rem",
              backgroundColor: "#f7fafc"
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#718096", marginTop: "2rem" }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  // Determine if this is the current user's message
                  const isMyMessage = (() => {
                    // If currentUserId is available, use it (most reliable)
                    if (currentUserId !== null && currentUserId !== undefined) {
                      return parseInt(msg.sender_id) === parseInt(currentUserId);
                    }
                    
                    // If currentUser is a numeric string (sometimes happens), try to use it as ID
                    if (currentUser && !isNaN(currentUser)) {
                      return parseInt(msg.sender_id) === parseInt(currentUser);
                    }
                    
                    // Fallback to username comparison
                    if (currentUser && msg.sender) {
                      return msg.sender.toLowerCase().trim() === currentUser.toLowerCase().trim();
                    }
                    
                    return false;
                  })();
                  
                  console.log(`Message: "${(msg.content || msg.text || '').substring(0, 20)}..." - Sender ID: ${msg.sender_id} Current User: ${currentUser} Current User ID: ${currentUserId} Is My Message: ${isMyMessage}`);
                  
                  console.log('Message:', msg.content, 'Sender:', msg.sender, 'Sender ID:', msg.sender_id, 'Current User:', currentUser, 'Current User ID:', currentUserId, 'Is My Message:', isMyMessage);
                  
                  return (
                    <div 
                      key={msg.id} 
                      style={{ 
                        marginBottom: "1rem",
                        display: "flex",
                        flexDirection: isMyMessage ? "row-reverse" : "row",
                        justifyContent: isMyMessage ? "flex-end" : "flex-start",
                      }}
                    >
                      <div style={{
                        maxWidth: "70%",
                        padding: "0.75rem 1rem",
                        borderRadius: "18px",
                        backgroundColor: isMyMessage ? "#3182ce" : "#fff",
                        color: isMyMessage ? "#fff" : "#1a202c",
                        border: isMyMessage ? "none" : "1px solid #e1e5e9",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                        marginLeft: isMyMessage ? "auto" : "0",
                        marginRight: isMyMessage ? "0" : "auto",
                      }}>
                        {!isMyMessage && (
                          <div style={{ 
                            fontSize: "0.75rem", 
                            fontWeight: "600", 
                            marginBottom: "0.25rem",
                            color: "#3182ce"
                          }}>
                            {msg.sender}
                          </div>
                        )}
                        <div style={{ wordBreak: "break-word" }}>{msg.content}</div>
                        <div style={{ 
                          fontSize: "0.65rem", 
                          marginTop: "0.25rem",
                          opacity: 0.7,
                          textAlign: isMyMessage ? "right" : "left"
                        }}>
                          {formatTimestamp(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div style={{ 
                  padding: "0.5rem 1rem", 
                  fontStyle: "italic", 
                  color: "#718096", 
                  fontSize: "0.875rem",
                  marginBottom: "0.5rem"
                }}>
                  {typingUsers.length === 1 
                    ? `${typingUsers[0].username} is typing`
                    : `${typingUsers.map(u => u.username).join(", ")} are typing`
                  }
                  <span style={{ 
                    display: "inline-block", 
                    width: "4px", 
                    height: "4px", 
                    borderRadius: "50%", 
                    backgroundColor: "#718096", 
                    margin: "0 2px",
                    animation: "pulse 1.5s infinite"
                  }}></span>
                  <span style={{ 
                    display: "inline-block", 
                    width: "4px", 
                    height: "4px", 
                    borderRadius: "50%", 
                    backgroundColor: "#718096", 
                    margin: "0 2px",
                    animation: "pulse 1.5s infinite 0.5s"
                  }}></span>
                  <span style={{ 
                    display: "inline-block", 
                    width: "4px", 
                    height: "4px", 
                    borderRadius: "50%", 
                    backgroundColor: "#718096", 
                    margin: "0 2px",
                    animation: "pulse 1.5s infinite 1s"
                  }}></span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form 
              onSubmit={sendMessage} 
              style={{ 
                padding: "1rem", 
                borderTop: "1px solid #e1e5e9", 
                backgroundColor: "#fff",
                display: "flex", 
                gap: "0.5rem",
                alignItems: "center"
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                style={{ 
                  flex: 1, 
                  padding: "0.75rem 1rem", 
                  border: "1px solid #e1e5e9",
                  borderRadius: "20px",
                  outline: "none",
                  fontSize: "0.875rem"
                }}
                placeholder="Type your message..."
                disabled={loading}
                onFocus={(e) => e.target.style.borderColor = "#3182ce"}
                onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                style={{ 
                  padding: "0.75rem 1.5rem",
                  backgroundColor: loading || !input.trim() ? "#cbd5e0" : "#3182ce",
                  color: "#fff",
                  border: "none",
                  borderRadius: "20px",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: "600"
                }}
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </form>
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
    </>
  );
}