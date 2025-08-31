import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RecyclingCentreListItem({ centre, option }) {
  const router = useRouter();

  const handleGoToRecycleCentre = async () => {
    // Navigate to /appointment-view-2 with the centre_id as a query parameter
    const isDropoff = option === "Dropoff";
    const token = localStorage.getItem("access"); // JWT
      if (!token) {
        alert("You need to log in.");
      return;
    }
    const res = await fetch("http://localhost:8000/api/generate-ott/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // secure with JWT
      },
    });
    const data = await res.json();
    if (data.one_time_token) {
      router.replace(`/appointment-view-2?centreId=${centre.id}&is_dropoff=${isDropoff}&ott=${encodeURIComponent(data.one_time_token)}`);
    } else {
      alert("Failed to generate secure token");
    }
  };

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

  return (
    <div className="my-2 p-5 shadow-md border border-gray-300 rounded-xl">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative overflow-hidden rounded-xl w-[200px] h-[200px]">
          <Image
            src="/recycle_centre_1.jpg"
            alt="Recycle centre"
            className="hover:scale-110 transition object-cover"
            fill
          />
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">{centre.name}</h2>
          <p className="mb-2">
            <strong>Distance:</strong> {centre.distance_km} km
          </p>
          <p className="mb-2">
            <strong>Address:</strong> {centre.address}
          </p>
          <p className="mb-2">
            <strong>Operating hours:</strong> {timeFormat(centre.opening_time)}{" "}
            ~ {timeFormat(centre.closing_time)}
          </p>
          <div
            className="mt-4 inline-block cursor-pointer py-4 px-6 bg-trash2cash text-white rounded-xl shadow-xl hover:bg-trash2cash-dark"
            onClick={handleGoToRecycleCentre} // Call the navigation function on click
          >
            Make Booking
          </div>
        </div>
      </div>
    </div>
  );
}
