'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export default function VoucherItem({ voucher }) {
  const redeemVoucher = async () => {
    const res = await fetch(`http://trash2cashpersonal.onrender.com/api/rewards/update-voucher-instance/${voucher.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ redeemed: true }),
    });

    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const useVoucher = async () => {
    const res = await fetch(`http://trash2cashpersonal.onrender.com/api/rewards/use-voucher-instance/${voucher.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      alert('Voucher used successfully!');
      window.location.reload();
    } else {
      alert('Failed to use voucher');
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const TIER_IMAGES = {
  1: '/voucher_images/bronze-small.png',
  2: '/voucher_images/silver-small.png',
  3: '/voucher_images/gold-small.png',
  4: '/voucher_images/platinum-small.png',
};

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.025 }}
        whileTap={{ scale: 0.95 }}
        className="voucher-card-container w-110"
        onClick={() => setIsDialogOpen(true)}
      >
        <Card className="relative rounded-xl p-0 mb-8">
          <div className="relative w-full h-40 rounded-t-xl overflow-hidden">
            {/* Exclamation mark at top right of the card if expiring soon */}
            {(() => {
              const expiry = new Date(voucher.voucher.expiration_date);
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);

              const isExpiringTomorrow =
                expiry.getFullYear() === tomorrow.getFullYear() &&
                expiry.getMonth() === tomorrow.getMonth() &&
                expiry.getDate() === tomorrow.getDate();

              return isExpiringTomorrow ? (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                  !
                </div>
              ) : null;
            })()}
            {/* Image at the top of the card */}
            <Image
              src={voucher.voucher.image
      ? `http://trash2cashpersonal.onrender.com/${voucher.voucher.image}`
      : '/voucher_images/no-image-available.jpg'} 
              alt={voucher.voucher.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
          {/* Card content with padding */}
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold truncate">{voucher.voucher.name}</div>
              <div className="">
                <img
                  src={TIER_IMAGES[voucher.voucher.required_tier]}
                  alt="Tier Badge"
                  className="w-8 h-8 object-contain"
                />
              </div>
            </div>
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
              {voucher.voucher.description} <br />
              Recycling Center: {voucher.voucher.recycle_center_code} <br />
              Points Required: {voucher.voucher.points} <br />
              Expires on: {voucher.voucher.expiration_date} <br />
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