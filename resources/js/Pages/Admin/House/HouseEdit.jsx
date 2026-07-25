import { useCallback, useMemo, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { FaArrowLeft } from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { route } from "@/ziggy";
import { addToast } from "@/Components/Other/Toast";

import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";
import ImageCarouselManager from "@/Components/ImageCarouselManager/ImageCarouselManager";
import DeleteConfirmationModal from "@/Components/ImageCarouselManager/DeleteConfirmationModal";
import useOptimizedForm from "@/Pages/Admin/Other/forms/useOptimizedForm";
import HouseForm, {
  houseFormSchema,
  houseToForm,
} from "./components/HouseForm";
import ConfirmedRentersPanel from "./components/ConfirmedRentersPanel";
import HouseCommentModerationPanel from "./components/HouseCommentModerationPanel";
import {
  preventEnterSubmit,
  toIdNameOptions,
  toValueLabelOptions,
} from "./components/housePageUtils";

import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { useTranslation } from "@/i18n";

function HouseEdit({
  house,
  agents,
  features,
  cities = [],
  statusOptions = [],
  canChangeAgent = false,
  canDeleteHouse = false,
  canManageRentals = false,
  canModerateComments = false,
  rentalData = {},
  commentModeration = [],
}) {
  const { t } = useTranslation();
  const isDeleted = Boolean(house.deleted_at) || house.status === "deleted";
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const houseTitle = house.title || house.title_en || t("actions.delete_house");
  const deleteConfirmation = deleteModalOpen
    ? {
        title: t("actions.delete_house"),
        message: t("flash.house_delete_confirm", { title: houseTitle }),
        confirmLabel: t("actions.delete_house"),
      }
    : null;
  const agentOptions = useMemo(
    () => toIdNameOptions(agents),
    [agents],
  );

  const featureOptions = useMemo(
    () => toIdNameOptions(features),
    [features],
  );

  const cityOptions = useMemo(
    () => toValueLabelOptions(cities),
    [cities],
  );

  const listingStatusOptions = useMemo(
    () => toValueLabelOptions(statusOptions),
    [statusOptions],
  );

  const initialForm = useMemo(() => houseToForm(house), [house]);

  const schema = useMemo(() => houseFormSchema(t), [t]);

  const form = useOptimizedForm(schema, initialForm);
  const {
    getFieldProps,
    dirtyFields,
    getDirtyPayload,
    syncWithServer,
  } = form;
  const handleLocationChange = useCallback(
    (field, value) => {
      getFieldProps(field).onChange(value);
    },
    [getFieldProps],
  );


  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // 1. Collect all error fields
      const errorEntries = Object.entries(form.errors).filter(
        ([_, error]) => error,
      );

      if (errorEntries.length > 0) {
        errorEntries.forEach(([field, error]) => {
          const label = schema[field]?.label || field;
          addToast(`${label}: ${error}`, "failure");
        });

        return;
      }

      // 2. Block empty submission (no changes)
      const payload = getDirtyPayload();
      if (Object.keys(payload).length === 0) {
        addToast(t("forms.house.no_changes"), "neutral");
        return;
      }
      router.put(route("admin.houses.update", house.id), payload, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
          const fresh = page.props.house;

          syncWithServer(houseToForm(fresh));
        },
      });
    },
    [house.id, getDirtyPayload, form.errors, schema, syncWithServer, t],
  );

  const confirmHouseDelete = useCallback(() => {
    if (!canDeleteHouse || isDeleted) return;

    router.delete(route("admin.houses.destroy", { house: house.id }), {
      preserveScroll: true,
      onFinish: () => setDeleteModalOpen(false),
    });
  }, [canDeleteHouse, house.id, isDeleted]);

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        onKeyDown={preventEnterSubmit}
        className="flex flex-col gap-4"
      >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl text-gray-950 dark:text-gray-100">
          {t("admin.edit_house")}
        </h1>

        <Link
          href={route("admin.houses.index")}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-200 dark:hover:text-indigo-300 hover:text-indigo-700"
        >
          <FaArrowLeft />
          {t("admin.back")}
        </Link>
      </div>
      {!isDeleted && (
        <ImageCarouselManager
          houseId={house.id}
          existingImages={house.images ?? []}
        />
      )}

      {isDeleted && (
        <div className="px-4 py-3 border border-amber-200 rounded-lg bg-amber-50 font-semibold text-amber-800 text-sm">
          This listing is deleted. Restore it from the houses table before editing.
        </div>
      )}

      <HouseForm
        form={form}
        agentOptions={agentOptions}
        featureOptions={featureOptions}
        cityOptions={cityOptions}
        listingStatusOptions={listingStatusOptions}
        agentDisabled={!canChangeAgent || isDeleted}
        statusDisabled={isDeleted || listingStatusOptions.length <= 1}
        onLocationChange={handleLocationChange}
      >
        <ButtonBasic
          type="submit"
          variant="Blue"
          disabled={isDeleted || !Object.values(dirtyFields).some(Boolean)}
        >
          {t("admin.save_changes")}
        </ButtonBasic>
      </HouseForm>

      </form>


      <ConfirmedRentersPanel
        houseId={house.id}
        rentalData={rentalData}
        canManage={canManageRentals && !isDeleted}
      />

      <HouseCommentModerationPanel
        houseId={house.id}
        comments={commentModeration}
        canModerate={canModerateComments}
      />

      <DeleteConfirmationModal
        confirmation={deleteConfirmation}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={confirmHouseDelete}
      />
    </div>
  );
}

HouseEdit.layout = (page) => (
  <LayoutAdminDashboard
    children={page}
    titleKey="admin.edit_house"
  />
);

export default HouseEdit;
