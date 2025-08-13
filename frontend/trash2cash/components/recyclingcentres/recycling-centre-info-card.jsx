import Image from "next/image";
import { useEffect, useState } from "react";

export default function RecyclingCentreInfoCard({ recycler }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("https://trash2cashpersonal.onrender.com/api/categories/")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  function timeFormat(timeStr) {
    // Validates the input string
    if (!timeStr) return "";

    // Splits the initial string (hh:mm:ss) to hour and minute (hh:mm)
    const [hour, minute] = timeStr.split(":");
    // Using the JavaScript Date object
    const date = new Date();
    date.setHours(+hour);
    date.setMinutes(+minute);

    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  // Map accepted_categories IDs to names using the fetched categories
  const acceptedCategories =
    recycler.accepted_categories && categories.length > 0
      ? recycler.accepted_categories
          .map((id) => categories.find((cat) => cat.id === id)?.name)
          .filter((name) => !!name && name.trim() !== "")
          .join(", ")
      : "None";

  // Each field besides recycling centre name uses parameter backend data --> recycler
  return (
    <div className="p-5 flex justify-between">
      <div>
        <p>
          <strong>Address:</strong>
        </p>
        <p>{recycler.address}</p>

        <p>
          <strong>Operating hours</strong>:
        </p>
        <p>
          {timeFormat(recycler.opening_time)} ~{" "}
          {timeFormat(recycler.closing_time)}
        </p>

        <p>
          <strong>Items processed:</strong>
        </p>
        <p>{acceptedCategories}</p>
      </div>

      <div className="overflow-hidden border border-gray-300 rounded-xl">
        <Image
          src="/recycle_centre_1.jpg"
          alt="Recycle centre"
          width={400}
          height={400}
        />
      </div>
    </div>
  );
}
