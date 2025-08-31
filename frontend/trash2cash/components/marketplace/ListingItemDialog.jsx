import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ListingImageCarousel from './ListingImageCarousel';
import ListingInfoSection from './ListingInfoSection';
import ListingDialogActions from './ListingDialogActions';

export default function ListingItemDialog({
  isDialogOpen,
  setIsDialogOpen,
  listing,
  images,
  carouselApi,
  setCarouselApi,
  onMessageSellerClick,
  handleMessageSeller,
  formatDate
}) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-[1200px] w-[95vw] max-h-[90vh] overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Carousel - More flexible sizing */}
          <div className="flex flex-col items-center lg:w-3/5 w-full lg:min-h-[500px]">
            <ListingImageCarousel images={images} carouselApi={carouselApi} setCarouselApi={setCarouselApi} />
          </div>
          {/* Info + Buttons - Scrollable if needed */}
          <div className="flex flex-col justify-between lg:w-2/5 w-full lg:max-h-[600px] overflow-y-auto">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-2xl lg:text-4xl font-bold mt-2 mb-2">
                {listing.title}
              </DialogTitle>
              <DialogDescription>
                <ListingInfoSection listing={listing} formatDate={formatDate} />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex-shrink-0">
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
  );
}
