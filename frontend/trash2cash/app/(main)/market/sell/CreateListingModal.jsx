"use client";
import { useState } from "react";

export default function CreateListingModal({ isOpen, onClose }) {
  const [category, setCategory] = useState("");
  const [listing, setListing] = useState({});
  const [images, setImages] = useState([]); // multiple files
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setListing({ ...listing, [e.target.name]: e.target.value });
  };

  // ✅ Append instead of replacing
  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
  };

  // ✅ Remove an image by index
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", listing.title || "");
      formData.append("price", listing.price || "");
      formData.append("description", listing.description || "");

      if (category === "Clothe") {
        formData.append("sizes", listing.sizes || "");
        formData.append("gender", listing.gender || "");
      }

      // append multiple images with the same field name "images"
      images.forEach((file) => formData.append("images", file));

      const res = await fetch("http://trash2cashpersonal.onrender.com/api/marketplace/create-listing/", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Listing created successfully!");
        setListing({});
        setCategory("");
        setImages([]);
        onClose();
      } else {
        setMessage(typeof data === "string" ? data : JSON.stringify(data));
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">✕</button>
        <h1 className="text-xl font-bold mb-4 text-center">Create New Listing</h1>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full border rounded p-2">
              <option value="">-- Select Category --</option>
              <option value="Electronic">Electronic</option>
              <option value="Clothe">Clothe</option>
              <option value="BooksMagazines">Books &amp; Magazines</option>
              <option value="Furniture">Furniture</option>
              <option value="MiscItems">Misc Items</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input type="text" name="title" value={listing.title || ""} onChange={handleInputChange} required className="w-full border rounded p-2"/>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input type="number" name="price" value={listing.price || ""} onChange={handleInputChange} required className="w-full border rounded p-2"/>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea name="description" value={listing.description || ""} onChange={handleInputChange} className="w-full border rounded p-2"/>
          </div>

          {/* Extra for Clothes */}
          {category === "Clothe" && (
            <>
              <div>
                <label className="block text-sm font-medium">Size</label>
                <select name="sizes" value={listing.sizes || ""} onChange={handleInputChange} required className="w-full border rounded p-2">
                  <option value="">-- Select Size --</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Gender</label>
                <select name="gender" value={listing.gender || ""} onChange={handleInputChange} required className="w-full border rounded p-2">
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </>
          )}

          {/* Multiple Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="hidden"
                id="fileUpload"
              />
              <label htmlFor="fileUpload" className="cursor-pointer text-blue-600 hover:underline">
                Add Images
              </label>

              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 w-full">
                  {images.map((f, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-24 object-cover rounded-md shadow-sm"
                      />
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1 opacity-80 hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            {loading ? "Creating..." : "Create Listing"}
          </button>

          {message && <p className="mt-2 text-sm text-red-600 text-center">{message}</p>}
        </form>
      </div>
    </div>
  );
}
