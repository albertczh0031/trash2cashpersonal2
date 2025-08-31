// ChatSidebar.jsx
import React from 'react';

export default function ChatSidebar({ 
  chatrooms, 
  selectedChatroom, 
  setSelectedChatroom, 
  unreadCounts, 
  loading, 
  error, 
  currentUser, 
  formatTimestamp 
}) {
  const getChatroomName = (room) => {
    if (room.participants.length === 2) {
      // Private chat - show the other person's name
      const otherUser = room.participants.find(p => 
        typeof p === 'string' ? p !== currentUser : p.username !== currentUser
      );
      if (typeof otherUser === 'string') {
        return otherUser;
      } else if (otherUser) {
        return otherUser.username;
      }
      return `Chat #${room.id}`;
    } else {
      // Group chat
      return `Group Chat (${room.participants.length} members)`;
    }
  };

  const getOtherUserProfilePicture = (room) => {
    if (room.participants.length === 2) {
      const otherUser = room.participants.find(p => 
        typeof p === 'string' ? p !== currentUser : p.username !== currentUser
      );
      if (typeof otherUser === 'object' && otherUser.profile_picture) {
        return otherUser.profile_picture;
      }
    }
    return null;
  };

  const ProfilePicturePlaceholder = ({ src, name, size = 40 }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
    
    // If src is a relative URL starting with /media/, prepend the backend server URL
    const fullImageSrc = src ? (src.startsWith('/media/') ? `https://trash2cashpersonal.onrender.com/${src}` : src) : null;
    
    const [imageError, setImageError] = React.useState(false);
    
    if (fullImageSrc && !imageError) {
      return (
        <img 
          src={fullImageSrc} 
          alt={`${name}'s profile`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid #e2e8f0',
            backgroundColor: '#f7fafc'
          }}
          onError={() => setImageError(true)}
        />
      );
    }
    
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#4a90e2',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.4}px`,
        fontWeight: 'bold',
        border: '2px solid #e2e8f0'
      }}>
        {initials}
      </div>
    );
  };

  return (
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
          chatrooms.map((room) => {
            const hasUnreadMessages = unreadCounts[room.id] > 0 && selectedChatroom !== room.id;
            const isSelected = selectedChatroom === room.id;
            return (
              <li
                key={room.id}
                style={{
                  cursor: "pointer",
                  background: isSelected 
                    ? "#e2e8f0" 
                    : hasUnreadMessages 
                      ? "#fef5e7" // Light orange background for unread messages
                      : "transparent",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  marginBottom: "0.5rem",
                  border: isSelected 
                    ? "1px solid #cbd5e0" 
                    : hasUnreadMessages 
                      ? "1px solid #f6ad55" // Orange border for unread messages
                      : "1px solid transparent",
                  transition: "all 0.2s",
                  position: "relative", // For unread count badge positioning
                  userSelect: "none", // Prevent text selection
                  WebkitUserSelect: "none", // Safari
                  MozUserSelect: "none", // Firefox
                }}
                onClick={() => setSelectedChatroom(room.id)}
              >
                <div style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.25rem",
                }}>
                  <ProfilePicturePlaceholder 
                    src={getOtherUserProfilePicture(room)}
                    name={getChatroomName(room)}
                    size={32}
                  />
                  <div style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{
                      fontWeight: isSelected ? "600" : hasUnreadMessages ? "700" : "600", 
                      color: isSelected ? "#2d3748" : hasUnreadMessages ? "#c05621" : "#2d3748",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      MozUserSelect: "none"
                    }}>
                      {getChatroomName(room)}
                    </span>
                    {hasUnreadMessages && (
                      <span style={{
                        backgroundColor: "#f56565",
                        color: "white",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        minWidth: "20px"
                      }}>
                        {unreadCounts[room.id]}
                      </span>
                    )}
                  </div>
                </div>
                {room.last_message && (
                  <div style={{ 
                    color: isSelected ? "#4a5568" : hasUnreadMessages ? "#92400e" : "#718096", 
                    fontSize: "0.75rem", 
                    marginBottom: "0.25rem",
                    marginLeft: "2.75rem", // Align with the text, accounting for profile picture + gap
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: isSelected ? "normal" : hasUnreadMessages ? "600" : "normal",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none"
                  }}>
                    <strong>{room.last_message.sender}:</strong> {room.last_message.content}
                  </div>
                )}
                <small style={{ 
                  color: isSelected ? "#4a5568" : hasUnreadMessages ? "#92400e" : "#718096", 
                  fontSize: "0.7rem",
                  marginLeft: "2.75rem", // Align with the text, accounting for profile picture + gap
                  fontWeight: isSelected ? "normal" : hasUnreadMessages ? "600" : "normal",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  MozUserSelect: "none"
                }}>
                  {room.last_message 
                    ? formatTimestamp(room.last_message.timestamp)
                    : `${room.participants.length} participant${room.participants.length !== 1 ? 's' : ''}`
                  }
                </small>
              </li>
            );
          })
        ) : (
          <li style={{ padding: "1rem", textAlign: "center", color: "#718096" }}>
            No chatrooms found.
          </li>
        )}
      </ul>
    </div>
  );
}
