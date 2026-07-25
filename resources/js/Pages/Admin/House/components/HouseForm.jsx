import MapLocationManager from "@/Components/Map/MapLocationManager";
import InputCheckbox from "@/Components/form/Input/InputCheckbox";
import InputSelect from "@/Components/form/Input/InputSelect";
import InputText from "@/Components/form/Input/InputText";
import TextArea from "@/Components/form/Input/TextArea";
import { useTranslation } from "@/i18n";

export function emptyHouseForm({ agents = [], defaultStatus = "pending_review" } = {}) {
  return {
    title_en: "",
    title_el: "",
    agent: agents.length === 1 ? agents[0].id : "",
    status: defaultStatus,
    features: [],
    description_en: "",
    description_el: "",
    year_built: "",
    address: "",
    city: "",
    latitude: "",
    longitude: "",
    area: "",
    price: "",
    floor: "",
    bathroom: 1,
    living_room: 1,
    bedroom: 1,
  };
}

export function houseToForm(house) {
  return {
    title_en: house.title_en || house.title || "",
    title_el: house.title_el || "",
    agent: house.user.id,
    status: house.status || "pending_review",
    features: house.features?.map((feature) => feature.id) ?? [],
    description_en: house.description_en || house.description || "",
    description_el: house.description_el || "",
    year_built: house.year_built,
    address: house.address,
    city: house.city ?? "",
    latitude: house.latitude ?? "",
    longitude: house.longitude ?? "",
    area: house.area,
    price: house.price,
    floor: house.floor,
    bathroom: house.bathroom,
    living_room: house.living_room,
    bedroom: house.bedroom,
  };
}

export function houseFormSchema(t, { mode = "edit" } = {}) {
  const isCreate = mode === "create";

  return {
    title_en: {
      label: t("forms.house.title_en"),
      type: "string",
      required: true,
      minlength: 3,
    },
    title_el: {
      label: t("forms.house.title_el"),
      type: "string",
      required: isCreate ? false : undefined,
      minlength: 3,
    },
    agent: { label: t("forms.house.agent"), type: "number", required: true },
    status: { label: t("forms.house.status"), type: "string", required: true },
    address: {
      label: t("forms.house.address"),
      type: "string",
      required: true,
      minlength: 3,
      maxlength: 120,
    },
    city: {
      label: t("forms.house.city"),
      type: "string",
      required: true,
      minlength: 2,
      maxlength: 80,
    },
    latitude: {
      label: t("forms.house.latitude"),
      type: "number",
      required: isCreate ? false : undefined,
      min: -90,
      max: 90,
    },
    longitude: {
      label: t("forms.house.longitude"),
      type: "number",
      required: isCreate ? false : undefined,
      min: -180,
      max: 180,
    },
    description_en: {
      label: t("forms.house.description_en"),
      type: "string",
      required: true,
    },
    description_el: {
      label: t("forms.house.description_el"),
      type: "string",
      required: isCreate ? false : undefined,
    },
    year_built: {
      label: t("forms.house.year_built"),
      type: "number",
      required: isCreate ? true : undefined,
      min: 1800,
      max: 2100,
    },
    area: {
      label: t("forms.house.area"),
      type: "number",
      required: isCreate ? true : undefined,
      min: 0,
    },
    price: {
      label: t("forms.house.price"),
      type: "number",
      required: isCreate ? true : undefined,
      min: 0,
      max: 99999,
      validate: (value) => {
        if (!/^\d+$/.test(String(value))) {
          return isCreate
            ? t("forms.house.price_whole_number")
            : "Price must be a whole number";
        }

        return "";
      },
    },
    floor: {
      label: t("forms.house.floor"),
      type: "number",
      required: isCreate ? true : undefined,
      min: 0,
      max: 20,
    },
    bathroom: {
      label: t("forms.house.bathroom"),
      type: "number",
      required: isCreate ? true : undefined,
      min: 0,
      max: 20,
    },
    living_room: {
      label: t("forms.house.living_room"),
      type: "number",
      required: isCreate ? true : undefined,
      min: 0,
      max: 20,
    },
    bedroom: {
      label: t("forms.house.bedroom"),
      type: "number",
      required: isCreate ? true : undefined,
      min: 0,
      max: 20,
    },
  };
}

export default function HouseForm({
  form,
  getFieldProps = form.getFieldProps,
  agentOptions,
  featureOptions,
  cityOptions,
  listingStatusOptions,
  agentDisabled = false,
  statusDisabled = false,
  mapDisabled = false,
  className = "p-3 border border-color-card rounded-xl bg-color-card shadow-cst-xl ",
  onLocationChange,
  children,
}) {
  const { t } = useTranslation();
  const errors = form.errors ?? {};

  return (
    <div className={className}>
      <div className="flex gap-6">
        <div className="w-[50%] flex-1 space-y-2">
          <InputText
            required
            label={t("forms.house.title_en")}
            {...getFieldProps("title_en")}
          />

          <InputText
            label={t("forms.house.title_el")}
            {...getFieldProps("title_el")}
          />

          <InputSelect
            required
            label={t("forms.house.agent")}
            options={agentOptions}
            disabled={agentDisabled}
            {...getFieldProps("agent")}
          />

          <InputSelect
            required
            label={t("forms.house.status")}
            options={listingStatusOptions}
            disabled={statusDisabled}
            {...getFieldProps("status")}
          />

          <InputText
            required
            label={t("forms.house.year_built")}
            inputMode="numeric"
            error={errors.year_built}
            {...getFieldProps("year_built")}
          />

          <InputText
            inputMode="numeric"
            required
            label={t("forms.house.area")}
            error={errors.area}
            {...getFieldProps("area")}
          />

          <InputText
            inputMode="numeric"
            required
            label={t("forms.house.price")}
            {...getFieldProps("price")}
          />
        </div>

        <div className="w-[50%] flex-1 space-y-2">
          <InputText
            required
            inputMode="numeric"
            label={t("forms.house.floor")}
            {...getFieldProps("floor")}
          />

          <InputText
            required
            inputMode="numeric"
            label={t("forms.house.bathroom")}
            {...getFieldProps("bathroom")}
          />

          <InputText
            required
            inputMode="numeric"
            label={t("forms.house.living_room")}
            {...getFieldProps("living_room")}
          />

          <InputText
            required
            inputMode="numeric"
            label={t("forms.house.bedroom")}
            {...getFieldProps("bedroom")}
          />

          <InputCheckbox
            label={t("forms.house.features")}
            options={featureOptions}
            {...getFieldProps("features")}
          />
        </div>
      </div>

      <div className="mt-4">
        <MapLocationManager
          address={form.values.address}
          city={form.values.city}
          latitude={form.values.latitude}
          longitude={form.values.longitude}
          cityOptions={cityOptions}
          errors={errors}
          disabled={mapDisabled}
          onChange={onLocationChange}
        />
      </div>

      <TextArea
        label={t("forms.house.description_en")}
        required
        InputWidth="100%"
        {...getFieldProps("description_en")}
      />

      <TextArea
        label={t("forms.house.description_el")}
        InputWidth="100%"
        {...getFieldProps("description_el")}
      />

      {children}
    </div>
  );
}
