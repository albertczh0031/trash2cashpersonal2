"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sendAppointmentEmail } from "@/lib/sendAppointmentEmail";

export default function AdminTicketCard({
  appointment_id,
  item_desc,
  date,
  points_earned,
  item_img,
  status,
}) {
  const handleSendEmail = async () => {
    try {
      await sendAppointmentEmail({
        name: "test",
        email: "test@example.com",
        date: date.split(" ")[0],
        arrival_time: date.split(" ")[1],
        street: "123 Sample Street",
        city: "Petaling Jaya",
        postcode: "46000",
        centre_name: "Green Recycling Centre",
        pickup: false,
      });
      alert("Email sent!");
    } catch (err) {
      alert("Failed to send email.");
      console.error(err);
    }
  };

  return (
    <div className="flex gap-6 items-start bg-gradient-to-r from-green-50 to-green-100 
                    border border-green-200 p-5 rounded-2xl shadow-md hover:shadow-lg transition">
      {/* Ticket Card */}
      <Link href="#">
        <Card className="bg-gradient-to-b from-green-100 to-green-50 border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-green-900 font-semibold">
              Ticket #{appointment_id}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-green-800 space-y-1">
            <p><span className="font-medium">Item:</span> {item_desc}</p>
            <p><span className="font-medium">Date:</span> {date}</p>
            <p><span className="font-medium">Status:</span> {status}</p>
            <p>
              <span className="font-medium">Points:</span>{" "}
              {points_earned !== null ? points_earned : "Not completed yet!"}
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Side Column */}
      <div className="flex flex-col items-center justify-between">
        <img
          src={item_img || "/icons/no_image.png"}
          className="w-24 h-24 object-contain rounded-lg border border-green-200 bg-white"
          alt="Item"
        />
        <Button
          className="mt-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md"
          onClick={handleSendEmail}
        >
          Send Email
        </Button>
      </div>
    </div>
  );
}
