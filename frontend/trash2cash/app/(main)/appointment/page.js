"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';

export default function AppointmentView() {
  const [activeTab, setActiveTab] = useState("active");
  const [appointments, setAppointments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ name: "User", tier: "Silver" });

  const fetchUserProfile = async () => {
    const userToken = localStorage.getItem("access");
    if (!userToken) return;

    const response = await fetch("http://127.0.0.1:8000/api/user-profile/", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setUserProfile({
        name: data.username || "User",
        tier: data.tier || "Silver",
      });
    }
  };

  const fetchAppointments = async () => {
    const userToken = localStorage.getItem("access");
    if (!userToken) return;

    const response = await fetch(
      "http://127.0.0.1:8000/api/my-appointments/?status=Booked",
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setAppointments(data);
    }
  };

  const fetchExpiredVouchers = async () => {
    const userToken = localStorage.getItem("access");
    if (!userToken) return;

    const response = await fetch("http://127.0.0.1:8000/api/rewards/api/rewards/expired-vouchers/", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const formattedExpiredVouchers = data.map((voucher) => ({
        id: voucher.id,
        name: `Expired Voucher [${voucher.voucher.name}]`,
        points_earned: voucher.voucher.points,
        date: voucher.date,
        type: "expired-voucher",
      }));
      setTransactions((prev) => [...prev, ...formattedExpiredVouchers]); // Append to existing transactions
    }
  };

  const fetchTickets = async () => {
    const userToken = localStorage.getItem("access");
    if (!userToken) return;

    const response = await fetch(
      "http://127.0.0.1:8000/api/my-appointments/?status=Completed",
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      setTransactions(data);
    }
  };

  const fetchVoucherInstance = async () => {
    const userToken = localStorage.getItem("access");
    if (!userToken) return;

    const response = await fetch(
      "http://127.0.0.1:8000/api/rewards/api/rewards/redeemed-voucher-instances/",
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const formattedVouchers = data.map((voucher) => ({
        id: voucher.id,
        name: `Voucher [${voucher.voucher.name}] Redeem`,
        points_earned: voucher.voucher.points,
        date: voucher.date,
        type: "voucher",
      }));
      setTransactions((prev) => [...prev, ...formattedVouchers]);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchUserProfile();

        if (activeTab === "active") {
          await fetchAppointments();
        } else {
          await fetchTickets();
          await fetchVoucherInstance();
          await fetchExpiredVouchers();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <Card className="bg-gradient-to-bl from-green-100 to-green-200  shadow-md w-full rounded-none">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold">Welcome {userProfile.name}</h1>
          <p className="text-xl">Current Tier: {userProfile.tier}</p>
        </CardContent>
      </Card>

      <div className="flex justify-center my-4 gap-4">
        <Tabs
          defaultValue="active"
          value={activeTab}
          onValueChange={handleTabChange}
          className="relative w-[300px]"
        >
          <TabsList className="relative flex w-full border border-gray-300 bg-white text-gray-800 overflow-hidden rounded-sm p-0">
            <div
              className="absolute top-0 left-0 h-full w-1/2 bg-green-700 rounded-sm transition-transform duration-300 ease-in-out flex items-center justify-center"
              style={{
                transform: activeTab === "active" ? "translateX(0%)" : "translateX(100%)",
                zIndex: 30,
              }}
            >
              <span className="text-primary-foreground font-semibold select-none pointer-events-none">
                {activeTab === "active" ? " Active" : "Past"}
              </span>
            </div>

            <TabsTrigger
              value="active"
              className="relative w-1/2 px-4 py-2 text-center font-medium select-none z-10 bg-green-200 text-green-900 hover:bg-green-300"
            >
              Active
            </TabsTrigger>

            <TabsTrigger
              value="past"
              className="relative w-1/2 px-4 py-2 text-center font-medium select-none z-10 bg-green-200 text-green-900 hover:bg-green-300"
            >
              Past
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "active" ? (
        <div className="flex justify-center p-10">
          {loading ? (
            <p>Loading appointments...</p>
          ) : (
            <table className="table-auto border-collapse border border-input w-full">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="border border-input px-4 py-2">Appointment</th>
                  <th className="border border-input px-4 py-2">Ecopoints</th>
                  <th className="border border-input px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr
                    key={appointment.appointment_id}
                    className="text-center bg-secondary/30 text-foreground"
                  >
                    <td className="border border-input px-4 py-2">
                      {appointment.appointment_id}
                    </td>
                    <td className="border border-input px-4 py-2">
                      {appointment.points_earned}
                    </td>
                    <td className="border border-input px-4 py-2">
                      {new Date(appointment.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="flex justify-center p-10">
          {loading ? (
            <p>Loading transactions...</p>
          ) : (
            <table className="table-auto border-collapse border border-input w-full">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="border border-input px-4 py-2">Transaction</th>
                  <th className="border border-input px-4 py-2">Ecopoints</th>
                  <th className="border border-input px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item, index) => (
                  <tr
                    key={`${item.id}-${item.type}-${index}`} // Ensure unique key
                    className="text-center bg-secondary/30 text-foreground"
                  >
                    <td className="border border-input px-4 py-2">
                      {item.type === "voucher"
                        ? item.name
                        : item.type === "expired-voucher"
                        ? item.name
                        : `Ticket: ${item.centre_name}`} {/* Show "Ticket: ..." or "Expired Voucher [id]" */}
                    </td>
                    <td className="border border-input px-4 py-2">
                      {item.type === "voucher" || item.type === "expired-voucher"
                        ? `-${item.points_earned}`
                        : `+${item.points_earned}`} {/* Adjust points display */}
                    </td>
                    <td className="border border-input px-4 py-2">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}