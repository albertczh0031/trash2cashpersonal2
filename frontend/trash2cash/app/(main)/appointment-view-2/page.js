"use client"; // This allows us to use React hooks and client-side rendering

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSearchParams } from "next/navigation"; // For getting query parameters

import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";

const AppointmentPage = () => {
  const searchParams = useSearchParams(); // Initialize search params
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Today's date as default
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const formattedDate = selectedDate.toISOString().split("T")[0]; // Re-formats the date as YYYY-MM-DD
    const centreId = searchParams.get("centreId"); // Get the centre ID from the URL
    const isDropoff = searchParams.get("is_dropoff"); // Get the is_dropoff parameter from the URL

    fetch(
      `https://trash2cashpersonal2.onrender.com/api/appointments/${centreId}/${formattedDate}/?is_dropoff=${isDropoff}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched appointments:", data);
        setAppointments(data); // Update the state with the fetched appointments
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching appointments:", error);
        setLoading(false);
      });
  }, [selectedDate]); // Re-fetch appointments whenever the selected date changes

  // To get a new access token when it expiress
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch("https://trash2cashpersonal2.onrender.com/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      return data.access; // Return the new access token
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return null;
    }
  };

  const bookAppointment = async (appointmentId) => {
    const userToken = localStorage.getItem("access"); // Retrieve the access token from local storage
    const refreshToken = localStorage.getItem("refresh"); // Retrieve the refresh token from local storage

    if (!userToken || !refreshToken) {
      alert("You need to log in to book an appointment.");
      return;
    }

    setBooking(true); // Set booking state to true while processing

    try {
      let response = await fetch(
        "https://trash2cashpersonal2.onrender.com/api/appointments/confirm/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ appointment_id: appointmentId }),
        },
      );

      if (response.status === 401) {
        // Token might be expired, try refreshing it
        const newAccessToken = await refreshAccessToken(refreshToken);
        if (newAccessToken) {
          // Retry the request with the new token
          response = await fetch(
            "https://trash2cashpersonal2.onrender.com/api/appointments/confirm/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newAccessToken}`,
              },
              body: JSON.stringify({ appointment_id: appointmentId }),
            },
          );
        } else {
          throw new Error("Failed to refresh token");
        }
      }

      if (!response.ok) {
        throw new Error("Failed to book appointment");
      }

      const data = await response.json();
      alert("Appointment booked successfully!");
      // Optionally, remove the booked appointment from the list
      setAppointments((prev) =>
        prev.filter(
          (appointment) => appointment.appointment_id !== appointmentId,
        ),
      );
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment.");
    } finally {
      setBooking(false); // Reset booking state
    }
  };

  return (
    <div className="w-full bg-white z-10">
      <div className="bg-green-500 rounded-t-xl">
        <Header title="Make an appointment" />
      </div>

      <div className="">
        <div className="m-2 p-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-300 shadow-xl">
          {/* Date Picker Section */}
          <div className="flex flex-col items-center border rounded-2xl p-4">
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Select a Date
            </p>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="yyyy-MM-dd"
              className="text-center border border-gray-300 rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              inline
            />
          </div>

          {/* Appointment Table Section */}
          <div className="flex flex-col items-center justify-start border rounded-2xl p-4">
            {loading ? (
              <p className="text-gray-600">Loading appointments...</p>
            ) : appointments.length > 0 ? (
              <table className="w-full text-sm text-left text-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-gray-600">Time</th>
                    <th className="px-3 py-2 text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-3 py-2">{appointment.time}</td>
                      <td className="px-3 py-2">
                        <Button
                          onClick={() =>
                            bookAppointment(appointment.appointment_id)
                          }
                          disabled={booking}
                          className="bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {booking ? "Booking..." : "Book"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600">No appointments found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
