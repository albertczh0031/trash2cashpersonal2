// ChatHeader.jsx
export default function ChatHeader({ 
  chatrooms, 
  selectedChatroom, 
  currentUser, 
  currentUserId 
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

  const getParticipantNames = (room) => {
    if (!room || !room.participants) return '';
    
    return room.participants.map(p => 
      typeof p === 'string' ? p : p.username
    ).join(", ");
  };

  const selectedRoom = chatrooms.find(room => room.id === selectedChatroom);

  return (
    <div style={{ 
      padding: "1rem", 
      borderBottom: "1px solid #e1e5e9", 
      backgroundColor: "#fff",
      borderBottomLeftRadius: "0",
      borderBottomRightRadius: "0"
    }}>
      <div>
        <h4 style={{ margin: 0, color: "#1a202c" }}>
          {selectedRoom && getChatroomName(selectedRoom)}
        </h4>
      </div>
    </div>
  );
}
