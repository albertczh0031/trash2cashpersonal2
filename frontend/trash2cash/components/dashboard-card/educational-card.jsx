'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EducationalCard({
  label,
  icon,
  description, // optional if you still want a fallback
  yesItems,
  noItems,
  subsectionTitle,
  subsectionNote,
  commonItems,
}) {

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.025 }}
        whileTap={{ scale: 0.95 }}
        className="voucher-card-container w-96"
        onClick={() => setIsDialogOpen(true)}
      >
        <Card className="relative rounded-xl p-0 cursor-pointer hover:bg-[#c6e8d1] transition-colors duration-300">
          {/* Image at top like voucher */}
          <div className="relative w-full h-44 rounded-t-xl overflow-hidden">
            <Image
              src={icon || '/default-icon.png'}
              alt={label}
              fill
              className="object-cover"
            />
          </div>
          {/* Card content */}
          <CardContent className="text-start flex flex-col justify-start gap-1 p-4">
            <div className="text-xl font-semibold tracking-tight text-zinc-800">
              {label}
            </div>
            <div className="text-muted-foreground text-base">
              Tap to learn more about {label.toLowerCase()}.
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-6 text-sm text-zinc-700 leading-relaxed pt-2">
                  
                  {yesItems && (
                    <div>
                      <h2 className="text-green-700 font-semibold text-x1 mb-1 uppercase tracking-wide">Yes</h2>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        {yesItems.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {noItems && (
                    <div>
                      <h2 className="text-red-600 font-semibold text-base mb-1 uppercase tracking-wide">No</h2>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        {noItems.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}

                  {subsectionTitle && (
                    <div>
                      <h2 className="text-zinc-800 font-medium uppercase tracking-wide">{subsectionTitle}</h2>
                      {subsectionNote && (
                        <p className="text-zinc-500 italic text-sm mt-1">{subsectionNote}</p>
                      )}
                    </div>
                  )}

                  {commonItems && (
                    <div>
                      <h3 className="font-semibold text-zinc-800 uppercase tracking-wide mb-1">Common Items</h3>
                      <ul className="space-y-1 pl-2">
                        {commonItems.map((item, i) => (
                          <li key={i} className="text-zinc-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </DialogDescription>

          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
