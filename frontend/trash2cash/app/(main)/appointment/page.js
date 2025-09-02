"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function AppointmentView() {
  const [activeTab, setActiveTab] = useState("active");
  const [appointments, setAppointments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({ name: "User", tier: "Silver" });

  const fetchUserProfile = async () => {
    const userToken = localStorage.getItem("access");
    if (!userToken) return;

    const response = await fetch("https://trash2cashpersonal.onrender.com/api/user-profile/", {
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
      "https://trash2cashpersonal.onrender.com/api/my-appointments/?status=Booked",
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

  // helper to refresh access token
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch('https://trash2cashpersonal.onrender.com/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.access;
    } catch (e) {
      return null;
    }
  };

  // Format date and time into display parts: short date (e.g. "4 Sep 2025") and time "HH:MM"
  const formatDateTimeParts = (dateStr, timeStrRaw) => {
    try {
      const timePart = timeStrRaw || '00:00:00';
      const dt = new Date(`${dateStr}T${timePart}`);
      const datePart = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(dt);
      // force 24-hour format so we get e.g. "16:00"
      const timePartFormatted = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      return { datePart, timePartFormatted };
    } catch (e) {
      return { datePart: new Date(dateStr).toLocaleDateString(), timePartFormatted: '' };
    }
  };

  const [cancelingAppointment, setCancelingAppointment] = useState(null); // appointment id being cancelled
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openCancelConfirm = (appointment) => {
    setCancelingAppointment(appointment);
    setConfirmOpen(true);
  };

  const cancelAppointment = async () => {
    if (!cancelingAppointment) return;
    const appointmentId = cancelingAppointment.appointment_id;
    const userToken = localStorage.getItem('access');
    const refreshToken = localStorage.getItem('refresh');
    if (!userToken || !refreshToken) {
      alert('You must be logged in to cancel an appointment.');
      return;
    }

    setLoading(true);
    try {
      let response = await fetch('https://trash2cashpersonal.onrender.com/api/appointments/cancel/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ appointment_id: appointmentId }),
      });

      if (response.status === 401) {
        const newAccess = await refreshAccessToken(refreshToken);
        if (newAccess) {
          localStorage.setItem('access', newAccess);
          response = await fetch('https://trash2cashpersonal.onrender.com/api/appointments/cancel/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newAccess}`,
            },
            body: JSON.stringify({ appointment_id: appointmentId }),
          });
        } else {
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to cancel appointment');
      }

      // Success: remove from list
      setAppointments((prev) => prev.filter((a) => a.appointment_id !== appointmentId));
      // Optionally refresh notifications or show toast
      setConfirmOpen(false);
      setCancelingAppointment(null);
    } catch (e) {
      console.error('Cancel failed', e);
      alert(e.message || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiredVouchers = async () => {
    const userToken = localStorage.getItem("access");
    if (!userToken) return;

    const response = await fetch("https://trash2cashpersonal.onrender.com/api/rewards/api/rewards/expired-vouchers/", {
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
      "https://trash2cashpersonal.onrender.com/api/my-appointments/?status=Completed",
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
      "https://trash2cashpersonal.onrender.com/api/rewards/api/rewards/redeemed-voucher-instances/",
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
    <>
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200">
      {/* Header */}
      <Card className="bg-gradient-to-bl from-green-100 to-green-200  shadow-md w-full rounded-none">
        <CardContent className="p-6">
          <h1 className="text-4xl font-bold">Welcome {userProfile.name}</h1>
          <p className="text-xl">Current Tier: {userProfile.tier}</p>
        </CardContent>
      </Card>

      <div className="flex justify-center my-4 gap-4">
        <Tabs
          defaultValue="Appointments"
          value={activeTab}
          onValueChange={handleTabChange}
          className="relative w-[300px]"
        >
          <TabsList className="relative flex w-full border border-gray-300 bg-white text-gray-800 overflow-hidden rounded-sm p-0">
            <div
              className="absolute top-0 left-0 h-full w-1/2 bg-green-600 rounded-sm transition-transform duration-300 ease-in-out flex items-center justify-center"
              style={{
                transform: activeTab === "active" ? "translateX(0%)" : "translateX(100%)",
                zIndex: 30,
              }}
            >
              <span className="text-primary-foreground font-semibold select-none pointer-events-none">
                {activeTab === "active" ? " Appointments" : "Transactions"}
              </span>
            </div>

            <TabsTrigger
              value="active"
              className="relative w-1/2 px-4 py-2 text-center font-medium select-none z-10 bg-green-200 text-green-900 hover:bg-green-300"
            >
              Appointments
            </TabsTrigger>

            <TabsTrigger
              value="past"
              className="relative w-1/2 px-4 py-2 text-center font-medium select-none z-10 bg-green-200 text-green-900 hover:bg-green-300"
            >
              Transactions
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
                <tr className="bg-green-300 text-green-950">
                  <th className="border border-input px-4 py-2">Appointment</th>
                  <th className="border border-input px-4 py-2">Location</th>
                  <th className="border border-input px-4 py-2">Date · Time</th>
                  <th className="border border-input px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr className="text-center bg-secondary/10 text-gray-600">
                    <td className="border border-input px-4 py-6" colSpan={4}>
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-lg font-medium">You have no upcoming appointments.</p>
                        <p className="text-sm text-gray-500">When you book an appointment it will appear here.</p>
                        <div className="pt-2">
                          <Button size="sm" onClick={() => window.location.href = '/upload'}>
                            Book an appointment
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr
                      key={appointment.appointment_id}
                      className="text-center bg-secondary/30 text-foreground"
                    >
                      <td className="border border-input px-4 py-2 text-sm text-gray-700">
                        {appointment.appointment_id}
                      </td>
                      <td className="border border-input px-4 py-2 text-sm text-gray-700">
                        {appointment.centre_name}
                      </td>
                      <td className="border border-input px-4 py-2 text-sm text-gray-700">
                        {(() => {
                          const { datePart, timePartFormatted } = formatDateTimeParts(appointment.date, appointment.time);
                          return (
                            <div className="text-sm text-gray-700">
                              <span>{datePart} <span className="text-gray-400">·</span> <span className="font-medium">{timePartFormatted}</span></span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="border border-input px-4 py-2">
                        {appointment.status === 'Booked' ? (
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => openCancelConfirm(appointment)}
                              aria-label={`Cancel appointment ${appointment.appointment_id}`}
                              title="Cancel appointment"
                              className={`w-8 h-8 rounded-full text-red-600 hover:bg-red-50 flex items-center justify-center focus:outline-none ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">{appointment.status}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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
                <tr className="bg-green-300 text-green-950">
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
                    <td className="border border-input px-4 py-2 text-sm text-gray-700">
                      {item.type === "voucher"
                        ? item.name
                        : item.type === "expired-voucher"
                        ? item.name
                        : `Ticket: ${item.centre_name}`} {/* Show "Ticket: ..." or "Expired Voucher [id]" */}
                    </td>
                    <td className="border border-input px-4 py-2 text-sm text-gray-700">
                      {item.type === "voucher" || item.type === "expired-voucher"
                        ? `-${item.points_earned}`
                        : `+${item.points_earned}`} {/* Adjust points display */}
                    </td>
                    <td className="border border-input px-4 py-2 text-sm text-gray-700">
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel appointment?</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            Are you sure you want to cancel appointment {cancelingAppointment?.appointment_id} on {cancelingAppointment ? (() => {
              const { datePart, timePartFormatted } = formatDateTimeParts(cancelingAppointment.date, cancelingAppointment.time);
              return (
                <span>
                  {datePart} <span className="text-gray-400">·</span> <strong>{timePartFormatted}</strong>
                </span>
              );
            })() : ''}?
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Close</Button>
            <Button variant="destructive" onClick={cancelAppointment}>Confirm Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}