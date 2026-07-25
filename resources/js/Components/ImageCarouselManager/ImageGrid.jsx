
import ImageMetadataFallback from "./ImageMetadataFallback";
import ImageTile from "./ImageTile";
import { useTranslation } from "@/i18n";

const ImageGrid = ({
  anchorId,
  cancelUpload,
  deletingIds,
  draggedItem,
  handleDragOver,
  handleDragStart,
  handleDrop,
  handleSelect,
  hoveredItem,
  images,
  onRequestDelete,
  photoCount,
  retryUpload,
  selectedIds,
  showInfo,
}) => {
  const { t } = useTranslation();

  return (
        <div className="flex flex-wrap gap-3">
          {images.length > 0 ? (
            images.map((item, index) => (
            <ImageTile
              key={item.id}
              cancelUpload={cancelUpload}
              draggedItem={draggedItem}
              hoveredItem={hoveredItem}
              index={index}
              isAnchor={anchorId === item.id}
              isDeleting={deletingIds.has(item.id)}
              isSelected={selectedIds.includes(item.id)}
              item={item}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              onRequestDelete={onRequestDelete}
              onSelect={handleSelect}
              retryUpload={retryUpload}
              showInfo={showInfo}
            />
            ))
          ) : (
            <div className="w-full px-4 py-8 border border-dashed border-gray-300 rounded-lg text-center dark:border-gray-700">
              <p className="font-semibold text-gray-700 text-sm dark:text-gray-200">
                {t("empty.images_title")}
              </p>
              <p className="mt-1 text-gray-500 text-xs">
                {t("empty.images_body")}
              </p>
            </div>
          )}
        </div>
    //   </Deferred>
    // </Suspense>
  );
};

export default ImageGrid;
