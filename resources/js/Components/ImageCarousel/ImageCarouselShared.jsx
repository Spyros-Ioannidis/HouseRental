import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";

const storageUrl = (path) => {
  if (!path) return "";
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;

  return `/storage/${path}`;
};

export const normalizeImages = (value) => {
  if (!value) return [];

  const items = Array.isArray(value)
    ? value
    : (() => {
        try {
          return JSON.parse(value || "[]");
        } catch {
          return [];
        }
      })();

  return items
    .map((item) => {
      if (typeof item === "string") return storageUrl(item);

      return storageUrl(item.url ?? item.image ?? item.path);
    })
    .filter(Boolean);
};

export function useImageCarousel(imageItems) {
  const images = useMemo(() => normalizeImages(imageItems), [imageItems]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length > 0 && index >= images.length) {
      setIndex(0);
    }
  }, [images.length, index]);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  return {
    images,
    index,
    setIndex,
    next,
    prev,
  };
}

export function EmptyCarousel({ className = "" }) {
  return (
    <div
      className={`flex aspect-[5/3] w-full items-center justify-center border border-dashed border-gray-300 rounded-lg bg-gray-100 font-medium text-gray-500 text-sm ${className}`}
    >
      No images yet
    </div>
  );
}

export function CarouselViewport({
  images,
  index,
  onNext,
  onPrev,
  onImageClick,
  aspectClassName = "aspect-[5/3]",
  className = "",
  imageClassName = "object-cover",
  navButtonClassName = "bg-white/85 text-gray-900 shadow-lg hover:bg-white",
  slideClassName = "",
  showCounter = false,
}) {
  const hasNavigation = images.length > 1;
  const interactiveImage = Boolean(onImageClick);

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gray-100 ${aspectClassName} ${className}`}
    >
      <div
        className="flex h-full duration-500 ease-in-out transition-transform"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, imageIndex) => {
          const image = (
            <img
              src={src}
              alt={`House image ${imageIndex + 1}`}
              className={`h-full w-full ${imageClassName}`}
              draggable={false}
            />
          );

          if (!interactiveImage) {
            return (
              <div
                key={`${src}-${imageIndex}`}
                className={`h-full w-full shrink-0 ${slideClassName}`}
              >
                {image}
              </div>
            );
          }

          return (
            <button
              key={`${src}-${imageIndex}`}
              type="button"
              onClick={() => onImageClick(imageIndex)}
              className={`h-full w-full shrink-0 cursor-zoom-in ${slideClassName}`}
              aria-label={`Open house image ${imageIndex + 1} fullscreen`}
            >
              {image}
            </button>
          );
        })}
      </div>

      {showCounter && (
        <div className="absolute left-4 top-4 px-3 py-1 rounded-full bg-black/55 font-semibold text-white text-xs">
          {index + 1} / {images.length}
        </div>
      )}

      {hasNavigation && (
        <>
          <button
            type="button"
            onClick={onPrev}
            className={`absolute left-3 top-1/2 grid h-10 w-10 place-items-center rounded-full -translate-y-1/2 transition ${navButtonClassName}`}
            aria-label="Previous image"
          >
            <HiOutlineChevronLeft />
          </button>

          <button
            type="button"
            onClick={onNext}
            className={`absolute right-3 top-1/2 grid h-10 w-10 place-items-center rounded-full -translate-y-1/2 transition ${navButtonClassName}`}
            aria-label="Next image"
          >
            <HiOutlineChevronRight />
          </button>
        </>
      )}
    </div>
  );
}

export function ThumbnailStrip({
  images,
  index,
  onSelect,
  className = "",
  thumbClassName = "h-16 w-24",
}) {
  const thumbnailRefs = useRef([]);

  useEffect(() => {
    thumbnailRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [index]);

  if (images.length <= 1) {
    return null;
  }

  return (
    <div
      className={`flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {images.map((src, imageIndex) => (
        <button
          key={`${src}-${imageIndex}`}
          ref={(element) => {
            thumbnailRefs.current[imageIndex] = element;
          }}
          onClick={() => onSelect(imageIndex)}
          type="button"
          className={`shrink-0 overflow-hidden border-2 rounded-md transition ${thumbClassName} ${
            imageIndex === index
              ? "border-indigo-600"
              : "border-transparent opacity-70 hover:opacity-100"
          }`}
          aria-label={`Show house image ${imageIndex + 1}`}
        >
          <img src={src} className="h-full w-full object-cover" alt="" />
        </button>
      ))}
    </div>
  );
}
