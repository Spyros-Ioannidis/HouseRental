import { router, useForm } from "@inertiajs/react";
import { FiSave, FiTrash2 } from "react-icons/fi";

import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { useTranslation } from "@/i18n";

export const catalogInputClass =
  "w-full !rounded-md inputField-primary inputField-style-primary";
// "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100";
export function FieldError({ message }) {
  return message ? (
    <p className="mt-1 font-medium text-red-600 text-xs">{message}</p>
  ) : null;
}

function EditableCatalogRow({ item }) {
  const { t } = useTranslation();
  const updateRoute = item.routes?.update;
  const destroyRoute = item.routes?.destroy;
  const form = useForm({
    name: item.name || "",
    name_en: item.name_en || item.name || "",
    name_el: item.name_el || "",
  });

  const submit = (event) => {
    event.preventDefault();
    if (!updateRoute) return;

    form.put(updateRoute, {
      preserveScroll: true,
    });
  };

  const destroy = () => {
    if (!destroyRoute) return;

    router.delete(destroyRoute, {
      preserveScroll: true,
    });
  };

  const fields = [
    {
      name: "name",
      required: true,
    },
    {
      name: "name_en",
    },
    {
      name: "name_el",
    },
  ];

  return (
    <tr className="border-gray-100 border-t dark:border-gray-800">
      {fields.map((field) => (
        <td key={field.name} className="px-3 py-3 align-top">
          <input
            className={`inputField-style-primary ${catalogInputClass}`}
            value={form.data[field.name]}
            onChange={(event) => form.setData(field.name, event.target.value)}
            required={field.required}
          />
          <FieldError message={form.errors[field.name]} />
        </td>
      ))}
      <td className="px-3 py-3 align-top">
        <div className="flex justify-end gap-2">
          <ButtonBasic
            type="button"
            variant="Blue"
            disabled={form.processing || !form.isDirty || !updateRoute}
            onClick={submit}
            className="inline-flex items-center gap-2"
          >
            {/* <FiSave /> */}
            {t("actions.save")}
          </ButtonBasic>
          <ButtonBasic
            type="button"
            variant="Red"
            disabled={!destroyRoute}
            onClick={destroy}
            className="inline-flex items-center gap-2"
          >
            {/* <FiTrash2 /> */}
            {t("actions.delete")}
          </ButtonBasic>
        </div>
      </td>
    </tr>
  );
}

export default function CatalogSettingsTable({ items }) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg dark:border-gray-800">
      <table className="min-w-[760px] w-full text-left text-sm">
        <thead className="bg-gray-100 font-semibold text-gray-500 text-xs uppercase dark:bg-gray-950">
          <tr>
            <th className="px-3 py-3">{t("tables.value")}</th>
            <th className="px-3 py-3">{t("tables.english")}</th>
            <th className="px-3 py-3">{t("tables.greek")}</th>
            <th className="px-3 py-3 text-right">{t("tables.actions")}</th>
          </tr>
        </thead>
        <tbody className="bg-color-card">
          {items.length > 0 ? (
            items.map((item) => (
              <EditableCatalogRow key={item.id} item={item} />
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-10 font-medium text-center text-gray-500 text-sm"
              >
                {t("empty.catalog")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
