"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

export default function ListingItem({ listing }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Ensure images is always an array
  const images = Array.isArray(listing.images) ? listing.images : [listing.image];
  const [carouselApi, setCarouselApi] = useState(null);

  // Format date to show only date and year
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
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
          {/* Image at the top of the card */}
          <div className="relative w-full h-40 rounded-t-xl overflow-hidden flex items-center justify-center bg-muted">
            <Image
              src={images[0] || '/logo.png'}
              alt={listing.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
          {/* Card content with padding */}
          <CardContent className="relative">
            <div className="flex items-center justify-between">
              <div className="text-xl truncate">{listing.title}</div>
            </div>
            <div className="font-bold text-lg text-primary">RM{listing.price}</div>
            <div className="text-muted-foreground mb-6">
              Seller: {listing.seller}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[1080px]">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Carousel and thumbnails (left) */}
            <div className="flex flex-col items-center sm:w-1/2 w-full">
              <div className="relative w-full">
                <Carousel setApi={setCarouselApi} className="w-full">
                  {/* Carousel navigation above images */}  
                  <CarouselPrevious className="ml-10"/>
                  <CarouselNext className="mr-10"/>
                  <CarouselContent className="w-full">
                    {images.map((img, idx) => (
                      <CarouselItem key={idx} className="w-full">
                        <div className="relative w-full h-128 rounded-xl">
                          <Image src={img || '/logo.png'} alt={`Image ${idx + 1}`} layout="fill" objectFit="cover" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
              {/* Thumbnails below carousel */}
              <div className="flex gap-2 mt-4 justify-center flex-wrap">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`w-12 h-12 rounded border ${carouselApi?.selectedScrollSnap() === idx ? 'border-primary' : 'border-muted'} overflow-hidden bg-muted focus:outline-none`}
                    onClick={() => carouselApi?.scrollTo(idx)}
                  >
                    <Image src={img || '/logo.png'} alt={`Preview ${idx + 1}`} width={48} height={48} />
                  </button>
                ))}
              </div>
            </div>
            {/* Description and message button (right) */}
            <div className="flex flex-col justify-between sm:w-1/2 w-full">
              <DialogHeader>
                <DialogTitle className="text-4xl font-bold mt-2 mb-2">{listing.title}</DialogTitle>
                <DialogDescription>
                  <span className="mb-2 font-bold text-2xl text-primary">RM{listing.price}</span>
                  <span className="block font-semibold text-lg text-primary mb-1">Description:</span>
                  {listing.description && (
                    <span className="block mb-2 text-muted-foreground text-base">{listing.description}</span>
                  )}
                  <span className="mb-2">Seller: {listing.seller}</span><br/>
                  <span className="mb-2">Date Posted: {formatDate(listing.date)}</span><br/>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6">
                <Button type="button" variant="default" className="w-full" onClick={() => {}}>
                  Message Seller
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
