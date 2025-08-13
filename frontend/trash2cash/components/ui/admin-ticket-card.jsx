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
}) {
  const handleSendEmail = async () => {
    try {
      const response = await sendAppointmentEmail({
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
    <div className="flex gap-4">
      <Link href="#">
        <Card className="w-180">
          <CardHeader>
            <CardTitle>Ticket #{appointment_id}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Item: {item_desc}</p>
            <p>Date: {date}</p>
            <p>Points gained: {points_earned}</p>
          </CardContent>
        </Card>
      </Link>

      <div className="flex flex-col items-center justify-between">
        <img
          src="/icons/no_image.png"
          className="w-24 h-24 object-contain"
          alt="Item"
        />
        <Button
          className="mt-2 bg-blue-600 text-white"
          onClick={handleSendEmail}
        >
          Send Email
        </Button>
      </div>
    </div>
  );
}
