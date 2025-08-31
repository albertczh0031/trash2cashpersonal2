"use client";

import React, { useState } from "react";
import Header from "@/components/ui/header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Appointment from "./Appointment";
import Seller from "./Seller";

export default function AppointmentView() {
  const [view, setView] = useState("active");

  return (
    <div className="flex flex-col gap-6">
      <main className="w-screen min-h-screen bg-gradient-to-b from-green-100 via-green-50 to-emerald-100">
        {/* Page Header */}
        <Header title="Admin Manager" />

        {/* Tabs Section */}
        <div className="flex justify-start w-full mt-6 px-10">
          <Tabs
            defaultValue="active"
            value={view}
            onValueChange={setView}
            className="relative w-[450px]"
          >
            <TabsList className="flex w-full bg-emerald-300/60 rounded-2xl p-2 shadow-md backdrop-blur-sm">
              {/* Active Tab */}
              <TabsTrigger
                value="active"
                className={`w-1/3 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  view === "active"
                    ? "bg-gradient-to-r from-green-500 to-emerald-400 text-green-900 shadow-md"
                    : "text-black hover:bg-green-600/40"
                }`}
              >
                Active
              </TabsTrigger>

              {/* Past Tab */}
              <TabsTrigger
                value="past"
                className={`w-1/3 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  view === "past"
                    ? "bg-gradient-to-r from-green-500 to-emerald-400 text-green-900 shadow-md"
                    : "text-black hover:bg-green-600/40"
                }`}
              >
                Past
              </TabsTrigger>

              {/* Sellers Tab */}
              <TabsTrigger
                value="sellers"
                className={`w-1/3 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  view === "sellers"
                    ? "bg-gradient-to-r from-green-500 to-emerald-400 text-green-900 shadow-md"
                    : "text-black hover:bg-green-600/40"
                }`}
              >
                Sellers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Section */}
        <div className="flex justify-start p-10">
          <div className="grid grid-cols-1 gap-6">
            {view === "active" && <Appointment type="active" />}
            {view === "past" && <Appointment type="past" />}
            {view === "sellers" && <Seller />}
          </div>
        </div>
      </main>
    </div>
  );
}
