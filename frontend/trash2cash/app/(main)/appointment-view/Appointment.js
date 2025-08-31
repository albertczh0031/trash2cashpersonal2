"use client";

import React, { useState, useEffect } from "react";
import AdminTicketCard from "@/components/ui/admin-ticket-card";

/**
 * Centralized API endpoints
 */
const API = {
  APPOINTMENTS: "https://trash2cashpersonal.onrender.com/api/get-admin-appointments/",
  REFRESH_TOKEN: "https://trash2cashpersonal.onrender.com/api/token/refresh/",
};

export default function Appointment({ type }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      let access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      const tryFetch = async (token) => {
        const res = await fetch(API.APPOINTMENTS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Appointments fetch failed: ${res.status}`);
        return await res.json();
      };

      try {
        setLoading(true);
        const data = await tryFetch(access);
        setAppointments(data);
      } catch (error) {
        console.warn("[Appointments] Access expired, refreshing...", error);

        try {
          const refreshRes = await fetch(API.REFRESH_TOKEN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
          });

          if (!refreshRes.ok) throw new Error("Token refresh failed");

          const refreshData = await refreshRes.json();
          access = refreshData.access;
          localStorage.setItem("access", access);

          const data = await tryFetch(access);
          setAppointments(data);
        } catch (refreshError) {
          console.error("[Appointments] Refresh or retry failed:", refreshError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) return <p className="text-gray-100">Loading...</p>;
  if (appointments.length === 0)
    return (
      <p className="text-gray-100">
        {type === "active"
          ? "You have no active appointments!"
          : "You have no past appointments!"}
      </p>
    );

  return appointments
    .filter((appointment) =>
      type === "active"
        ? appointment.status !== "Completed"
        : appointment.status === "Completed"
    )
    .map((appointment) => (
      <AdminTicketCard
        key={appointment.appointment_id}
        appointment_id={appointment.appointment_id}
        item_desc={appointment.item_desc}
        date={appointment.date}
        points_earned={appointment.points_earned}
        item_img={appointment.item_img}
        status={appointment.status}
      />
    ));
}
