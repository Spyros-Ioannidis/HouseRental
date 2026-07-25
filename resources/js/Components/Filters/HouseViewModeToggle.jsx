import { FiGrid, FiList } from "react-icons/fi";

import { useTranslation } from "@/i18n";

export default function HouseViewModeToggle({ viewMode, onChange }) {
  const { t } = useTranslation();

  const buttonClassName = (mode) =>
    `grid h-10 w-10 place-items-center rounded-md transition hover:cursor-pointer ${
      viewMode === mode
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    }`;

  return (
    <div className="flex w-full justify-start sm:w-auto sm:justify-end">
      <div
        role="group"
        aria-label={t("filters.view_mode")}
        className="inline-flex p-1 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800"
      >
        <button
          type="button"
          onClick={() => onChange("list")}
          aria-pressed={viewMode === "list"}
          aria-label={t("filters.list_view")}
          title={t("filters.list_view")}
          className={buttonClassName("list")}
        >
          <FiList size={18} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => onChange("grid")}
          aria-pressed={viewMode === "grid"}
          aria-label={t("filters.grid_view")}
          title={t("filters.grid_view")}
          className={buttonClassName("grid")}
        >
          <FiGrid size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
