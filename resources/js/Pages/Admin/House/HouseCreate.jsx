import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa6";
import { route } from "@/ziggy";
import { addToast } from "@/Components/Other/Toast";

import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";
import ImageCarouselManager from "@/Components/ImageCarouselManager/ImageCarouselManager";
import useOptimizedForm from "@/Pages/Admin/Other/forms/useOptimizedForm";
import HouseForm, {
  emptyHouseForm,
  houseFormSchema,
} from "./components/HouseForm";
import {
  preventEnterSubmit,
  toIdNameOptions,
  toValueLabelOptions,
} from "./components/housePageUtils";

import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { useTranslation } from "@/i18n";

const DRAFT_IMAGE_ROUTES = {
  store: "admin.house-drafts.images.store",
  reorder: "admin.house-drafts.images.reorder",
  destroy: "admin.house-drafts.images.destroy",
  destroyBatch: "admin.house-drafts.images.destroy-batch",
};
const EMPTY_IMAGES = [];
const FORM_STORAGE_KEY = "admin.house.create.draft";

const clearSavedDraftForm = () => {
  globalThis.localStorage?.removeItem(FORM_STORAGE_KEY);
};

const loadSavedDraftForm = (draftToken, fallbackValues) => {
  try {
    const rawDraft = globalThis.localStorage?.getItem(FORM_STORAGE_KEY);
    if (!rawDraft) return fallbackValues;

    const savedDraft = JSON.parse(rawDraft);
    const savedExpiresAt = new Date(savedDraft.expiresAt).getTime();

    if (
      savedDraft.draftToken !== draftToken ||
      !Number.isFinite(savedExpiresAt) ||
      savedExpiresAt <= Date.now()
    ) {
      clearSavedDraftForm();
      return fallbackValues;
    }

    return {
      ...fallbackValues,
      ...savedDraft.values,
    };
  } catch {
    clearSavedDraftForm();
    return fallbackValues;
  }
};

