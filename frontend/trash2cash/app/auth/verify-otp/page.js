'use client';

import { useEffect, useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { refreshAccessToken } from "@/utils/refreshAccessToken"; // Import the function to refresh access token
//import { REGEXP_ONLY_DIGITS_AND_CHARS } from './input-otp';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(30);
  const router = useRouter();

  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const token = localStorage.getItem("access"); // Retrieve the token from localStorage
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("https://trash2cashpersonal.onrender.com/api/getemail/", {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        // If the access token is expired, refresh it
        if (response.status === 401) {
          const access = await refreshAccessToken();
          response = await fetch("https://trash2cashpersonal.onrender.com/api/getemail/", {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          });
        }

        if (!response.ok) {
          throw new Error("Failed to fetch user email");
        }

        const data = await response.json();
        console.log(data.email);
        setEmail(data.email);
      } catch (error) {
        console.error("Error fetching user email:", error);
      }
    };

    fetchEmail();
    
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async () => {
    try {
      const response = await fetch("https://trash2cashpersonal.onrender.com/api/verify-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp , email }),
      });

      const text = await response.text(); 
      console.log("Raw verify response:", text);

      if (!response.ok) {
        setError("Verification failed.");
        return;
      }

      const data = JSON.parse(text);



      console.log("Verify success:", data);

      //clear client-side cache
      const signoutResponse = await fetch("/api/session", {
        method: "DELETE",
      });

      if (signoutResponse.ok) {
        router.refresh(); // Force refresh to clear client-side cache
      } else {
        console.error("Failed to sign out");
      }

      router.push("/auth/login"); // Redirect using Next.js router
    } catch (err) {
      console.error("Verify error:", err);
      setError("Unexpected error during verification.");
    }
  };

  const resendCode = async () => {
    if (cooldown > 0) return;

    const emailToSend = email || localStorage.getItem("email");
    if (!emailToSend) {
      setError("Missing email. Please refresh the page.");
      return;
    }

    try {
      const res = await fetch("https://trash2cashpersonal.onrender.com/api/send-otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });

      const text = await res.text();
      console.log("Resend response:", res.status, text);

      if (!res.ok) {
        setError("Failed to resend OTP.");
        return;
      }

      setError("");
      setCooldown(30); //restart cooldown
    } catch (err) {
      console.error(err);
      setError("Error while resending OTP.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg shadow-md text-center">
      <h2 className="text-xl font-bold mb-4">Enter OTP sent to {email}</h2>
        
      <div className='flex items-center justify-center'>
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <Button onClick={handleVerify} className="mt-4 w-full bg-green-500">
        Verify
      </Button>

      <Button
        variant="outline"
        disabled={cooldown > 0}
        onClick={resendCode}
        className="mt-2 w-full"
      >
        {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Send New Code'}
      </Button>
    </div>
  );
}
