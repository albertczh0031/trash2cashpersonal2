"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function IdentificationDialog({
  showMessageDialog,
  message,
  onClose,
  onConfirm,
  onManualSelect
}) {
  return (
    <Dialog
      open={showMessageDialog}
      onOpenChange={(open) => onClose(open)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle>
            {message}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-3 mt-4">
          <Button
            onClick={() => {
              onClose(false);
              onConfirm(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white w-full max-w-[300px]"
          >
            Yes. Find me an appointment...
          </Button>
          <Button
            onClick={() => {
              onClose(false);
              onManualSelect();
            }}
            variant="outline"
            className="text-gray-600 hover:bg-gray-100 w-full max-w-[300px]"
          >
            No. Select category manually...
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
