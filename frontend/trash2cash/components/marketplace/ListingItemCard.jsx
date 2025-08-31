"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ListingImageCarousel from './ListingImageCarousel';
import ListingInfoSection from './ListingInfoSection';
import ListingDialogActions from './ListingDialogActions';

export default function ListingItemCard({ listing, onMessageSellerClick }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [carouselApi, setCarouselApi] = useState(null);
  // Store the full listing detail only for messaging, not for dialog display
  const handleMessageSeller = async () => {
    console.log('MessageSellerDialog listing:', listing);
    if (listing.seller_username) {
      onMessageSellerClick(listing);
      return;
    }
    try {
      let endpoint = null;
      if (listing.category === 'electronics') {
        endpoint = `https://trash2cashpersonal.onrender.com/api/marketplace/electronics/${listing.id}/`;
      } else if (listing.category === 'clothes') {
        endpoint = `https://trash2cashpersonal.onrender.com/api/marketplace/clothes/${listing.id}/`;
      } else if (listing.category === 'books-magazines') {
        endpoint = `https://trash2cashpersonal.onrender.com/api/marketplace/books-magazines/${listing.id}/`;
      } else if (listing.category === 'furniture') {
        endpoint = `https://trash2cashpersonal.onrender.com/api/marketplace/furniture/${listing.id}/`;
      }
      if (!endpoint) {
        onMessageSellerClick(listing); // fallback
        return;
      }
      const res = await fetch(endpoint);
      const data = await res.json();
      onMessageSellerClick(data);
    } catch (err) {
      onMessageSellerClick(listing); // fallback
    }
  };

  const images = Array.isArray(listing.images) ? listing.images : [listing.image];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
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
        className="listing-card-container w-full cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <Card className="relative rounded-xl p-0 mb-8">
          <div className="relative w-full h-40 rounded-t-xl overflow-hidden flex items-center justify-center bg-muted">
            {/* Only show the first image in the card */}
            <img
              src={images[0] || '/logo.png'}
              alt={listing.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div className="text-xl truncate">{listing.title}</div>
            </div>
            <div className="font-bold text-lg text-primary mb-5">
              RM{listing.price}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[1080px]">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Carousel */}
            <div className="flex flex-col items-center sm:w-1/2 w-full">
              <ListingImageCarousel images={images} carouselApi={carouselApi} setCarouselApi={setCarouselApi} />
            </div>
            {/* Info + Buttons */}
            <div className="flex flex-col justify-between sm:w-1/2 w-full">
              <DialogHeader>
                <DialogTitle className="text-4xl font-bold mt-2 mb-2">
                  {listing.title}
                </DialogTitle>
                <DialogDescription>
                  <ListingInfoSection listing={listing} formatDate={formatDate} />
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <ListingDialogActions
                  listing={listing}
                  images={images}
                  onMessageSellerClick={onMessageSellerClick}
                  handleMessageSeller={handleMessageSeller}
                  setIsDialogOpen={setIsDialogOpen}
                />
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
