import { useCallback, useState } from "react";

import FullscreenImageCarousel from "@/Components/ImageCarousel/FullscreenImageCarousel";
import {
  CarouselViewport,
  EmptyCarousel,
  ThumbnailStrip,
  useImageCarousel,
} from "@/Components/ImageCarousel/ImageCarouselShared";

export default function ImageCarousel({
  images: imageItems,
  props,
  className = "",
}) {
  const { images, index, setIndex, next, prev } = useImageCarousel(
    imageItems ?? props,
  );
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const openFullscreen = useCallback(
    (selectedIndex) => {
      setIndex(selectedIndex);
      setFullscreenOpen(true);
    },
    [setIndex],
  );

  const closeFullscreen = useCallback(() => {
    setFullscreenOpen(false);
  }, []);

  if (images.length === 0) {
    return <EmptyCarousel className={className} />;
  }

  return (
    <div className={`w-full ${className}`}>
      <CarouselViewport
        images={images}
        index={index}
        onNext={next}
        onPrev={prev}
        onImageClick={openFullscreen}
      />

      <ThumbnailStrip
        images={images}
        index={index}
        onSelect={setIndex}
        className="mt-3"
      />

      <FullscreenImageCarousel
        images={images}
        index={index}
        isOpen={fullscreenOpen}
        onClose={closeFullscreen}
        onNext={next}
        onPrev={prev}
        onSelect={setIndex}
      />
    </div>
  );
}
