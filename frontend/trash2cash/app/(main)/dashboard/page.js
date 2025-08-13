"use client";

import React, { useState } from "react";
import Header from "@/components/ui/header"; 
import EducationalCard from "@/components/dashboard-card/educational-card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useRouter } from 'next/navigation';
import educationalItems from './educationalData';

export default function DashboardPage() {
  // State to track the uploading status
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  // State to track the search query for recycling locations
  const [searchQuery, setSearchQuery] = useState("");

  // Handle the upload process (simulated with a timeout)
  const handleUpload = async () => {
    setIsUploading(true); // Set isUploading to true when the upload starts

    // Simulate the upload process with a timeout (you can replace this with your real upload logic)
    setTimeout(() => {
      setIsUploading(false); // Set isUploading to false after the upload is done
      router.push("/upload"); // Redirect to /app/upload/page.js
    }, 3000); // Simulating 3 seconds upload time
  };

  // Handle the search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Update the search query state as user types
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-[#e6f4ea]">
      <Header title="Trash or Treasure?" />
      <main className="flex-1 overflow-y-auto px-10 py-6">
        <div className="flex justify-center">
          <div className="grid md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 mt-6 gap-6">
            {educationalItems.map((item, idx) => (
              <EducationalCard key={idx} {...item} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
