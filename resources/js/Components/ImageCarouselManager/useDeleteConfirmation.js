import { useState } from "react";
import { useTranslation } from "@/i18n";

export const useDeleteConfirmation = ({
  anchorId,
  clearSelection,
  images,
  removeFile,
  removeFiles,
  selectedIds,
  setAnchorId,
}) => {
  const { t } = useTranslation();
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const requestDeleteOne = (id) => {
    setDeleteConfirmation({
      ids: [id],
      mode: "single",
      title: t("actions.delete_image"),
      message: t("uploads.confirm_delete_one"),
      confirmLabel: t("actions.delete_image"),
    });
  };

  const requestDeleteSelected = () => {
    setDeleteConfirmation({
      ids: [...selectedIds],
      mode: "multiple",
      title: t("actions.delete_selected"),
      message: t("uploads.confirm_delete_selected", {
        count: selectedIds.length,
      }),
      confirmLabel: t("actions.delete_selected"),
    });
  };

  const requestDeleteAll = () => {
    setDeleteConfirmation({
      ids: images.map((img) => img.id),
      mode: "multiple",
      title: t("actions.delete_all"),
      message: t("uploads.confirm_delete_all", {
        count: images.length,
      }),
      confirmLabel: t("actions.delete_all"),
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    const { ids, mode } = deleteConfirmation;

    setDeleteConfirmation(null);

    if (mode === "single") {
      if (selectedIds.includes(ids[0])) {
        clearSelection();
      } else if (anchorId === ids[0]) {
        setAnchorId(null);
      }

      await removeFile(ids[0]);
      return;
    }

    await removeFiles(ids);
    clearSelection();
  };

  return {
    confirmDelete,
    deleteConfirmation,
    requestDeleteAll,
    requestDeleteOne,
    requestDeleteSelected,
    setDeleteConfirmation,
  };
};
