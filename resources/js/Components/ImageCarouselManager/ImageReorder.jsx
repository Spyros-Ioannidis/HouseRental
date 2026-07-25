import { useState } from "react";
import DeleteConfirmationModal from "@/Components/ImageCarouselManager/DeleteConfirmationModal";
import ImageGrid from "@/Components/ImageCarouselManager/ImageGrid";
import ImageToolbar from "@/Components/ImageCarouselManager/ImageToolbar";
import { useDeleteConfirmation } from "@/Components/ImageCarouselManager/useDeleteConfirmation";
import { useImageDragReorder } from "@/Components/ImageCarouselManager/useImageDragReorder";
import { useImageSelection } from "@/Components/ImageCarouselManager/useImageSelection";
import { useUpload } from "@/Components/ImageCarouselManager/UploadProvider";

const ImageReorder = ({ photoCount = 0 }) => {
  const {
    uploads,
    cancelUpload,
    removeFile,
    removeFiles,
    retryUpload,
    reorderUploads,
    savingOrder,
    deletingIds,
  } = useUpload();

  const images = uploads;
  const deletingCount = deletingIds.size;
  const [showInfo, setShowInfo] = useState(true);
  const {
    anchorId,
    clearSelection,
    handleSelect,
    selectedDeletingCount,
    selectedIds,
    setAnchorId,
    setSelectedIds,
  } = useImageSelection(images, deletingIds);
  const {
    draggedItem,
    handleDragOver,
    handleDragStart,
    handleDrop,
    hoveredItem,
  } = useImageDragReorder({
    images,
    reorderUploads,
    selectedIds,
    setAnchorId,
    setSelectedIds,
  });
  const {
    confirmDelete,
    deleteConfirmation,
    requestDeleteAll,
    requestDeleteOne,
    requestDeleteSelected,
    setDeleteConfirmation,
  } = useDeleteConfirmation({
    anchorId,
    clearSelection,
    images,
    removeFile,
    removeFiles,
    selectedIds,
    setAnchorId,
  });

  const removeSelected = () => {
    if (selectedDeletingCount > 0) return;
    requestDeleteSelected();
  };

  const removeAll = () => {
    if (deletingCount > 0) return;
    requestDeleteAll();
  };

  return (
    <div className="relative p-6">
      <ImageToolbar
        deletingCount={deletingCount}
        imageCount={images.length}
        onRemoveAll={removeAll}
        onRemoveSelected={removeSelected}
        savingOrder={savingOrder}
        selectedCount={selectedIds.length}
        selectedDeletingCount={selectedDeletingCount}
        setShowInfo={setShowInfo}
        showInfo={showInfo}
      />

      <ImageGrid
        anchorId={anchorId}
        cancelUpload={cancelUpload}
        deletingIds={deletingIds}
        draggedItem={draggedItem}
        handleDragOver={handleDragOver}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
        handleSelect={handleSelect}
        hoveredItem={hoveredItem}
        images={images}
        onRequestDelete={requestDeleteOne}
        photoCount={photoCount}
        retryUpload={retryUpload}
        selectedIds={selectedIds}
        showInfo={showInfo}
      />

      <DeleteConfirmationModal
        confirmation={deleteConfirmation}
        onCancel={() => setDeleteConfirmation(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ImageReorder;
