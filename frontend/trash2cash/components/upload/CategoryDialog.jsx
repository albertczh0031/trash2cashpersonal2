"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const images = {
  plastic: "/icons/plastic.png",
  paper: "/icons/paper.png",
  cardboard: "/icons/cardboard.png",
  glass: "/icons/glass.png",
  metal: "/icons/metal.png",
  clothes: "/icons/clothes.jpg",
  'e-waste': "/icons/electronic.png",
  'a bulb / tube': "/icons/bulb_tube.jpeg"
};

export function CategoryDialog({
  showCategoryDialog,
  categories,
  onClose,
  onCategorySelect
}) {
  return (
    <Dialog 
      open={showCategoryDialog} 
      onOpenChange={(open) => onClose(open)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle>
            Item was not identified correctly. What type of item are you recycling?
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-1">
          {[...new Set(categories)].map((cat) => {
            return (
            <div key={cat} className="flex flex-col items-center">
              {/* Image */}
              <img
                src = {images[cat]} className="w-21 h-15"
              />
              {/* Button */}
              <Button onClick={() => onCategorySelect(cat)}
              className="bg-green-600 hover:bg-green-700 text-white p-4 w-21 h-5 rounded-none">
                {cat}
              </Button>
            </div>

            // <Button
            //   key={cat}
            //   onClick={() => onCategorySelect(cat)}
            //   className="bg-green-600 hover:bg-green-700 text-white p-4"
            // >
            //   {cat}
            // </Button>
            )
          })}
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Appointment will be manually verified. You will get a confirmation
          email after verification.
        </p>
      </DialogContent>
    </Dialog>
  );
}
