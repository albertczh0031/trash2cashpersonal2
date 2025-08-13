"use client";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation"; // Importing useRouter for navigation
import "./css/UploadPhotoStyles.css"; // Import component-specific styles
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";

/**
 * UploadPhoto Component
 *  test run pipleline test 20
 * This component provides a user interface to:
 * - Upload a photo file (image)
 * - Input associated metadata (description, weight, brand)
 * - Preview the selected image
 * - Send the data to a backend API for analysis
 *
 * Features:
 * - Input sanitation and validation for security
 * - Safe file uploads
 * - Displays backend feedback (success or error message)
 */
export default function UploadPhoto() {
  // State hooks for managing form fields and upload states
  const [selectedFile, setSelectedFile] = useState(null); // Stores the selected image file
  const [preview, setPreview] = useState(null); // Stores the preview image URL
  const [description, setDescription] = useState(""); // Stores item description
  const [weight, setWeight] = useState(""); // Stores item weight
  const [brand, setBrand] = useState(""); // Stores item brand
  const [message, setMessage] = useState(""); // Stores response message from backend
  const [identified, setIdentified] = useState(null); // Tracks if the item was identified
  const [category, setCategory] = useState(""); // Identified category
  const [categories, setCategories] = useState([]); // List of categories for manual selection
  const [appointmentId, setAppointmentId] = useState(null); // Appointment ID
  const [showPopup, setShowPopup] = useState(false); // Controls visibility of the confirmation popup

  // Ref hook for accessing the file input DOM element
  const fileInputRef = useRef(null);
  const router = useRouter(); // Initialize router for navigation

  /**
   * Sanitize input to remove potentially dangerous characters.
   * Prevents injection attacks and enforces clean input.
   *
   * @param {string} value - Input value to sanitize
   * @returns {string} - Sanitized string
   */
  const sanitizeInput = (value) => {
    return value.replace(/[<>"';`\-]/g, "").trim();
  };

  /**
   * Validates input for known unsafe patterns like SQL keywords and special characters.
   *
   * @param {string} value - Input value to validate
   * @returns {boolean} - True if input is safe, False if suspicious
   */
  const isInputSafe = (value) => {
    const pattern =
      /[<>"';`\-]|(\b(SELECT|INSERT|DELETE|DROP|UPDATE|OR|AND)\b)/i;
    return !pattern.test(value);
  };

  /**
   * Handles file selection and updates the preview.
   *
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // Generate a temporary preview URL
    }
  };

  /**
   * Handles the upload of the file and metadata to the backend API.
   * Validates and sanitizes user input before sending.
   * Handles backend response for success or error.
   */
  const handleUpload = async () => {
    // Reset state for results when a new upload starts
    setIdentified(null);
    setCategory("");
    setCategories([]);
    setAppointmentId(null);

    // Validate all input fields
    const allFields = [description, weight, brand];
    for (const field of allFields) {
      if (!isInputSafe(field)) {
        alert("Potentially unsafe input detected. Please revise your entry.");
        return;
      }
    }

    // Sanitize user input
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedWeight = sanitizeInput(weight);
    const sanitizedBrand = sanitizeInput(brand);

    if (!selectedFile) return alert("Please select a file before uploading.");

    // Get the current date in YYYY-MM-DD format
    const currentDate = new Date().toISOString().split("T")[0];

    // Prepare multipart form data
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("description", sanitizedDescription);
    formData.append("weight", sanitizedWeight);
    formData.append("brand", sanitizedBrand);
    formData.append("centre_id", 0); // Placeholder for centre_id, replace with actual value
    formData.append("date", currentDate); // Add the current date

    // Fetch user profile from the backend
    const fetchUserProfile = async () => {
      const accessToken = localStorage.getItem("access");
      if (!accessToken) {
        alert("You need to log in.");
        return;
      }
      const response = await fetch("https://trash2cashpersonal.onrender.com/api/user-profile/", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const user = await response.json();
        // Use user details as needed
        console.log(user);
        return user.username;
      } else {
        console.error("Failed to fetch user profile");
      }
    };

    formData.append("user_name", await fetchUserProfile());

    try {
      // Send the POST request to the backend
      const response = await fetch(
        "https://trash2cashpersonal.onrender.com/api/upload-and-analyze/",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle server-side error response
        setMessage(data.error || "An error occurred while uploading the file.");
      } else {
        // Handle successful analysis
        setMessage(data.message);
        setIdentified(data.identified);
        setCategory(data.category || "");
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error during upload:", error);
      setMessage("An error occurred while uploading the file.");
    }

    // Reset form state after upload
    setSelectedFile(null);
    setPreview(null);
    setDescription("");
    setWeight("");
    setBrand("");
  };

  const handleConfirm = () => {
    setShowPopup(true); // Show the popup when the user confirms
  };

  const handleSelection = (option) => {
    console.log(`Selected: ${option}, Category: ${category}`);
    setShowPopup(false); // Close the popup
    router.push(`/recycling-centres?category=${category}&option=${option}`); // Navigate to the next page
  };

  return (
    <div className="container">
      <h3 className="title">Upload a Photo</h3>

      {/* File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden-input"
      />

      {/* Button to trigger file input */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="file-button"
      >
        {selectedFile ? "Change File" : "Choose File"}
      </button>

      {/* Image Preview */}
      {preview && <img src={preview} alt="Preview" className="preview-image" />}

      {/* Description Input */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter description"
        className="textarea"
        rows={3}
      />

      {/* Weight Input */}
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="Weight (kg)"
        className="input"
        min="0"
      />

      {/* Brand Input */}
      <input
        type="text"
        value={brand}
        onChange={(e) => setBrand(e.target.value)}
        placeholder="Brand name"
        className="input"
      />

      {/* Upload Button */}
      <button onClick={handleUpload} className="upload-button">
        Upload
      </button>

      {/* Display Backend Message */}
      {message && <p className="message">{message}</p>}

      {identified === true && showPopup === false && (
        <div>
          <button onClick={() => handleConfirm(true)} className="upload-button">
            Yes. Find me an appointment...
          </button>
        </div>
      )}

      {identified === false && (
        <div>
          <div className="flex justify-center items-center">
            <Button className="bg-green-600">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="dropdown justify-center items-center"
              >
                <option value="" className="text-lime-600">Select a category</option>
                {[...new Set(categories)].map((cat) => (
                  <option key={cat} value={cat} className="text-lime-600">
                    {cat}
                  </option>
                ))}
              </select>
            </Button>
          </div>
          <p className="disclaimer">
            Appointment will be manually verified. You will get a confirmation
            email after verification.
          </p>
          {category && (
            <button
              onClick={() => handleConfirm(false)}
              className="upload-button"
            >
              Find me an appointment...
            </button>
          )}
        </div>
      )}

      {/* Popup Modal */}
      {showPopup == true && (
        <Dialog>
          <DialogTrigger className="upload-button">
            Select type of appointment
          </DialogTrigger>
          <DialogContent className="sm:max-w-md items-center justify-center">
            <DialogHeader className="text-center">
              <DialogTitle>
                For this appointment, would you like to..
              </DialogTitle>
            </DialogHeader>
            <div className="flex space-x-5 items-center justify-center">
              <Button
                onClick={() => handleSelection("Pickup")}
                className="bg-green-600"
              >
                Schedule Pickup
              </Button>
              <Button
                onClick={() => handleSelection("Dropoff")}
                className="bg-green-600"
              >
                Dropoff Manually
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
