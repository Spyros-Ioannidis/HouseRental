import { useState } from "react";

export const useImageDragReorder = ({
  images,
  reorderUploads,
  selectedIds,
  setAnchorId,
  setSelectedIds,
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const resetDragState = () => {
    setDraggedItem(null);
    setHoveredItem(null);
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    setHoveredItem(item);
  };

  const handleDragStart = (item) => {
    const id = item.id;
    setAnchorId(id);

    if (!selectedIds.includes(id)) {
      setSelectedIds([id]);
    }

    setDraggedItem(item);
  };

  const handleDrop = (index) => {
    if (!draggedItem) return;

    const draggedIds = selectedIds.includes(draggedItem.id)
      ? selectedIds
      : [draggedItem.id];
    const dragIndices = images
      .map((img, idx) => (draggedIds.includes(img.id) ? idx : -1))
      .filter((idx) => idx !== -1);

    if (dragIndices.includes(index)) {
      resetDragState();
      return;
    }

    reorderUploads(dragIndices, index);
    resetDragState();
  };

  return {
    draggedItem,
    handleDragOver,
    handleDragStart,
    handleDrop,
    hoveredItem,
  };
};