const formatRemainingTime = (milliseconds) => {
  if (!Number.isFinite(milliseconds)) return "0:00";

  const totalSeconds = Math.max(Math.ceil(milliseconds / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

function HouseCreate({
  agents = [],
  features = [],
  cities = [],
  statusOptions = [],
  defaultStatus = "pending_review",
  canChangeAgent = false,
  draftToken,
  draftExpiresAt,
  existingImages = EMPTY_IMAGES,
}) {
  const { t } = useTranslation();
  const finalizedRef = useRef(false);
  const submittingRef = useRef(false);
  const timeoutHandledRef = useRef(false);
  const expiresAtMs = useMemo(
    () => new Date(draftExpiresAt).getTime(),
    [draftExpiresAt],
  );
  const [remainingMs, setRemainingMs] = useState(() =>
    Number.isFinite(expiresAtMs) ? Math.max(expiresAtMs - Date.now(), 0) : 0,
  );
  const [timedOut, setTimedOut] = useState(() => remainingMs <= 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [imageState, setImageState] = useState({
    hasPendingUploads: false,
    hasImageErrors: false,
    savingOrder: false,
    deletingCount: 0,
  });

  const agentOptions = useMemo(
    () => [
      { value: "", label: t("forms.house.select_agent") },
      ...toIdNameOptions(agents),
    ],
    [agents, t],
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

  const defaultForm = useMemo(
    () => emptyHouseForm({ agents, defaultStatus }),
    [agents, defaultStatus],
  );
  const initialForm = useMemo(
    () => loadSavedDraftForm(draftToken, defaultForm),
    [defaultForm, draftToken],
  );

  const schema = useMemo(() => houseFormSchema(t, { mode: "create" }), [t]);

  const form = useOptimizedForm(schema, initialForm);
  const { errors, getFieldProps, isValid } = form;
  const handleLocationChange = useCallback(
    (field, value) => {
      getFieldProps(field).onChange(value);
    },
    [getFieldProps],
  );
  const getCreateFieldProps = (field) => {
    const props = { ...getFieldProps(field) };

    props.isDirty = false;
    props.original = props.value;
    delete props.onReset;

    return props;
  };

  useEffect(() => {
    if (!draftToken || timedOut || finalizedRef.current) return;

    globalThis.localStorage?.setItem(
      FORM_STORAGE_KEY,
      JSON.stringify({
        draftToken,
        expiresAt: draftExpiresAt,
        values: form.values,
      }),
    );
  }, [draftExpiresAt, draftToken, form.values, timedOut]);

  const cancelDraft = useCallback(async () => {
    if (!draftToken || finalizedRef.current) return;

    try {
      await axios.delete(
        route("admin.house-drafts.cancel", { draft: draftToken }),
      );
    } catch {
      addToast(
        t("uploads.draft_cancel_failed"),
        "failure",
      );
    }
  }, [draftToken, t]);

  const timeoutDraft = useCallback(async () => {
    if (
      finalizedRef.current ||
      submittingRef.current ||
      timeoutHandledRef.current
    ) {
      return;
    }

    timeoutHandledRef.current = true;
    setTimedOut(true);
    clearSavedDraftForm();
    await cancelDraft();
    addToast(t("uploads.timed_out"), "failure");
    router.get(route("admin.houses.index"));
  }, [cancelDraft]);

  useEffect(() => {
    const tick = () => {
      const nextRemainingMs = Number.isFinite(expiresAtMs)
        ? Math.max(expiresAtMs - Date.now(), 0)
        : 0;
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0) {
        timeoutDraft();
      }
    };

    tick();

    const intervalId = window.setInterval(tick, 1000);

    return () => window.clearInterval(intervalId);
  }, [expiresAtMs, timeoutDraft]);

  const handleCancel = useCallback(async () => {
    setIsCancelling(true);
    clearSavedDraftForm();
    await cancelDraft();
    router.get(route("admin.houses.index"));
  }, [cancelDraft]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (timedOut) {
        addToast(t("flash.house_creation_expired"), "failure");
        return;
      }

      if (
        imageState.hasPendingUploads ||
        imageState.savingOrder ||
        imageState.deletingCount > 0
      ) {
        addToast(t("uploads.save_blocked"), "neutral");
        return;
      }

      if (imageState.hasImageErrors) {
        addToast(t("uploads.save_errors"), "failure");
        return;
      }

      const errorEntries = Object.entries(errors).filter(([_, error]) => error);

      if (errorEntries.length > 0 || !isValid) {
        errorEntries.forEach(([field, error]) => {
          const label = schema[field]?.label || field;
          addToast(`${label}: ${error}`, "failure");
        });

        return;
      }

      router.post(
        route("admin.houses.store"),
        {
          ...form.values,
          creation_token: draftToken,
        },
        {
          preserveScroll: true,
          onStart: () => {
            submittingRef.current = true;
            setIsSubmitting(true);
          },
          onSuccess: () => {
            finalizedRef.current = true;
            clearSavedDraftForm();
          },
          onFinish: () => {
            submittingRef.current = false;
            setIsSubmitting(false);
          },
        },
      );
    },
    [draftToken, errors, form.values, imageState, isValid, schema, t, timedOut],
  );

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={preventEnterSubmit}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl">{t("admin.create_house")}</h1>
          <p className="text-gray-500 text-sm">
            {t("forms.house.session_expires", { time: formatRemainingTime(remainingMs) })}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isCancelling || isSubmitting}
          className="flex items-center gap-2 disabled:opacity-60"
        >
          <FaArrowLeft />
          {t("actions.back")}
        </button>
      </div>

      {!timedOut && (
        <ImageCarouselManager
          houseId={draftToken}
          existingImages={existingImages}
          imageRoutes={DRAFT_IMAGE_ROUTES}
          routeParamName="draft"
          onUploadsChange={setImageState}
        />
      )}

      <HouseForm
        form={form}
        getFieldProps={getCreateFieldProps}
        agentOptions={agentOptions}
        featureOptions={featureOptions}
        cityOptions={cityOptions}
        listingStatusOptions={listingStatusOptions}
        agentDisabled={!canChangeAgent && agents.length === 1}
        statusDisabled={listingStatusOptions.length <= 1}
        mapDisabled={timedOut || isSubmitting || isCancelling}
        className="p-3 border rounded-xl bg200 shadow-cst-xl"
        onLocationChange={handleLocationChange}
      >
        <ButtonBasic
          type="submit"
          variant="Blue"
          disabled={timedOut || isSubmitting || isCancelling}
        >
          {isSubmitting ? t("actions.saving") : t("actions.save_house")}
        </ButtonBasic>
      </HouseForm>
    </form>
  );
}

HouseCreate.layout = (page) => (
  <LayoutAdminDashboard
    children={page}
    titleKey="admin.create_house"
  />
);

export default HouseCreate;
