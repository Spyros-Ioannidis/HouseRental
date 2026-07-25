import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-3xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  ariaLabel,
  closeLabel = "Close modal",
  closeOnBackdrop = true,
  showCloseButton = true,
  panelClassName = "",
  contentClassName = "",
}) {
  const titleId = useId();

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

  if (!open || typeof document === "undefined") {
    return null;
  }

  const handleBackdropMouseDown = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/40"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        className={`max-h-[calc(100vh-3rem)] w-full overflow-y-auto p-5 rounded-lg bg-color-card shadow-2xl ${sizeClasses[size] ?? sizeClasses.md} ${panelClassName}`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4">
            {title ? (
              <h2
                id={titleId}
                className="font-semibold text-gray-950 text-lg dark:text-gray-100"
              >
                {title}
              </h2>
            ) : (
              <span />
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-gray-500 transition dark:hover:bg-gray-800 hover:bg-gray-100"
                aria-label={closeLabel}
              >
                <FiX aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className={contentClassName}>{children}</div>

        {footer ? <div className="mt-5">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
