import CustomCheckbox from "@/Components/form/Input/CustomCheckBox";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { useTranslation } from "@/i18n";

const ImageToolbar = ({
  deletingCount,
  imageCount,
  onRemoveAll,
  onRemoveSelected,
  savingOrder,
  selectedCount,
  selectedDeletingCount,
  setShowInfo,
  showInfo,
}) => {
  const { t } = useTranslation();

  return (
    <div className="my-4 flex items-center gap-4">
      <CustomCheckbox
        label={t("uploads.show_info")}
        checked={showInfo}
        onChange={() => setShowInfo((prev) => !prev)}
      />

      {imageCount > 0 && (
        <ButtonBasic
          onClick={onRemoveAll}
          disabled={deletingCount > 0}
          variant="Red"
        >
          {deletingCount > 0 ? t("uploads.deleting") : t("actions.delete_all")}
        </ButtonBasic>
      )}

      {selectedCount > 0 && (
        <ButtonBasic
          onClick={onRemoveSelected}
          disabled={selectedDeletingCount > 0}
          variant="Red"
        >
          {selectedDeletingCount > 0
            ? t("uploads.deleting")
            : `${t("actions.delete_selected")} (${selectedCount})`}
        </ButtonBasic>
      )}

      {deletingCount > 0 && (
        <span className="text-gray-500 text-sm">
          {t("uploads.deleting_count", { count: deletingCount })}
        </span>
      )}

      {savingOrder && (
        <span className="text-gray-500 text-sm">{t("uploads.saving_order")}</span>
      )}
    </div>
  );
};

export default ImageToolbar;
