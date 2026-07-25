import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { FiPlus, FiSave } from "react-icons/fi";

import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";
import Modal from "@/Components/Other/Modal";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import CatalogSettingsTable, {
  catalogInputClass,
  FieldError,
} from "./components/CatalogSettingsTable";
import { useTranslation } from "@/i18n";

const CATALOG_SECTIONS = [
  {
    type: "cities",
    title: "Allowed cities",
    description:
      "Houses can only be created or edited with one of these cities.",
    noun: "City",
  },
  {
    type: "features",
    title: "Features",
    description:
      "Feature translations appear in filters, house cards, and detail pages.",
    noun: "Feature",
  },
];

function CatalogAddModal({ open, type, noun, catalogRoutes, onClose }) {
  const { t } = useTranslation();
  const storeRoute = catalogRoutes?.[type]?.store;
  const form = useForm({
    name: "",
    name_en: "",
    name_el: "",
  });

  if (!open) return null;

  const submit = (event) => {
    event.preventDefault();
    if (!storeRoute) return;

    form.post(storeRoute, {
      preserveScroll: true,
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  const modalData = [
    {
      name: "name",
      label: `${noun} ${t("tables.value")}`,
      required: true,
    },
    {
      name: "name_en",
      label: t("tables.english"),
    },
    {
      name: "name_el",
      label: t("tables.greek"),
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title={t("actions.add", { item: noun })} size="lg">
      <form onSubmit={submit} className="mt-5 space-y-4">
        {modalData.map((field) => (
          <label key={field.name} className="block">
            <span className="font-semibold text-gray-700 text-sm dark:text-gray-200">
              {field.label}
            </span>
            <input
              className={`inputField-primary inputField-style-primary w-full !rounded-md`}
              value={form.data[field.name]}
              onChange={(event) => form.setData(field.name, event.target.value)}
              required={field.required}
            />
            <FieldError message={form.errors[field.name]} />
          </label>
        ))}

        <div className="flex justify-end gap-2 pt-2">
          <ButtonBasic type="button" variant="GrayOutline" onClick={onClose}>
            {t("actions.cancel")}
          </ButtonBasic>
          <ButtonBasic
            type="submit"
            variant="Blue"
            disabled={form.processing || !storeRoute}
            className="inline-flex items-center gap-2"
          >
            <FiPlus />
            {t("actions.add", { item: noun })}
          </ButtonBasic>
        </div>
      </form>
    </Modal>
  );
}

function CatalogSection({ title, description, noun, items, onAdd }) {
  const { t } = useTranslation();

  return (
    <section className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-gray-950 text-xl dark:text-gray-100">
            {title}
          </h2>
        </div>
        <ButtonBasic
          type="button"
          variant="Blue"
          onClick={onAdd}
          className="inline-flex items-center gap-2"
        >
          <FiPlus />
          {t("actions.add", { item: noun })}
        </ButtonBasic>
      </div>

      <CatalogSettingsTable items={items} />
    </section>
  );
}

function ContactSettingsSection({ settings = {}, updateRoute }) {
  const { t } = useTranslation();
  const form = useForm({
    email: settings.email || "",
    phone: settings.phone || "",
    office: settings.office || "",
  });
  const fields = [
    {
      name: "email",
      label: t("pages.contact.email"),
      type: "email",
      inputMode: "email",
      placeholder: "hello@example.com",
    },
    {
      name: "phone",
      label: t("pages.contact.phone"),
      type: "text",
      inputMode: "tel",
      placeholder: "+30 210 000 0000",
    },
    {
      name: "office",
      label: t("pages.contact.office"),
      type: "text",
      inputMode: "text",
      placeholder: "Athens, Greece",
    },
  ];

  const submit = (event) => {
    event.preventDefault();
    if (!updateRoute) return;

    form.put(updateRoute, {
      preserveScroll: true,
    });
  };

  return (
    <section className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
      <div className="mb-5">
        <h2 className="font-semibold text-gray-950 text-xl dark:text-gray-100">
          {t("meta.contact_title")}
        </h2>
      </div>

      <form
        onSubmit={submit}
        className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-start"
      >
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="font-semibold text-gray-700 text-sm dark:text-gray-200">
              {field.label}
            </span>
            <input
              type={field.type}
              inputMode={field.inputMode}
              className={catalogInputClass}
              value={form.data[field.name]}
              onChange={(event) => form.setData(field.name, event.target.value)}
              placeholder={field.placeholder}
              required
            />
            <FieldError message={form.errors[field.name]} />
          </label>
        ))}

        <ButtonBasic
          type="submit"
          variant="Blue"
          disabled={form.processing || !form.isDirty || !updateRoute}
          className="inline-flex items-center gap-2 xl:mt-6"
        >
          <FiSave />
          {t("actions.save")}
        </ButtonBasic>
      </form>
    </section>
  );
}

function CatalogSettings({
  cities = [],
  features = [],
  catalogRoutes = {},
  contactSettings = {},
  contactSettingsRoute,
}) {
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState(null);
  const catalogData = { cities, features };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-semibold text-2xl text-gray-950 dark:text-gray-100">
          {t("admin.settings")}
        </h1>

      </header>

      <ContactSettingsSection
        settings={contactSettings}
        updateRoute={contactSettingsRoute}
      />

      {CATALOG_SECTIONS.map((section) => (
        <CatalogSection
          key={section.type}
          {...section}
          items={catalogData[section.type]}
          onAdd={() => setActiveModal(section.type)}
        />
      ))}

      {CATALOG_SECTIONS.map((section) => (
        <CatalogAddModal
          key={section.type}
          open={activeModal === section.type}
          type={section.type}
          noun={section.noun}
          catalogRoutes={catalogRoutes}
          onClose={() => setActiveModal(null)}
        />
      ))}
    </div>
  );
}

CatalogSettings.layout = (page) => (
  <LayoutAdminDashboard children={page} titleKey="admin.settings" />
);

export default CatalogSettings;
