"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AppointmentConfirmationDialog({ open, onClose, appointmentDetails }) {
  const router = useRouter();
  const goToAppointments = () => {
    router.push("/appointment");
    onClose();
  };
  const goToUpload = () => {
    router.push("/upload");
    onClose();
  };
  // Intercept dialog close (X button or outside click) to always go to /upload
  const handleDialogChange = (isOpen) => {
    console.log("Dialog changed:", isOpen);
    if (!isOpen) {
      goToUpload();
    }
  };
  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Appointment Booked!</DialogTitle>
          <p className="sr-only">Your appointment has been successfully booked.</p>
        </DialogHeader>
        <div className="mb-4 text-center">
          <div><b>Date:</b> {appointmentDetails?.date}</div>
          <div><b>Time:</b> {appointmentDetails?.time}</div>
          <div><b>Centre:</b> {appointmentDetails?.centre_name || appointmentDetails?.centre || "N/A"}</div>
        </div>
        <DialogFooter>
          <Button onClick={goToAppointments} variant="default">
            View My Appointments
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" onClick={goToUpload}>
              Book Another Appointment
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
