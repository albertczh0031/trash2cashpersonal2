"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [username, setUsername] = useState("");

  // Show/hide states for each password field
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUsername(payload.username);
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }, [router]);

  const validatePassword = (password) => {
    const regex = /^(?=.*[0-9])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        "Password must be at least 8 characters long and include a number and a symbol.",
      );
      return;
    }

    const token = localStorage.getItem("access");

    try {
      const res = await fetch("https://trash2cashpersonal2.onrender.com/api/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Server response is not JSON: " + text);
      }

      if (!res.ok) {
        throw new Error(data.detail || "Password change failed");
      }

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      await fetch("/api/session", {
        method: "DELETE",
      });

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      router.push("/auth/login");
      router.refresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 shadow-md border rounded space-y-6">
      <h1 className="text-xl font-bold">Change Password</h1>

      <form onSubmit={handleChangePassword} className="space-y-4">
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            placeholder="Current Password"
            className="w-full p-2 border rounded pr-10"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600"
            tabIndex={-1}
          >
            {showCurrent ? "Hide" : "Show"}
          </button>
        </div>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="New Password"
            className="w-full p-2 border rounded pr-10"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600"
            tabIndex={-1}
          >
            {showNew ? "Hide" : "Show"}
          </button>
        </div>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm New Password"
            className="w-full p-2 border rounded pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600"
            tabIndex={-1}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}