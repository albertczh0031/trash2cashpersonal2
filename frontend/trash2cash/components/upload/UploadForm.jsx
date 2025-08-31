"use client";

import { useRef } from "react";

export function UploadForm({ 
  selectedFile, 
  preview, 
  description, 
  weight, 
  brand, 
  fileInputRef,
  onFileChange,
  onDescriptionChange,
  onWeightChange,
  onBrandChange,
  onUpload,
  onFileButtonClick
}) {
  return (
    <div className="space-y-6">
      {/* File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
      />

      {/* Button to trigger file input */}
      <button
        type="button"
        onClick={onFileButtonClick}
        className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
      >
        {selectedFile ? "Change File" : "Choose File"}
      </button>

      {/* Image Preview */}
      {preview && (
        <div className="flex justify-center">
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-48 rounded-lg shadow border border-gray-200 object-contain"
          />
        </div>
      )}

      {/* Description Input */}
      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Enter description"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none resize-none"
        rows={3}
      />

      {/* Weight Input */}
      <input
        type="number"
        value={weight}
        onChange={(e) => onWeightChange(e.target.value)}
        placeholder="Weight (kg)"
        min="0"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
      />

      {/* Brand Input */}
      <input
        type="text"
        value={brand}
        onChange={(e) => onBrandChange(e.target.value)}
        placeholder="Brand name"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
      />

      {/* Upload Button */}
      <button 
        onClick={onUpload} 
        className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
      >
        Upload
      </button>
    </div>
  );
}
