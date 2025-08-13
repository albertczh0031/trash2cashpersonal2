// app/components/SignoutButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SignoutButton() {
  const router = useRouter();

  const handleSignout = async () => {
    try {
      const response = await fetch("/api/session", {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/auth/login"); // Redirect using Next.js router
        router.refresh(); // Force refresh to clear client-side cache
      } else {
        console.error("Failed to sign out");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Button variant="destructive" onClick={handleSignout}>
      Sign Out
    </Button>
  );
}
