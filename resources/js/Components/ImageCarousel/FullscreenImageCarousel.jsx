import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

import {
  CarouselViewport,
  ThumbnailStrip,
} from "@/Components/ImageCarousel/ImageCarouselShared";

export default function FullscreenImageCarousel({
  images,
  index,
  isOpen,
  onClose,
  onNext,
  onPrev,
  onSelect,
}) {
  const active = isOpen && images.length > 0;

  useEffect(() => {
    if (!active) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowRight") {
        onNext();
      }

      if (event.key === "ArrowLeft") {
        onPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, onClose, onNext, onPrev]);

  if (!active || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-label="Fullscreen house image carousel"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/95 text-white"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
        aria-label="Close fullscreen carousel"
      >
        <FaTimes aria-hidden="true" />
      </button>

      <div className="flex h-full px-4 py-16 sm:px-6">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <CarouselViewport
            images={images}
            index={index}
            onNext={onNext}
            onPrev={onPrev}
            aspectClassName="aspect-auto"
            className="h-full max-h-full w-full rounded-none bg-black"
            imageClassName="object-contain"
            navButtonClassName="bg-white/15 text-white hover:bg-white/25"
            slideClassName="bg-black"
            showCounter
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-3 border-t border-white/10 bg-black/80 backdrop-blur">
        <ThumbnailStrip
          images={images}
          index={index}
          onSelect={onSelect}
          className="w-full"
          thumbClassName="h-16 w-24 sm:h-20 sm:w-32"
        />
      </div>
    </div>,
    document.body,
  );
}
