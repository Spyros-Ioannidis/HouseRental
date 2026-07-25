import { router } from "@inertiajs/react";
import { route } from "@/ziggy";

import { cleanQuery } from "@/Components/Filters/houseFilterUtils";
import { useTranslation } from "@/i18n";

const orderOptions = [
  { value: "", labelKey: "filters.order_options.newest" },
  { value: "price:asc", labelKey: "filters.order_options.price_asc" },
  { value: "price:desc", labelKey: "filters.order_options.price_desc" },
  { value: "area:asc", labelKey: "filters.order_options.area_asc" },
  { value: "area:desc", labelKey: "filters.order_options.area_desc" },
  { value: "year_built:desc", labelKey: "filters.order_options.year_desc" },
  { value: "year_built:asc", labelKey: "filters.order_options.year_asc" },
];

export default function HouseOrder({ query = {}, action }) {
  const { t, locale } = useTranslation();
  const targetPath = action ?? route("houses.index", { locale });
  const currentValue =
    query.order_by && query.order_dir
      ? `${query.order_by}:${query.order_dir}`
      : "";

  const handleChange = (event) => {
    const [orderBy, orderDir] = event.target.value.split(":");
    const nextQuery = { ...query };

    delete nextQuery.page;

    if (orderBy && orderDir) {
      nextQuery.order_by = orderBy;
      nextQuery.order_dir = orderDir;
    } else {
      delete nextQuery.order_by;
      delete nextQuery.order_dir;
    }

    router.get(targetPath, cleanQuery(nextQuery), {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <label className="flex w-full flex-col gap-1 font-semibold text-color-primary text-sm sm:w-64">
      <select
        value={currentValue}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-indigo-500 outline-none rounded-md bg-primary text-color-primary text-sm transition focus:ring focus:ring-indigo-700 hover:cursor-pointer"
      >
        {orderOptions.map((option) => (
          <option key={option.value || "newest"} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
