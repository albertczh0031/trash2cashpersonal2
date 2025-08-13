"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function VoucherItem({ voucher }) {
  const redeemVoucher = async () => {
    const res = await fetch(
      `https://trash2cashpersonal2.onrender.com/api/rewards/update-voucher-instance/${voucher.id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ redeemed: true }),
      },
    );

    if (res.ok) {
      window.location.reload();
    } else {
      alert("Failed to redeem voucher");
    }
  };

  const useVoucher = async () => {
    const res = await fetch(
      `https://trash2cashpersonal2.onrender.com/api/rewards/use-voucher-instance/${voucher.id}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (res.ok) {
      alert("Voucher used successfully!");
      window.location.reload();
    } else {
      alert("Failed to use voucher");
    }
  };

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
        <Card className="relative rounded-xl p-0">
          {/* Image at the top of the card */}
          <div className="relative w-full h-40 rounded-t-xl overflow-hidden">
            <Image
              src={voucher.voucher.image_url || '/voucher_images/no-image-available.jpg'}
              alt={voucher.voucher.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
          {/* Card content with padding */}
          <CardContent className="text-start">
            <div className="text-xl font-bold">{voucher.voucher.name}</div>
            <div className="text-muted-foreground">
              Points Required: {voucher.voucher.points}
            </div>
            <div className="text-muted-foreground mb-6">
              Recycling Center: {voucher.voucher.recycle_center_code}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{voucher.voucher.name}</DialogTitle>
            <DialogDescription>
              <br>{voucher.voucher.description}</br>
              <br>Recycling Center: {voucher.voucher.recycle_center_code}</br>
              <br>Points Required: {voucher.voucher.points}</br>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {!voucher.redeemed ? (
              <Button type="button" onClick={redeemVoucher}>
                Redeem Voucher
              </Button>
            ) : (
              <Button type="button" onClick={useVoucher}>
                Use Voucher
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};