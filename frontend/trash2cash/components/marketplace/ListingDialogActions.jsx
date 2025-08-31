import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ListingDialogActions({ listing, images, onMessageSellerClick, handleMessageSeller, setIsDialogOpen }) {
  const router = useRouter();
  // Get current user ID from localStorage

  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(localStorage);
      let user = localStorage.getItem("user");
      if (!user) {
        user = sessionStorage.getItem("user");
        if (user) {
          console.log("Loaded user from sessionStorage");
        }
      } else {
        console.log("Loaded user from localStorage");
      }
      if (user) {
        try {
          const parsed = JSON.parse(user);
          setCurrentUserId(parsed.id);
          console.log("Parsed user id:", parsed.id);
        } catch (e) {
          console.log("Failed to parse user from storage", e);
        }
      } else {
        console.log("No user found in localStorage or sessionStorage");
      }
    }
  }, []);

  // Debug: log currentUserId and listing.seller
  console.log('ListingDialogActions: currentUserId:', currentUserId, 'listing.seller:', listing.seller);

  const isSeller = currentUserId && String(listing.seller) === String(currentUserId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {!isSeller && (
        <Button
          type="button"
          variant="default"
          className="w-full"
          onClick={handleMessageSeller}
        >
          Message Seller
        </Button>
      )}
      {!isSeller && (
        <Button
          type="button"
          variant="default"
          className="w-full"
          onClick={() => {
            setIsDialogOpen(false);
            router.push(
              `/market/payment?id=${listing.id}&title=${encodeURIComponent(
                listing.title
              )}&price=${listing.price}&image=${encodeURIComponent(
                images[0] || '/logo.png'
              )}`
            );
          }}
        >
          Buy Now
        </Button>
      )}
    </div>
  );
}
