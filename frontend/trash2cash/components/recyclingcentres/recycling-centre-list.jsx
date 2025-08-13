"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import RecyclingCentreListItem from "./recycling-centre-list-item";

export default function RecyclingCentreList() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const option = searchParams.get("option");
  const [centres, setCentres] = useState(null);
  const [lat, setLat] = useState(null); // State for latitude
  const [lon, setLon] = useState(null); // State for longitude

  useEffect(() => {
    if (!category) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude); // Update latitude state
          setLon(position.coords.longitude); // Update longitude state
        },
        (error) => {
          console.error("Error getting location:", error);

          // Use fallback latitude and longitude
          setLat(3.0653108873119);
          setLon(101.60096175667952);
        },
      );
    } else {
      // If geolocation is not supported, use fallback values
      setLat(3.0653108873119);
      setLon(101.60096175667952);
    }
  }, [category]);

  useEffect(() => {
    if (!lat || !lon || !category) return;

    fetch(
      `http://127.0.0.1:8000/api/locate_centres/?latitude=${lat}&longitude=${lon}&category=${category}`,
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Data received:", data);
        setCentres(data);
      })
      .catch((err) => console.error("Error fetching centres:", err));
  }, [lat, lon, category]); // Re-run when lat, lon, or category changes

  if (!centres) return <p>Loading recycling centres...</p>;

  return (
    <main>
      <h3 className="-mx-5 w-screen bg-green-500 rounded-t text-white text-xl font-bold px-6 py-4">
        Recycling Centres for {category} ({option})
      </h3>
      {centres.map((centre, idx) => (
        <RecyclingCentreListItem key={idx} centre={centre} option={option} />
      ))}
    </main>
  );
}
