import { HiMiniXMark } from "react-icons/hi2";
import { IoMdDoneAll } from "react-icons/io";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
// import { formatBytes } from "./formatBytes";

const ImageTile = ({
  cancelUpload,
  draggedItem,
  hoveredItem,
  index,
  isAnchor,
  isDeleting,
  isSelected,
  item,
  onDragOver,
  onDragStart,
  onDrop,
  onRequestDelete,
  onSelect,
  retryUpload,
  showInfo,
}) => {
  const { t } = useTranslation();
  const percent = item.progress || 0;
  const loadedBytes = item.loadedBytes || 0;
  const totalBytes = item.totalBytes || item.size || 0;

  const formatBytes = (bytes = 0) => {
    if (!bytes) return "0 B";

    const units = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    const value = bytes / 1024 ** unitIndex;

    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  return (
    <motion.div
      key={item.id}
      layout
      // initial={{ scale: 0.95, opacity: 0 }}
      // animate={{ scale: 1, opacity: 1 }}
      // exit={{ scale: 0.95, opacity: 0 }}
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: -10 }}
      // transition={{ duration: 0.3 }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 500,
          damping: 35,
        },
        opacity: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.97,
      }}
      draggable={item.status === "done" && !isDeleting}
      onDragStart={() => onDragStart(item, index)}
      onDragOver={(e) => onDragOver(e, item)}
      onDrop={() => onDrop(index)}
      onClick={(e) => {
        if (isDeleting) return;
        onSelect(e, index);
      }}
      className={`relative h-21 w-35 overflow-visible border-2 rounded ${
        isDeleting ? "cursor-wait" : "cursor-pointer"
      } ${hoveredItem?.id === item.id ? "border-blue-500 border-dashed" : ""}`}
    >
      <img
        src={item.url || item.preview}
        alt=""
        decoding="async"
        className={`h-full w-full object-cover ${
          draggedItem?.id === item.id ? "opacity-30" : ""
        } ${item.status !== "done" || isDeleting ? "blur-sm scale-105" : ""}`}
      />

      <div
        className={`absolute inset-0 flex flex-col items-center justify-center p-1 text-[10px] text-center text-white ${showInfo || item.status !== "done" || isDeleting ? "bg-black/40" : ""}`}
      >
        {isDeleting ? (
          <>
            <div className="mb-1 h-3 w-3 border-2 border-t-transparent border-white rounded-4xl animate-spin"></div>
            <p>{t("uploads.deleting")}</p>
          </>
        ) : item.status !== "done" ? (
          <>
            <div className="mb-1 h-3 w-3 border-2 border-t-transparent border-white rounded-4xl animate-spin"></div>
            <p>
              {formatBytes(loadedBytes)} / {formatBytes(totalBytes)}
            </p>
            <p>{percent}%</p>

            {item.status === "uploading" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cancelUpload(item.id);
                }}
                className="mt-1 px-2 py-0.5 rounded bg-red-500 text-xs"
              >
                {t("uploads.cancel")}
              </button>
            )}

            {item.status === "error" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  retryUpload(item.id);
                }}
                className="mt-1 px-2 py-0.5 rounded bg-yellow-500 text-xs"
              >
                {t("uploads.retry")}
              </button>
            )}
          </>
        ) : (
          showInfo && (
            <>
              <IoMdDoneAll className="mb-1 text-green-400 text-lg" />
              <p className="w-full truncate">{item.name || item.file?.name}</p>
              <p>{formatBytes(item.size)}</p>
            </>
          )
        )}
      </div>

      <div className="absolute right-0 top-0 z-20 -translate-y-1/2 translate-x-1/2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isDeleting) return;
            onRequestDelete(item.id);
          }}
          disabled={isDeleting}
          className={`rounded-full bg-red-500 text-white hover:bg-red-700 ${
            isDeleting ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          }`}
        >
          <HiMiniXMark size={18} />
        </button>
      </div>

      {isSelected && (
        <div className="pointer-events-none absolute inset-0 border-2 border-blue-500 rounded" />
      )}

      {isAnchor && (
        <div className="pointer-events-none absolute inset-1 rounded bg-red-500/40" />
      )}
    </motion.div>
  );
};

export default ImageTile;
