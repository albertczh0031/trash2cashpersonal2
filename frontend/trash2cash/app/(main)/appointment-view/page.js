"use client";

import React, { useState } from "react";
import Header from "@/components/ui/header";
import AdminTicketCard from "@/components/ui/admin-ticket-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AppointmentView() {
  const [view, setView] = useState("active");

  const appointmentElements = {
    active: [
      {
        appointment_id: 2,
        item_desc: "this is an item",
        date: "1/1/2026 3pm",
        points_earned: "30",
        item_img: "null",
      },
      {
        appointment_id: 3,
        item_desc: "item",
        date: "1/2/2026 6pm",
        points_earned: "10",
        item_img: "null",
      },
    ],
    past: [
      {
        appointment_id: "1",
        item_desc: "this is also an item",
        date: "1/5/2025 3pm",
        points_earned: "60",
        item_img: "nulll",
      },
    ],
  };

  const appointments =
    view === "active" ? appointmentElements.active : appointmentElements.past;

  return (
    <div className="flex flex-col gap-6">
      <main className="w-screen h-screen bg-green-600">
        <Header title="Appointment Manager" />

        <div className="flex justify-start w-full mt-6 px-10">
          <Tabs
            defaultValue="active"
            value={view}
            onValueChange={setView}
            className="relative w-[300px]"
          >
<TabsList className="relative flex w-full border border-gray-300 bg-white text-gray-800 overflow-hidden rounded-sm p-0">

  {/* Sliding background fill with extra text */}
  <div
    className="absolute top-0 left-0 h-full w-1/2 bg-green-700 rounded-sm transition-transform duration-300 ease-in-out flex items-center justify-center"
    style={{
      transform: view === "past" ? "translateX(100%)" : "translateX(0%)",
      zIndex: 30, // put it above white bg but below tab labels
    }}
  >
    {/* Extra text on sliding fill */}
    <span className="text-white font-semibold select-none pointer-events-none">
      {view === "active" ? " Active" : "Past"}
    </span>
  </div>

  <TabsTrigger
    value="active"
    className={`relative w-1/2 px-4 py-2 text-center font-medium select-none ${
      view === "active" ? "text-white" : "text-gray-800"
    } z-10`} // keep tab text on top
  >
    Active
  </TabsTrigger>

  <TabsTrigger
    value="past"
    className={`relative w-1/2 px-4 py-2 text-center font-medium select-none ${
      view === "past" ? "text-white" : "text-gray-800"
    } z-10`}
  >
    Past
  </TabsTrigger>
</TabsList>

          </Tabs>
        </div>

        <div className="flex justify-start p-10">
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((appointment) => (
              <AdminTicketCard
                key={appointment.appointment_id}
                appointment_id={appointment.appointment_id}
                item_desc={appointment.item_desc}
                date={appointment.date}
                points_earned={appointment.points_earned}
                item_img={appointment.item_img}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
