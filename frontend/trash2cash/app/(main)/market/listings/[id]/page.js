"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ListingPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleChatWithSeller = async () => {
        setLoading(true);
        try {
        const token = localStorage.getItem("access");
        if (!token) {
            alert("Please login first");
            router.push("/auth/login");
            return;
        }

        // HARDCODED USER ID FOR TOMAS
        const tomasUserId = 15; 

        // Create or get existing chatroom with Tomas
        const response = await fetch("https://trash2cashpersonal2.onrender.com/api/chat/get-or-create-chatroom/", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: tomasUserId }),
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            // Navigate to the chat page with the chatroom ID as a query parameter
            router.push(`/chat?chatroom=${data.chatroom_id}`);
        } else {
            throw new Error(`Failed to create chatroom: ${response.status} - ${responseText}`);
        }
        } catch (error) {
        console.error("Error creating chat:", error);
        alert("Failed to create chat. Please try again.");
        } finally {
        setLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "2rem", color: "#1a202c" }}>
            Marketplace Listing #{id}
        </h1>
        
        <div style={{ marginBottom: "2rem" }}>
            <button 
            onClick={handleChatWithSeller}
            disabled={loading}
            style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: loading ? "#cbd5e0" : "#3182ce",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "#2c5aa0";
            }}
            onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = "#3182ce";
            }}
            >
            {loading ? "Opening chat..." : "Item: Pig. Seller: Tomas"}
            </button>
        </div>
        </div>
    );
}
