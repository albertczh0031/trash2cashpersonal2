// MessageInput.jsx
import { useRef } from "react";

export default function MessageInput({ 
  input, 
  loading, 
  handleInputChange, 
  sendMessage 
}) {
  
  const inputRef = useRef(null);
  const CHAR_LIMIT = 500;

  return (
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
        maxLength={500}  
        style={{ 
          flex: 1, 
          padding: "0.75rem 1rem", 
          border: "1px solid #e1e5e9",
          borderRadius: "20px",
          outline: "none",
          fontSize: "0.875rem"
        }}
        placeholder={`Type your message... (max ${CHAR_LIMIT} characters)`}
        disabled={loading}
        onFocus={(e) => e.target.style.borderColor = "#3182ce"}
        onBlur={(e) => e.target.style.borderColor = "#e1e5e9"}
      />
      <div style={{ textAlign: "right", fontSize: "0.75rem"}}>
        {input.length}/500
      </div>
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
  );
}
