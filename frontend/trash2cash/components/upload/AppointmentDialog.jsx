"use client";
import {
  NotebookTabs,
  Package
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AppointmentDialog({
  showPopup,
  onClose,
  onSelection
}) {
  return (
    <Dialog 
      open={showPopup} 
      onOpenChange={(open) => onClose(open)}
    >
      <DialogContent className="sm:max-w-md items-center justify-center">
        <DialogHeader className="text-center">
          <DialogTitle>
            For this appointment, would you like to..
          </DialogTitle>
        </DialogHeader>
        <div className="flex space-x-5 items-center justify-center">
          <Button
            onClick={() => onSelection("Pickup")}
            className="bg-green-600"
          >
            <NotebookTabs/>
            Schedule Pickup
          </Button>
          
          <Button
            onClick={() => onSelection("Dropoff")}
            className="bg-green-600"
          >
            <Package />
            Dropoff Manually
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
