"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";
import AppointmentConfirmationDialog from "@/components/upload/AppointmentConfirmationDialog";

import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";

const AppointmentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- Query params ---
  const ott = searchParams.get("ott");
  const centreId = searchParams.get("centreId");
  const isDropoff = searchParams.get("is_dropoff");

  // --- State ---
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [booking, setBooking] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // --- Utils ---
  const formatDateLocal = (d) => {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // --- API helpers ---
  const validateOtt = async (ott) => {
    try {
      const res = await fetch(
        `https://trash2cashpersonal.onrender.com/api/validate-ott/?ott=${ott}`,
      );
      const data = await res.json();
      return data.valid;
    } catch {
      return false;
    }
  };

  const fetchAppointments = async (centreId, date, isDropoff) => {
    const res = await fetch(
      `https://trash2cashpersonal.onrender.com/api/appointments/${centreId}/${date}/?is_dropoff=${isDropoff}`,
    );
    if (!res.ok) throw new Error("Failed to fetch appointments");
    return res.json();
  };

  const refreshAccessToken = async (refreshToken) => {
    try {
      const res = await fetch(
        "https://trash2cashpersonal.onrender.com/api/token/refresh/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        },
      );
      if (!res.ok) throw new Error("Failed to refresh access token");
      const data = await res.json();
      return data.access;
    } catch (err) {
      console.error("Error refreshing access token:", err);
      return null;
    }
  };

  const confirmAppointment = async (appointmentId, token) => {
    const res = await fetch(
      "https://trash2cashpersonal.onrender.com/api/appointments/confirm/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appointment_id: appointmentId }),
        credentials: "include",
      },
    );
    if (!res.ok) throw new Error("Failed to confirm appointment");
    return res.json();
  };

  // --- Effects ---
  // Validate OTT
  useEffect(() => {
    if (!ott) {
      router.replace("/upload");
      return;
    }
    validateOtt(ott).then((valid) => {
      if (!valid) router.replace("/upload");
    });
  }, [ott, router]);

  // Fetch appointments when date changes
  useEffect(() => {
    if (!centreId || !selectedDate) return;
    setLoading(true);
    fetchAppointments(centreId, formatDateLocal(selectedDate), isDropoff)
      .then(setAppointments)
      .catch((err) => console.error("Error fetching appointments:", err))
      .finally(() => setLoading(false));
  }, [centreId, selectedDate, isDropoff]);

  // Warn user before leaving
  useEffect(() => {
    const handlePopState = (event) => {
      const confirmLeave = window.confirm(
        "You have already submitted the form. Going back may cause data loss. Do you still want to leave?",
      );
      if (!confirmLeave) {
        window.history.pushState(null, "", window.location.href);
      }
    };
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        "You have already submitted the form. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // --- Actions ---
  const handleBook = async (appointmentId) => {
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");

    if (!accessToken || !refreshToken) {
      alert("You need to log in to book an appointment.");
      return;
    }

    setBooking(true);
    try {
      let token = accessToken;
      try {
        await confirmAppointment(appointmentId, token);
      } catch (err) {
        if (err.message.includes("401")) {
          token = await refreshAccessToken(refreshToken);
          if (!token) throw new Error("Unable to refresh token");
          await confirmAppointment(appointmentId, token);
        } else {
          throw err;
        }
      }

      const booked = appointments.find((a) => a.appointment_id === appointmentId);
      setConfirmedAppointment({
        ...booked,
        date: formatDateLocal(selectedDate),
      });

      setAppointments((prev) =>
        prev.filter((a) => a.appointment_id !== appointmentId),
      );
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setBooking(false);
    }
  };

  // --- UI ---
  return (
    <div className="w-full bg-white z-10">
      <div className="bg-green-500 rounded-t-xl">
        <Header title="Make an appointment" />
      </div>

      <div className="m-2 p-6 grid grid-cols-2 gap-4 rounded-xl border border-gray-300 shadow-xl">
        {/* Date Picker */}
        <div className="flex flex-col items-center border rounded-2xl p-4">
          <p className="text-lg font-semibold text-gray-700 mb-2">Select a Date</p>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            dateFormat="yyyy-MM-dd"
            className="text-center border border-gray-300 rounded-xl p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            inline
          />
        </div>

        {/* Appointment Table */}
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
                        onClick={() => handleBook(appointment.appointment_id)}
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

      {/* Confirmation Dialog */}
      {confirmedAppointment && (
        <AppointmentConfirmationDialog
          open={!!confirmedAppointment}
          onClose={() => setConfirmedAppointment(null)}
          appointmentDetails={confirmedAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentPage;
