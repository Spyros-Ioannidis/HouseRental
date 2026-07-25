import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineArrowsUpDown,
} from "react-icons/hi2";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import InputSearch from "@/Components/form/InputSearch";
import Pagination from "@/Components/Other/Pagination";
import { useTranslation } from "@/i18n";

export default function DashTable({
  data,
  columns,
  actions,
  title,
  fetchUrl,
  filters = {},
  showCreateButton = true,
  createLabel,
  onCreate,
  toolbarRight,
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState(
    filters.search || data.filters?.search || "",
  );

  const [sortConfig, setSortConfig] = useState({
    key: filters.sortKey || null,
    direction: filters.sortDirection || null,
  });

  useEffect(() => {
    setSearch(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    setSortConfig({
      key: filters.sortKey || null,
      direction: filters.sortDirection || null,
    });
  }, [filters.sortDirection, filters.sortKey]);

  const fetchData = (options = {}) => {
    const params = cleanParams({
      ...filters,
      search,
      sortKey: sortConfig.key,
      sortDirection: sortConfig.direction,
      ...options,
    });

    router.get(fetchUrl, params, { preserveState: true, replace: true });
  };

  const handleSearch = () => {
    fetchData({ page: 1 });
  };

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") direction = "desc";
      else if (sortConfig.direction === "desc") direction = null;
    }

    setSortConfig({ key: direction ? key : null, direction });

    fetchData({
      sortKey: direction ? key : null,
      sortDirection: direction,
      page: 1,
    });
  };

  const handlePageChange = (url) => {
    if (!url) return;

    router.get(url, {}, { preserveState: true, replace: true });
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex items-center gap-5">
        <h1 className="font-semibold text-2xl">{title}</h1>

        {showCreateButton && (
          <ButtonBasic
            variant="Blue"
            onClick={onCreate || (() => alert("TEMP NEW (Model)"))}
          >
            {createLabel || t("actions.add", { item: title.slice(0, -1) })}
          </ButtonBasic>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-sm items-center gap-2">
          <InputSearch
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder={t("tables.search_placeholder", { resource: title })}
          />

          <ButtonBasic variant="Blue" onClick={handleSearch}>
            {t("actions.search")}
          </ButtonBasic>
        </div>

        {toolbarRight ? (
          <div className="flex justify-start lg:justify-end">{toolbarRight}</div>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-color-card rounded-lg ">
        <table className="table-auto min-w-[760px] w-full text-left text-sm">
          <thead className="font-semibold text-color-primary text-xs uppercase">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-3 text-left ${col.width || ""}`}
                >
                  <div className="flex items-center gap-1">
                    {col.label}

                    {col.sortable !== false && (
                      <span
                        onClick={() => handleSort(col.key)}
                        className="ml-1 flex items-center cursor-pointer"
                      >
                        {{
                          asc: <HiOutlineArrowUp />,
                          desc: <HiOutlineArrowDown />,
                          null: <HiOutlineArrowsUpDown />,
                        }[
                          sortConfig.key === col.key
                            ? sortConfig.direction
                            : null
                        ]}
                      </span>
                    )}
                  </div>
                </th>
              ))}

              {actions && (
                <th className="w-40 px-3 py-3 text-right">
                  {t("tables.actions")}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-color-card">
            {data.data.length ? (
              data.data.map((row) => {
                const rowActions =
                  typeof actions === "function" ? actions(row) : actions;

                return (
                  <tr
                    key={row.id || row.key}
                    className="border-gray-100 border-t dark:border-gray-800"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-3 align-top ${col.width || ""}`}
                      >
                        <div className="break-words line-clamp-1 whitespace-normal">
                          {col.render ? col.render(row) : row[col.key]}
                        </div>
                      </td>
                    ))}

                    {actions && (
                      <td className="px-3 py-3 align-top">
                        <div className="flex justify-end gap-2">
                          {(rowActions ?? [])
                            .filter((action) => !action.hidden)
                            .map((action, i) => (
                              <ButtonBasic
                                key={i}
                                onClick={() => action.onClick(row)}
                                variant={action.variant}
                                disabled={action.disabled}
                              >
                                {action.label}
                              </ButtonBasic>
                            ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-10 font-medium text-center text-gray-500 text-sm"
                >
                  {t("empty.admin_table", { resource: title.toLowerCase() })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination links={data.links} onPageChange={handlePageChange} />
    </div>
  );
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== "" && value !== null && value !== undefined;
    }),
  );
}
