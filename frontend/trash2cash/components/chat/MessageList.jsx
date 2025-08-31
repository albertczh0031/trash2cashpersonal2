// MessageList.jsx
import { useRef, useEffect } from "react";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ 
  messages, 
  currentUser, 
  currentUserId, 
  typingUsers, 
  formatTimestamp 
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
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
      
      <TypingIndicator typingUsers={typingUsers} />
      <div ref={messagesEndRef} />
    </div>
  );
}
