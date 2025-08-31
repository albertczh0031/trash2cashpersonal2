"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

export function SignoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/session", {
        method: "DELETE",
      });

      if (response.ok) {
        // Add a slight delay for animation
        setTimeout(() => {
          router.push("/auth/login");
          router.refresh();
        }, 500);
      } else {
        console.error("Failed to sign out");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error signing out:", error);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Expanded mode */}
      <div className="w-full group-data-[collapsible=icon]:hidden">
        <Button
          variant="destructive"
          className="w-full justify-start gap-2 px-3 py-2"
          onClick={handleSignout}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </div>

      {/* Collapsed mode */}
      <div className="hidden group-data-[collapsible=icon]:flex">
        <Button
          variant="destructive"
          size="icon"
          className="rounded-lg"
          onClick={handleSignout}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
        </Button>
      </div>
    </>
  );
}
