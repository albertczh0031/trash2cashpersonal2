"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Validate current step
  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.username.trim()) newErrors.username = "Username is required.";
      if (!formData.email.includes("@")) newErrors.email = "Invalid email address.";
    }
    if (step === 2) {
      if (!formData.first_name.trim()) newErrors.first_name = "First name is required.";
      if (!formData.last_name.trim()) newErrors.last_name = "Last name is required.";
    }
    if (step === 3) {
      if (!formData.street.trim()) newErrors.street = "Street is required.";
      if (!formData.postcode.trim()) newErrors.postcode = "Postcode is required.";
      if (!formData.city.trim()) newErrors.city = "City is required.";
      if (!formData.password || formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters.";
      if (formData.password !== formData.password2)
        newErrors.password2 = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    // Validate full form before submitting
    const fullErrors = {};
    if (!formData.username.trim()) fullErrors.username = "Username is required.";
    if (!formData.email.includes("@")) fullErrors.email = "Invalid email address.";
    if (!formData.first_name.trim()) fullErrors.first_name = "First name is required.";
    if (!formData.last_name.trim()) fullErrors.last_name = "Last name is required.";
    if (!formData.street.trim()) fullErrors.street = "Street is required.";
    if (!formData.postcode.trim()) fullErrors.postcode = "Postcode is required.";
    if (!formData.city.trim()) fullErrors.city = "City is required.";
    if (!formData.password || formData.password.length < 8)
      fullErrors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.password2)
      fullErrors.password2 = "Passwords do not match.";

    if (Object.keys(fullErrors).length > 0) {
      setErrors(fullErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://trash2cashpersonal.onrender.com/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const newErrors = {};
        if (data.username) newErrors.username = Array.isArray(data.username) ? data.username[0] : data.username;
        if (data.email) newErrors.email = Array.isArray(data.email) ? data.email[0] : data.email;
        if (data.non_field_errors) newErrors.general = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Authenticate
      const res = await fetch("https://trash2cashpersonal.onrender.com/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Signup failed.");
      const { access, refresh } = await res.json();

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      const sessionRes = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ user: { id: extractUserIdFromToken(access), email: formData.email } }),
      });

      if (!sessionRes.ok) throw new Error("Session creation failed");

      setSuccessMessage("Signup successful!");
      setTimeout(() => router.push("/auth/verify-otp"), 1500);
    } catch (err) {
      console.error(err);
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const extractUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch {
      return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Create an account</h1>
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-500 underline hover:text-blue-700">Log in</Link>
        </p>
      </div>

      <Card className="w-full max-w-md p-4">
        <CardContent className="flex flex-col gap-6 mt-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={formData.username} onChange={handleChange} placeholder="Enter your username" />
                  {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" />
                  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" value={formData.first_name} onChange={handleChange} placeholder="Enter your first name" />
                  {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" value={formData.last_name} onChange={handleChange} placeholder="Enter your last name" />
                  {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <Label htmlFor="street">Street</Label>
                  <Input id="street" value={formData.street} onChange={handleChange} placeholder="Street" />
                  {errors.street && <p className="text-red-500 text-xs">{errors.street}</p>}
                </div>
                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input id="postcode" value={formData.postcode} onChange={handleChange} placeholder="Postcode" />
                  {errors.postcode && <p className="text-red-500 text-xs">{errors.postcode}</p>}
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={handleChange} placeholder="City" />
                  {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter password" />
                  {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                </div>
                <div>
                  <Label htmlFor="password2">Confirm Password</Label>
                  <Input id="password2" type="password" value={formData.password2} onChange={handleChange} placeholder="Confirm password" />
                  {errors.password2 && <p className="text-red-500 text-xs">{errors.password2}</p>}
                </div>
              </>
            )}

            {errors.general && <p className="text-red-500 text-sm text-center">{errors.general}</p>}
            {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

            <div className="flex justify-between mt-2">
              {step > 1 && <Button type="button" variant="outline" onClick={handleBack}>Back</Button>}
              {step < 3 ? (
                <Button type="button" onClick={handleNext} className="bg-green-500 hover:bg-green-600 px-6 py-2">Next</Button>
              ) : (
                <Button type="submit" className="bg-green-500 hover:bg-green-600 px-6 py-2 flex items-center justify-center gap-2" disabled={loading}>
                  {loading && <Loader2 className="animate-spin h-5 w-5" />}
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
