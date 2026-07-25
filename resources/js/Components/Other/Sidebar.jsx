import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

const SIDEBAR_TRANSITION_MS = 200;

const sideClasses = {
  left: {
    panel: "left-0",
    hidden: "-translate-x-full",
  },
  right: {
    panel: "right-0",
    hidden: "translate-x-full",
  },
};

export default function Sidebar({
  open,
  onClose,
  side = "left",
  title,
  children,
  widthClassName = "max-w-sm w-full",
  ariaLabel,
  closeLabel = "Close sidebar",
}) {
  const titleId = useId();
  const resolvedSide = side === "right" ? "right" : "left";
  const [isRendered, setIsRendered] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (open) {
      setIsRendered(true);

      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    setIsVisible(false);

    const timeoutId = window.setTimeout(() => {
      setIsRendered(false);
    }, SIDEBAR_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!isRendered || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label={closeLabel}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        className={`absolute top-0 flex h-full flex-col bg-color-card text-color-primary shadow-2xl transition-transform duration-200 ease-out ${widthClassName} ${sideClasses[resolvedSide].panel} ${
          isVisible ? "translate-x-0" : sideClasses[resolvedSide].hidden
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-5 py-3 border-b border-color-card">
          {title ? (
            <h2 id={titleId} className="font-semibold text-lg">
              {title}
            </h2>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-gray-500 transition dark:hover:bg-gray-800 hover:bg-gray-100"
            aria-label={closeLabel}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
