import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { FiFilter } from "react-icons/fi";
import { route } from "@/ziggy";

import {
  buildCleanedFilters,
  cleanQuery,
  getActiveFilters,
  getDefaultFilterForm,
  getFilterFormFromQuery,
  getCityFilter,
  getMultiFilters,
  getNonFilterQuery,
  getRangeFilters,
} from "@/Components/Filters/houseFilterUtils";
import Dropdown from "@/Components/Other/Dropdown";
import Sidebar from "@/Components/Other/Sidebar";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import GradientButton from "@/Components/form/Button/GradientButton";
import InputCheckbox from "@/Components/form/Input/InputCheckbox";
import InputSelectSearch from "@/Components/form/Input/InputSelectSearch";
import InputRange from "@/Components/form/InputRange";
import { useTranslation } from "@/i18n";

export default function SideFilters({
  filters,
  query = {},
  action,
  side = "left",
  title = "Filters",
  buttonLabel = "Filters",
  className = "",
}) {
  const { t, locale } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() =>
    getFilterFormFromQuery(query, filters),
  );
  const targetPath = action ?? route("houses.index", { locale });
  const preservedQuery = getNonFilterQuery(query, filters);
  const activeFilterCount = getActiveFilters(query, filters, t).length;
  const labelFor = (filter) =>
    filter?.label_key ? t(filter.label_key) : (filter?.label ?? "");
  const placeholderFor = (filter) =>
    filter?.placeholder_key
      ? t(filter.placeholder_key)
      : (filter?.placeholder ?? "");

  useEffect(() => {
    setForm(getFilterFormFromQuery(query, filters));
  }, [query, filters]);

  const cityFilter = getCityFilter(filters);
  const rangeFilters = getRangeFilters(filters).map((filter) => ({
    ...filter,
    label: labelFor(filter),
    bounds: filter.bounds ?? {},
  }));
  const multiFilters = getMultiFilters(filters).map((filter) => ({
    ...filter,
    label: labelFor(filter),
    options: filter.options ?? [],
  }));

  const handleSubmit = () => {
    const cleaned = buildCleanedFilters(form, filters);

    setOpen(false);
    router.get(targetPath, cleanQuery({ ...preservedQuery, ...cleaned }), {
      preserveState: true,
      replace: true,
    });
  };

  const handleClear = () => {
    setForm(getDefaultFilterForm(filters));
    setOpen(false);
    router.get(targetPath, preservedQuery, { preserveState: true, replace: true });
  };

  return (
    <>
      <ButtonBasic
        type="button"
        variant="Blue"
        onClick={() => setOpen(true)}
        className={className}
        aria-label={
          activeFilterCount > 0
            ? `${buttonLabel} (${activeFilterCount})`
            : buttonLabel
        }
      >
        <span className="flex items-center gap-2">
          <FiFilter aria-hidden="true" />
          {buttonLabel}
          {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </span>
      </ButtonBasic>

      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        title={title}
        ariaLabel={title}
      >
        <div className="space-y-2">
          {cityFilter && (
            <InputSelectSearch
              name={cityFilter.key}
              label={labelFor(cityFilter)}
              value={form[cityFilter.key]}
              options={cityFilter.options ?? []}
              placeholder={placeholderFor(cityFilter)}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  [cityFilter.key]: event.target.value,
                }))
              }
              InputWidth="100%"
            />
          )}

          {rangeFilters.map((filter) => (
            <Dropdown key={filter.label} title={filter.label}>
              <InputRange
                props={{
                  label: "",
                  prefix: filter.prefix,
                  step: filter.step,
                }}
                value={{
                  min: form[filter.key_min],
                  max: form[filter.key_max],
                }}
                minBound={filter.bounds.min}
                maxBound={filter.bounds.max}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    [filter.key_min]: val.min,
                    [filter.key_max]: val.max,
                  }))
                }
              />
            </Dropdown>
          ))}

          {multiFilters.map((filter) => (
            <Dropdown key={filter.label} title={filter.label}>
              {filter.options.length === 0 ? (
                <p className="text-gray-500 text-sm">{t("filters.no_options")}</p>
              ) : (
                <InputCheckbox
                  name={filter.key}
                  label={filter.label}
                  itemClassName={filter.item_class_name}
                  options={filter.options}
                  optionsClassName="grid w-full grid-cols-3 gap-1.5 py-1 auto-rows-fr [&>*]:min-w-0 [&>*]:w-full"
                  showLabel={false}
                  trackChanges={false}
                  value={form[filter.key]}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      [filter.key]: val,
                    }))
                  }
                />
              )}
            </Dropdown>
          ))}

          <div className="flex gap-2 pt-3">
            <GradientButton className="flex-1 py-2 text-sm" onClick={handleSubmit}>
              {t("filters.apply")}
            </GradientButton>
            <GradientButton
              className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm hover:bg-gray-300"
              onClick={handleClear}
            >
              {t("filters.clear")}
            </GradientButton>
          </div>
        </div>
      </Sidebar>
    </>
  );
}
