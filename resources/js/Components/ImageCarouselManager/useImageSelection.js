import { useMemo, useState } from "react";

export const useImageSelection = (images, deletingIds) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [anchorId, setAnchorId] = useState(null);

  const anchorIndex = useMemo(() => {
    return images.findIndex((item) => item.id === anchorId);
  }, [anchorId, images]);
  const selectedDeletingCount = selectedIds.filter((id) =>
    deletingIds.has(id),
  ).length;

  const handleSelect = (e, index) => {
    const id = images[index].id;

    if (e.shiftKey && anchorIndex !== -1) {
      const start = Math.min(anchorIndex, index);
      const end = Math.max(anchorIndex, index);
      const rangeIds = images.slice(start, end + 1).map((img) => img.id);
      setSelectedIds(rangeIds);
    } else if (e.ctrlKey || e.metaKey) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((sid) => sid !== id));
      } else {
        setSelectedIds([...selectedIds, id]);
      }
      setAnchorId(id);
    } else {
      if (selectedIds.includes(id)) {
        setSelectedIds([]);
        setAnchorId(null);
      } else {
        setSelectedIds([id]);
        setAnchorId(id);
      }
    }
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setAnchorId(null);
  };

  return {
    anchorId,
    clearSelection,
    handleSelect,
    selectedDeletingCount,
    selectedIds,
    setAnchorId,
    setSelectedIds,
  };
};
