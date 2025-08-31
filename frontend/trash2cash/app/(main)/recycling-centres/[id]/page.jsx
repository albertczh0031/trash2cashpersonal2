"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import RecyclingCentreInfoCard from "@/components/recyclingcentres/recycling-centre-info-card";
import RecyclingCentreEditModal from "@/components/recyclingcentres/recycling-centre-edit-modal";

export default function RecyclingCentreDetailPage() {
  const { id } = useParams();

  // Initial state of getting the Recycling Center Admin information
  const [recycler, setRecycler] = useState(null); // No recycler found
  const [loading, setLoading] = useState(true); // Loading for the information
  const [error, setError] = useState(false); // No error detected initially

  useEffect(() => {
    // Fetch from backend data
    fetch(`http://127.0.0.1:8000/api/recycler/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Unable to get Recycler Data");
        return res.json();
      })
      .then((data) => {
        setRecycler(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = (updatedRecycler) => {
    setRecycler(updatedRecycler);
  };

  // Returns a message if loading
  if (loading)
    return (
      <p className="ml-30 lg:ml-50 mr-20 max-w-[1500px] mx-auto px-6">
        Loading... Please Hold On
      </p>
    );

  // If error or no information added, then return message
  if (error || !recycler)
    return (
      <p className="ml-30 lg:ml-50 mr-20 max-w-[1500px] mx-auto px-6">
        Recycling Center not found
      </p>
    );

  return (
    <main className="flex flex-col mx-5 space-y-4 bg-gradient-to-br from-green-50 to-green-100 min-h-screen p-6 rounded-xl">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="pl-2 pb-2 text-2xl">{recycler.name}</h1>

        <RecyclingCentreEditModal
          initialData={recycler}
          onSave={handleUpdate}
        />
      </div>

      <div className="p-5 border border-gray-500 rounded-xl">
        <RecyclingCentreInfoCard recycler={recycler} />
      </div>
    </main>
  );
}
