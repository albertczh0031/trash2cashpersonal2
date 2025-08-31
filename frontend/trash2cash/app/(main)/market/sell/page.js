"use client";

import { useState, useEffect } from "react";
import CreateListingModal from "./CreateListingModal";

export default function MarketplacePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch user's listings
  const fetchListings = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/marketplace/my-listings/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      const data = await response.json();

      // Ensure data is an array
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage("Error fetching listings: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="p-6">
      {/* Create Listing Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-6"
      >
        + Create Listing
      </button>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchListings(); // refresh listings after creating
        }}
      />

      {/* Listings */}
      {loading ? (
        <p>Loading your listings...</p>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
{listings.map((listing, idx) => {
  let imageUrl = null;

  if (Array.isArray(listing.images) && listing.images.length > 0) {
    // Take the first image from the array
    const firstImage = listing.images[0];
    imageUrl = firstImage.startsWith("http")
      ? firstImage
      : `http://127.0.0.1:8000${firstImage}`;
  } else if (typeof listing.images === "string") {
    // If it's just a string
    imageUrl = listing.images.startsWith("http")
      ? listing.images
      : `http://127.0.0.1:8000${listing.images}`;
  }

            return (
              <div
                key={`${listing.id}-${listing.category || idx}`} // composite key avoids duplicates
                className="border rounded-lg shadow p-4 bg-white hover:shadow-lg transition"
              >
                {listing.images && (
                  <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-full h-48 object-cover rounded-md mb-3"
                  />
                )}
                <h2 className="text-lg font-semibold mb-1">{listing.title}</h2>
                <p className="text-gray-600 mb-2">{listing.description}</p>
                <p className="font-bold mb-1">${listing.price}</p>

                {/* Clothes-specific info */}
                {listing.sizes && <p>Size: {listing.sizes}</p>}
                {listing.gender && <p>Gender: {listing.gender}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <p>No listings yet. Create one!</p>
      )}

      {message && (
        <p className="mt-4 text-center text-sm text-red-600">{message}</p>
      )}
    </div>
  );
}
