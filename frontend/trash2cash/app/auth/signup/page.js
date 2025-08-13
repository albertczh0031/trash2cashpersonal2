"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    street: "",
    postcode: "",
    city: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required.";
    if (!formData.email.includes("@"))
      newErrors.email = "Invalid email address.";
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.password2)
      newErrors.password2 = "Passwords do not match.";
    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required.";
    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required.";
    if (!formData.street.trim()) newErrors.street = "Street is required.";
    if (!formData.postcode.trim()) newErrors.postcode = "Postcode is required.";
    if (!formData.city.trim()) newErrors.city = "City is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({}); // Clear previous errors
    if (!validateForm()) return;

    try {
      const response = await fetch("https://trash2cashpersonal2.onrender.com/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle Django validation errors
        if (data.email) {
          // Django typically returns email errors as an array
          setErrors({
            email: Array.isArray(data.email) ? data.email[0] : data.email,
          });
        } else if (data.username) {
          setErrors({
            username: Array.isArray(data.username)
              ? data.username[0]
              : data.username,
          });
        } else if (data.non_field_errors) {
          // Handle non-field errors (e.g., "User with this email already exists")
          setErrors({
            general: Array.isArray(data.non_field_errors)
              ? data.non_field_errors[0]
              : data.non_field_errors,
          });
        } else {
          // Fallback for other errors
          setErrors({
            general: "Registration failed. Please check your details.",
          });
        }
        return;
      }

      // Authenticate with Django
      const res = await fetch("https://trash2cashpersonal2.onrender.com/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok)
        throw new Error("Signup failed.");
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
            id: extractUserIdFromToken(access),
            email: formData.email,
          },
        }),
      });

      if (!sessionRes.ok) throw new Error("Session creation failed");

      console.log("Signup success:", data);
      setSuccessMessage("Signup successful!");
      setTimeout(() => {
        router.push("/auth/verify-otp");
      }, 1500); // optional delay
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "Network error. Please try again." });
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
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Create an account</h1>
        <p className="text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-500 underline hover:text-blue-700"
          >
            Log in
          </Link>
        </p>
      </div>

      <Card className="w-full max-w-md p-4">
        <CardContent className="flex flex-col gap-6 mt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Account details */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs">{errors.password}</p>
                )}
                <p className="text-left text-xs text-stone-500 mt-1">
                  Use 8 or more characters with a mix of letters and numbers.
                </p>
              </div>

              <div>
                <Label htmlFor="password2">Confirm Password</Label>
                <Input
                  id="password2"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.password2}
                  onChange={handleChange}
                />
                {errors.password2 && (
                  <p className="text-red-500 text-xs">{errors.password2}</p>
                )}
              </div>
            </div>

            {/* Personal details */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs">{errors.first_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-4">
              <div>
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  placeholder="Street name"
                  value={formData.street}
                  onChange={handleChange}
                />
                {errors.street && (
                  <p className="text-red-500 text-xs">{errors.street}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City name"
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && (
                  <p className="text-red-500 text-xs">{errors.city}</p>
                )}
              </div>

              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  placeholder="Post code"
                  value={formData.postcode}
                  onChange={handleChange}
                />
                {errors.postcode && (
                  <p className="text-red-500 text-xs">{errors.postcode}</p>
                )}
              </div>
            </div>

            {/* General error */}
            {errors.general && (
              <p className="text-red-500 text-sm text-center">
                {errors.general}
              </p>
            )}

            {/* Success message */}
            {successMessage && (
              <p className="text-green-500 text-sm text-center">
                {successMessage}
              </p>
            )}

            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 w-full mt-2"
            >
              Create an account
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
