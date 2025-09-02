"use client";

import { useState, useRef, useEffect } from "react";
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
  const res = await fetch("https://trash2cashpersonal.onrender.com/api/user-profile/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401 && refreshToken) {
    // try refreshing the token
    const refreshRes = await fetch("https://trash2cashpersonal.onrender.com/api/token/refresh/", {
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
  // On first load, clear uploadForm from localStorage to avoid stale data
  useEffect(() => {
    localStorage.removeItem('uploadForm');
  }, []);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [brand, setBrand] = useState("");
  const [message, setMessage] = useState("");
  const [identified, setIdentified] = useState(null);
  const [category, setCategory] = useState("");
  const categoryRef = useRef("");
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
    // Only save to localStorage if all fields are filled
    if (description && weight && brand && category) {
      const uploadFormToSave = {
        description,
        weight,
        brand,
        category,
      };
      localStorage.setItem('uploadForm', JSON.stringify(uploadFormToSave));
      console.log('[DEBUG] Saved to localStorage:', uploadFormToSave);
    } else {
      console.warn('[DEBUG] Not saving to localStorage: missing fields', { description, weight, brand, category });
    }
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

    const responseUser = await fetch("https://trash2cashpersonal.onrender.com/api/user-profile/", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (responseUser.ok) {
      const user = await responseUser.json();
      formData.append("user_name", user.username);
    }

    try {
      const response = await fetch("https://trash2cashpersonal.onrender.com/api/upload-and-analyze/", {
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

        // Only update localStorage if all fields are filled and not empty
        const uploadForm = {
          category: data.category || category || "",
          weight: weight,
          brand: brand,
          description: description,
        };
        if (data.item_id) {
          uploadForm.item_id = data.item_id;
        }
        if (uploadForm.category && uploadForm.weight && uploadForm.brand && uploadForm.description) {
          localStorage.setItem('uploadForm', JSON.stringify(uploadForm));
          console.log('[DEBUG] Saved to localStorage after upload:', uploadForm);
        } else {
          console.warn('[DEBUG] Not saving to localStorage after upload: missing fields', uploadForm);
        }

        // Now reset form fields
        setSelectedFile(null);
        setPreview(null);
        setDescription("");
        setWeight("");
        setBrand("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        // Show dialogs
        if (data.identified === true && data.message) setShowMessageDialog(true);
        else if (data.identified === false && data.message) {
          console.log('[DEBUG] Opening CategoryDialog. Current category:', category, 'categories:', categories);
          setShowCategoryDialog(true);
        }

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
  const getAccessToken = async () => {
  let access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // Try a test request with current access token
  const testRes = await fetch("https://trash2cashpersonal.onrender.com/api/validate-ott/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access}`,
    },
  });

  if (testRes.status === 401 && refresh) {
    // Access token expired, refresh it
    const refreshRes = await fetch("https://trash2cashpersonal.onrender.com/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!refreshRes.ok) throw new Error("Token refresh failed");

    const refreshData = await refreshRes.json();
    access = refreshData.access;

    // Save new token
    localStorage.setItem("access", access);
  }

  return access;
};
  const handleSelection = async (option) => {
    setShowPopup(false);
    // Always use the latest selected category (from ref)
    const selectedCategory = categoryRef.current || category;
    // Only update localStorage if all fields are filled and not empty
    if (selectedCategory && weight && brand && description) {
      localStorage.setItem('uploadForm', JSON.stringify({
        category: selectedCategory,
        weight,
        brand,
        description
      }));
      console.log('[DEBUG] handleSelection called. Using selectedCategory:', selectedCategory, 'option:', option);
    } else {
      console.warn('[DEBUG] Not saving to localStorage in handleSelection: missing fields', { selectedCategory, weight, brand, description });
    }
    try {
      const token = await getAccessToken();
      const res = await fetch("https://trash2cashpersonal.onrender.com/api/generate-ott/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to generate OTT");
      const data = await res.json();
      if (data.one_time_token) {
        console.log('[DEBUG] Navigating to /recycling-centres with:', {
          category: selectedCategory,
          option,
          ott: data.one_time_token
        });
        router.replace(
          `/recycling-centres?category=${selectedCategory}&option=${option}&ott=${encodeURIComponent(data.one_time_token)}`
        );
      } else {
        alert("Failed to generate secure token");
      }
    } catch (err) {
      console.error(err);
      alert("You need to log in again.");
    }
  };

  // Restore form fields from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem('uploadForm');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.category) setCategory(data.category);
        if (data.weight) setWeight(data.weight);
        if (data.brand) setBrand(data.brand);
        if (data.description) setDescription(data.description);
      } catch (e) { /* ignore */ }
    }
  }, []);

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
        <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*" />

        {/* Form fields */}
        <input
            type="text"
            placeholder="Description"
            className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />
        <input
            type="number"
            placeholder="Weight (kg)"
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
            onClose={(open) => {
              console.log('[DEBUG] CategoryDialog closed. open:', open, 'Current category:', category);
              setShowCategoryDialog(open);
            }}
            onCategorySelect={(cat) => {
              console.log('[DEBUG] Category selected:', cat);
              setCategory(cat);
              categoryRef.current = cat;
              setShowCategoryDialog(false);
              setShowPopup(true);
              setTimeout(() => {
                console.log('[DEBUG] After setCategory, category is now:', category, 'categoryRef.current:', categoryRef.current);
              }, 0);
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
