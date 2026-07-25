import { router } from "@inertiajs/react";
import { FiX } from "react-icons/fi";
import { route } from "@/ziggy";

import {
  getActiveFilters,
  removeFilterFromQuery,
} from "@/Components/Filters/houseFilterUtils";
import { useTranslation } from "@/i18n";

function ActiveFilterBar({ filters, query = {}, action }) {
  const { t, locale } = useTranslation();
  const activeFilters = getActiveFilters(query, filters, t);
  const targetPath = action ?? route("houses.index", { locale });

  const handleRemoveFilter = (filter) => {
    router.get(targetPath, removeFilterFromQuery(query, filter), {
      preserveState: true,
      replace: true,
    });
  };

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {activeFilters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex max-w-full items-center gap-2 border border-indigo-200 rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-900 text-xs dark:border-indigo-900/70 dark:bg-indigo-950/60 dark:text-indigo-100"
        >
          <span className="truncate">{filter.label}</span>
          <button
            type="button"
            onClick={() => handleRemoveFilter(filter)}
            className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-indigo-700 transition-colors hover:bg-indigo-200 hover:text-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 dark:hover:text-white"
            aria-label={t("filters.remove_filter", { label: filter.label })}
          >
            <FiX size={13} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </span>
      ))}
    </div>
  );
}

export default ActiveFilterBar;
