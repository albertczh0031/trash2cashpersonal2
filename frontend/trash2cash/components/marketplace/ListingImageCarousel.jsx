import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { useState, useEffect } from 'react';

export default function ListingImageCarousel({ images, carouselApi, setCarouselApi }) {
  const [hoveredThumbnail, setHoveredThumbnail] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Listen for carousel slide changes
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    carouselApi.on('select', onSelect);
    // Set initial slide
    setCurrentSlide(carouselApi.selectedScrollSnap());

    return () => {
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi]);

  return (
    <>
      <div className="relative w-full">
        <Carousel setApi={setCarouselApi} className="w-full">
          {/* Custom styled navigation buttons with clear borders */}
          <CarouselPrevious 
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm border-2 border-gray-300 shadow-lg hover:bg-white hover:border-gray-400 transition-all duration-200" 
          />
          <CarouselNext 
            className="absolute right-6 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm border-2 border-gray-300 shadow-lg hover:bg-white hover:border-gray-400 transition-all duration-200" 
          />
          <CarouselContent className="w-full">
            {images.map((img, idx) => (
              <CarouselItem key={idx} className="w-full">
                {/* Responsive image container that adapts to aspect ratio */}
                <div className="relative w-full aspect-[4/3] min-h-[300px] max-h-[500px] rounded-xl overflow-hidden">
                  <Image
                    src={img || '/logo.png'}
                    alt={`Image ${idx + 1}`}
                    fill
                    className="object-contain bg-gray-50"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      
             {/* Improved thumbnails with greyed out state and hover effects */}
               <div className="flex gap-2 mt-4 justify-center flex-wrap">
          {images.map((img, idx) => {
            const isActive = currentSlide === idx;
            const isHovered = hoveredThumbnail === idx;
           
           return (
             <button
               key={idx}
               type="button"
               className={`
                 w-12 h-12 rounded-lg border-2 overflow-hidden transition-all duration-200
                 border-gray-300 hover:border-gray-400
                 ${isActive || isHovered 
                   ? 'opacity-100' 
                   : 'opacity-60 hover:opacity-80'
                 }
               `}
               onClick={() => carouselApi?.scrollTo(idx)}
               onMouseEnter={() => setHoveredThumbnail(idx)}
               onMouseLeave={() => setHoveredThumbnail(null)}
             >
               <div className="relative w-full h-full">
                 <Image
                   src={img || '/logo.png'}
                   alt={`Preview ${idx + 1}`}
                   fill
                   className={`
                     object-cover transition-all duration-200
                     ${isActive || isHovered 
                       ? 'filter-none' 
                       : 'filter grayscale brightness-75'
                     }
                   `}
                 />
               </div>
             </button>
           );
         })}
       </div>
    </>
  );
}
