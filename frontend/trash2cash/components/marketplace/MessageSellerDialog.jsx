"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function MessageSellerDialog({ 
  listing, 
  isOpen, 
  onOpenChange 
}) {
  // Guard clause to prevent errors if listing is null or missing seller_username
  if (!listing || !listing.seller_username) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Loading seller info...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  console.log('MessageSellerDialog listing:', listing);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle sending message and starting chat
  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert("Please enter a message before sending.");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("Please login first");
        router.push("/auth/login");
        return;
      }

      const sellerId = listing.seller;

      // Create or get existing chatroom with Tomas
      const response = await fetch("https://trash2cashpersonal.onrender.com/api/chat/get-or-create-chatroom/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: sellerId }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);

      if (response.ok) {
        const data = JSON.parse(responseText);
        
        // Send the initial message with item context
        const contextMessage = `📦 Regarding "${listing.title}" (RM${listing.price}):\n\n${messageText}`;
        
        const messageResponse = await fetch("https://trash2cashpersonal.onrender.com/api/chat/send/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            chatroom_id: data.chatroom_id,
            content: contextMessage
          }),
        });

        if (messageResponse.ok) {
          // Navigate to the chat page with the chatroom ID as a query parameter
          router.push(`/chat?chatroom=${data.chatroom_id}`);
        } else {
          throw new Error(`Failed to send message: ${messageResponse.status}`);
        }
      } else {
        throw new Error(`Failed to create chatroom: ${response.status} - ${responseText}`);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      onOpenChange(false);
      setMessageText('');
    }
  };

  const handleOpenChange = (open) => {
    onOpenChange(open);
    if (!open) {
      setMessageText(''); // Clear the message text when dialog closes
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          {console.log('MessageSellerDialog listing:', listing)}
          <DialogTitle>Message {listing.seller_username}</DialogTitle>
          <DialogDescription>
            Send a message to {listing.seller_username} about "{listing.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Type your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground mt-2 text-right">
            {messageText.length}/500
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="default" 
            onClick={handleSendMessage}
            disabled={loading || !messageText.trim()}
          >
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
