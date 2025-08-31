// TypingIndicator.jsx
export default function TypingIndicator({ typingUsers }) {
  if (typingUsers.length === 0) return null;

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 1; }
          30% { opacity: 0.3; }
        }
      `}</style>
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
    </>
  );
}
