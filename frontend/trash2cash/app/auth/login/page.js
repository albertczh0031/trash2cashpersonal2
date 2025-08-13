"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // To toggle password visibility

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // 1. Authenticate with Django
      const res = await fetch("https://trash2cashpersonal.onrender.com/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok)
        throw new Error("Login failed. Invalid username or password.");
      const { access, refresh } = await res.json();

      // 2. Store tokens in localStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // 3. Create server session with user data
      const sessionRes = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({
          user: {
            id: extractUserIdFromToken(access), // Implement this
            username: formData.username,
          },
        }),
      });

      if (!sessionRes.ok) throw new Error("Session creation failed");

      // 4. Check if verified
      const verifiedRes = await fetch("https://trash2cashpersonal.onrender.com/api/get-verification/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const verifiedData = await verifiedRes.json();
      if (!verifiedData.verified_status) {
        // 5. Clear session if unverified
        await fetch("/api/session", { method: "DELETE" });

        // 6. Store email for OTP page
        localStorage.setItem("email", formData.email);

        // 7. Redirect to OTP page
        router.push("/auth/verify-otp");
        return;
      }

      // 8. Verified — redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      setErrors({ nonField: error.message });
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract user ID from JWT
  function extractUserIdFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch {
      return null;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don&rsquo; have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Sign up
          </Link>
        </div>
        <br></br>

        {errors.nonField && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
            {errors.nonField}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Your Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="text-right">
              <u>Forgot your password?</u>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded bg-green-500 hover:bg-green-600 text-white font-medium ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </main>
  );
}
