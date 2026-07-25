import { useState, useRef } from "react";
import { TbUpload } from "react-icons/tb";
import { useUpload } from "@/Components/ImageCarouselManager/UploadProvider";
import { useTranslation } from "@/i18n";

const ImageUploadBox = ({ id = "image-input" }) => {
  const { t } = useTranslation();
  const {
    addFiles,
    maxUploads,
    remainingUploads,
    uploadCount,
    uploadLimitError,
  } = useUpload();
  const [dragover, setDragover] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const inputRef = useRef(null);
  const uploadLimitReached = remainingUploads <= 0;

  const openFileDialog = () => {
    if (uploadLimitReached) return;
    inputRef.current?.click();
  };

  const onDragEnter = (e) => {
    e.preventDefault();
    if (uploadLimitReached) return;
    setDragCount((count) => count + 1);
    setDragover(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragCount((count) => {
      const next = count - 1;
      if (next === 0) setDragover(false);
      return next;
    });
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (e) => {
    e.preventDefault();
    setDragover(false);
    setDragCount(0);
    if (uploadLimitReached) return;
    addFiles(e.dataTransfer.files);
  };

  return (
    <>
      <div
        className={`h-80 w-130 p-4 border-2 border-dashed rounded-md select-none transition bg-color-card dark:hover:bg-gray-800
          ${uploadLimitReached ? "cursor-not-allowed bg-gray-100 border-gray-300 opacity-70 dark:bg-gray-800 dark:border-gray-700" : "cursor-pointer"}
          ${dragover ? "bg-gray-200 border-blue-400" : "bg-gray-50 hover:bg-gray-200 border-gray-400 dark:bg-gray-800 dark:border-gray-700"}`}
        onClick={openFileDialog}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className="flex h-full w-full flex-col items-center justify-center">
          <TbUpload size={40} className="block text-gray-500" />
          <span className="font-medium text-gray-500 transition hover:text-gray-700">
            {uploadLimitReached ? (
              t("uploads.limit_reached")
            ) : (
              <>
                {t("uploads.drop_browse")}
                <span className="font-semibold text-blue-500"> {t("uploads.browse")}</span>
              </>
            )}
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        id={id}
        multiple
        accept="image/*"
        disabled={uploadLimitReached}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      <div className="mb-2 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-600">
          {t("uploads.count", { count: uploadCount, max: maxUploads })}
        </span>
        {uploadLimitError && (
          <span className="text-red-500">{uploadLimitError}</span>
        )}
      </div>

    </>
  );
};

export default ImageUploadBox;
