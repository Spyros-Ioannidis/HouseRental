import Layout from "@/Layout/Layout";
import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { route } from "@/ziggy";

import CardHouse from "@/Components/Card/CardHouse";
import ActiveFilterBar from "@/Components/Filters/ActiveFilterBar";
import HouseOrder from "@/Components/Filters/HouseOrder";
import HouseViewModeToggle from "@/Components/Filters/HouseViewModeToggle";
import { cleanQuery } from "@/Components/Filters/houseFilterUtils";
import SideFilters from "@/Components/Filters/SideFilters";
import Pagination from "@/Components/Other/Pagination";
import InputSearch from "@/Components/form/InputSearch";
import { useTranslation } from "@/i18n";
import Breadcrumbs from "@/Components/Navigation/Breadcrumbs";

const compactViewQuery = "(max-width: 767px)";

function Houses({ houses, filters, query = {} }) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState(query.search ?? "");
  const [viewMode, setViewMode] = useState("list");
  const [isCompactView, setIsCompactView] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(compactViewQuery).matches,
  );
  const targetPath = route("houses.index", { locale });
  const effectiveViewMode = isCompactView ? "grid" : viewMode;
  const listingLayoutClassName =
    effectiveViewMode === "grid"
      ? "grid items-start gap-6 md:grid-cols-2"
      : "grid gap-6";

  useEffect(() => {
    setSearch(query.search ?? "");
  }, [query.search]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(compactViewQuery);
    const handleChange = () => setIsCompactView(mediaQuery.matches);

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);

      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);

    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const handleSearch = () => {
    const nextQuery = { ...query };
    const searchValue = search.trim();

    delete nextQuery.page;

    if (searchValue) {
      nextQuery.search = searchValue;
    } else {
      delete nextQuery.search;
    }

    router.get(targetPath, cleanQuery(nextQuery), {
      preserveState: true,
      replace: true,
    });
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">

      <section aria-labelledby="houses-title" className="grid gap-6">
        <h1 id="houses-title" className="sr-only">
          {t("meta.houses_title")}
        </h1>
        <div className="flex flex-col gap-3">
          <div className="flex w-full justify-start">
            <form
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                handleSearch();
              }}
              className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <InputSearch
                value={search}
                onChange={setSearch}
                onSearch={handleSearch}
                label={t("filters.search")}
                placeholder={t("filters.search_placeholder")}
              />
            </form>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <HouseOrder query={query} />

            <HouseViewModeToggle
              viewMode={viewMode}
              onChange={setViewMode}
            />
          </div>

          <div className="fixed bottom-6 right-6 z-50">
            <SideFilters
              filters={filters}
              query={query}
              side="right"
              title={t("filters.title")}
              buttonLabel={t("filters.button")}
              className="shadow-lg"
            />
          </div>
        </div>

        <ActiveFilterBar filters={filters} query={query} />

        {houses.data.length > 0 ? (
          <div className={listingLayoutClassName}>
            {houses.data.map((house) => (
              <CardHouse
                key={house.id}
                props={house}
                variant={effectiveViewMode}
              />
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 border border-dashed border-color-card rounded-lg bg-color-card text-center">
            <h2 className="font-semibold text-xl">
              {t("empty.public_houses_title")}
            </h2>
            <p className="mt-2 text-color-secondary text-sm">
              {t("empty.public_houses_body")}
            </p>
          </div>
        )}

        <Pagination links={houses.links} />
      </section>
    </div>
  );
}

Houses.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.houses_title"
    descriptionKey="meta.houses_description"
    canonical="/houses"
  />
);

export default Houses;
