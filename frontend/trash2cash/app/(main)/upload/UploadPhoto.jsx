"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadForm } from "@/components/upload/UploadForm";
import { IdentificationDialog } from "@/components/upload/IdentificationDialog";
import { CategoryDialog } from "@/components/upload/CategoryDialog";
import { AppointmentDialog } from "@/components/upload/AppointmentDialog";
import { UploadInstructions } from "@/components/upload/UploadInstructions";

// helper function to get a valid access token
async function getValidAccessToken() {
  let accessToken = localStorage.getItem("access");
  const refreshToken = localStorage.getItem("refresh");

  if (!accessToken) return null;

  // test the current access token
  const res = await fetch("http://trash2cashpersonal.onrender.com/api/user-profile/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401 && refreshToken) {
    // try refreshing the token
    const refreshRes = await fetch("http://trash2cashpersonal.onrender.com/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      accessToken = data.access;
      localStorage.setItem("access", accessToken);
      return accessToken;
    } else {
      // refresh token expired -> log out
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return null;
    }
  }

  return accessToken;
}


export default function UploadPhoto() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [brand, setBrand] = useState("");
  const [message, setMessage] = useState("");
  const [identified, setIdentified] = useState(null);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const router = useRouter();

  const sanitizeInput = (value) => value.replace(/[<>"';`\-]/g, "").trim();
  const isInputSafe = (value) => !/[<>"';`\-]|(\b(SELECT|INSERT|DELETE|DROP|UPDATE|OR|AND)\b)/i.test(value);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleClick = async () => {
    setLoading(true); // disable button
    try {
      await handleUpload(); // your upload logic
    } finally {
      setLoading(false); // re-enable whether success or error
    }
  };

  const handleUpload = async () => {
    setIdentified(null);
    setCategory("");
    setCategories([]);
    setMessage("");

    for (const field of [description, weight, brand]) {
      if (!isInputSafe(field)) {
        setMessage("Potentially unsafe input detected. Please revise your entry.");
        return;
      }
    }

    const sanitizedDescription = sanitizeInput(description);
    const sanitizedWeight = sanitizeInput(weight);
    const sanitizedBrand = sanitizeInput(brand);

    if (!selectedFile) {
      setMessage("Please select a file before uploading.");
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("description", sanitizedDescription);
    formData.append("weight", sanitizedWeight);
    formData.append("brand", sanitizedBrand);
    formData.append("centre_id", 0);
    formData.append("date", currentDate);

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      setMessage("You need to log in.");
      return;
    }

    const responseUser = await fetch("http://trash2cashpersonal.onrender.com/api/user-profile/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (responseUser.ok) {
      const user = await responseUser.json();
      formData.append("user_name", user.username);
    }

    try {
      const response = await fetch("http://trash2cashpersonal.onrender.com/api/upload-and-analyze/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        if (data && typeof data === "object" && !Array.isArray(data)) setMessage(data);
        else setMessage(data.error || "An error occurred while uploading the file.");
      } else {
        // Successful response
        setIdentified(data.identified);
        setCategory(data.category || "");
        setCategories(data.categories || []);
        if (data.message) setMessage(data.message); // show API success message

        // Reset form fields
        setSelectedFile(null);
        setPreview(null);
        setDescription("");
        setWeight("");
        setBrand("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        // Show dialogs
        if (data.identified === true && data.message) setShowMessageDialog(true);
        else if (data.identified === false && data.message) setShowCategoryDialog(true);

        if (data.appointment) {
          setAppointmentDetails({
            date: data.appointment.date,
            time: data.appointment.time,
            centre: data.appointment.centre_name || data.appointment.centre || "",
          });
          setShowConfirmation(true);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred while uploading the file.");
    }
  };

  const handleConfirm = () => setShowPopup(true);
  const handleSelection = async (option) => {
    setShowPopup(false);
    const token = localStorage.getItem("access"); // JWT
      if (!token) {
        alert("You need to log in.");
      return;
    }
    const res = await fetch("http://trash2cashpersonal.onrender.com/api/generate-ott/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // secure with JWT
      },
    });

    const data = await res.json();
    if (data.one_time_token) {
      router.replace(`/recycling-centres?category=${category}&option=${option}&ott=${encodeURIComponent(data.one_time_token)}`);
    } else {
      alert("Failed to generate secure token");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col items-center justify-start p-4 space-y-6">
      {/* Keep UploadInstructions as-is */}
      <div className="w-full max-w-screen-2xl">
        <UploadInstructions />
      </div>

      {/* Main content */}
      <div
          className="max-w-md w-full p-6 shadow-lg border border-green-200 rounded-xl bg-white/70 backdrop-blur space-y-4">
        <h1 className="text-2xl font-bold text-green-800 text-center">Upload a Photo</h1>

        {/* Success/Error Message */}
        {message && (
            <div
                className={`p-3 rounded ${
                    identified
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-red-100 text-red-700 border-red-300"
                } border text-sm`}
            >
              {typeof message === "string" ? (
                  message
              ) : (
                  Object.entries(message).map(([field, errors]) => {
                    const label = field.charAt(0).toUpperCase() + field.slice(1);
                    return (
                        <div key={field}>
                          <strong>{label}:</strong> {errors}
                        </div>
                    );
                  })
              )}
            </div>
        )}

        {/* Preview */}
        {preview && (
            <div
                className="w-full h-48 border border-green-300 rounded-lg overflow-hidden flex items-center justify-center bg-green-50">
              <img src={preview} alt="Preview" className="object-contain w-full h-full"/>
            </div>
        )}
        {/* File button */}
        <button
            type="button"
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium shadow-md transition"
            onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? "Change File" : "Choose File"}
        </button>
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange}/>

        {/* Form fields */}
        <input
            type="text"
            placeholder="Description"
            className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />
        <input
            type="text"
            placeholder="Weight"
            className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
        />
        <input
            type="text"
            placeholder="Brand"
            className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
        />


        {/* Upload button */}
        <button
            type="button"
            className={`w-full px-4 py-3 rounded-lg font-medium shadow-md transition
        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}
            onClick={handleClick}
            disabled={loading}
        >
          {loading ? "Uploading..." : "Upload Photo"}
        </button>

        {/* Dialogs */}
        <IdentificationDialog
            showMessageDialog={showMessageDialog}
            message={message}
            onClose={(open) => setShowMessageDialog(open)}
            onConfirm={handleConfirm}
            onManualSelect={() => setShowCategoryDialog(true)}
        />
        <CategoryDialog
            showCategoryDialog={showCategoryDialog}
            categories={categories}
            onClose={(open) => setShowCategoryDialog(open)}
            onCategorySelect={(cat) => {
              setCategory(cat);
              setShowCategoryDialog(false);
              setShowPopup(true);
            }}
        />
        <AppointmentDialog
            showPopup={showPopup}
            onClose={(open) => setShowPopup(open)}
            onSelection={handleSelection}
        />

      </div>
    </div>
  );
}
