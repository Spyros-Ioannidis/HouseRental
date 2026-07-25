import Modal from "@/Components/Other/Modal";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { useTranslation } from "@/i18n";

const DeleteConfirmationModal = ({ confirmation, onCancel, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <Modal
      open={Boolean(confirmation)}
      onClose={onCancel}
      title={confirmation?.title}
      size="sm"
      showCloseButton={false}
      footer={
        <div className="flex justify-end gap-2">
          <ButtonBasic onClick={onCancel} variant="Blue">
            {t("actions.cancel")}
          </ButtonBasic>
          <ButtonBasic onClick={onConfirm} variant="Red">
            {confirmation?.confirmLabel}
          </ButtonBasic>
        </div>
      }
    >
      <p className="mt-2 text-gray-600 text-sm">{confirmation?.message}</p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
