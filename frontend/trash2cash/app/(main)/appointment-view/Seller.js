"use client";

import React, { useState, useEffect } from "react";

/**
 * Centralized API endpoints
 */
const API = {
  PENDING_SELLERS: "http://127.0.0.1:8000/api/pending-sellers/",
  APPROVE_SELLER: (id) => `http://127.0.0.1:8000/approve-seller/${id}/`,
};

export default function Seller() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch(API.PENDING_SELLERS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("access"),
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sellers");
        return res.json();
      })
      .then((data) => setSellers(data))
      .catch((err) => console.error("[Sellers] Fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  async function approveSeller(userId) {
    try {
      const res = await fetch(API.APPROVE_SELLER(userId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access"),
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Approve seller failed: ${res.status}`);

      const data = await res.json();
      alert(data.message);

      setSellers((prev) => prev.filter((s) => s.id !== userId));
    } catch (err) {
      alert("Error approving seller: " + err.message);
    }
  }

  if (loading) return <p className="text-gray-100">Loading sellers...</p>;
  if (sellers.length === 0) return <p className="text-gray-100">No pending sellers</p>;

  return sellers.map((seller) => (
    <div
      key={seller.id}
      className="flex items-center justify-between bg-green-50/90 border border-green-200 
                 p-4 rounded-xl shadow-sm hover:shadow-md transition"
    >
      <div className="flex-1 min-w-0 pr-4">
        <h3 className="font-semibold text-green-900 truncate">{seller.username}</h3>
        <p className="text-green-700 break-words text-sm">{seller.email}</p>
      </div>

      <button
        onClick={() => approveSeller(seller.id)}
        className="flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg 
                   hover:bg-green-700 transition"
      >
        Approve
      </button>
    </div>
  ));
}
