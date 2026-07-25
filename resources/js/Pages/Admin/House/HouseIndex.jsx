import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";
import DashTable from "@/Components/DashBoard/DashTable";
import ActiveFilterBar from "@/Components/Filters/ActiveFilterBar";
import SideFilters from "@/Components/Filters/SideFilters";
import DeleteConfirmationModal from "@/Components/ImageCarouselManager/DeleteConfirmationModal";
import { route } from "@/ziggy";
import { FaPlus } from "react-icons/fa6";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { useTranslation } from "@/i18n";


function HouseIndex() {
  const { t } = useTranslation();

  const {
    houses,
    filters = {},
    houseFilters = {},
    query = filters,
    canManageDeletedHouses = false,
  } = usePage().props;
  const filterQuery = query ?? filters;
  const [housePendingAction, setHousePendingAction] = useState(null);
  const deleteConfirmation = housePendingAction
    ? {
        title:
          housePendingAction.mode === "force"
            ? t("actions.permanently_delete")
            : t("actions.delete_house"),
        message:
          housePendingAction.mode === "force"
            ? t("flash.house_force_delete_confirm", { title: housePendingAction.house.title })
            : t("flash.house_delete_confirm", { title: housePendingAction.house.title }),
        confirmLabel:
          housePendingAction.mode === "force"
            ? t("actions.permanently_delete")
            : t("actions.delete_house"),
      }
    : null;

  const confirmHouseAction = () => {
    if (!housePendingAction) return;

    const routeName =
      housePendingAction.mode === "force"
        ? "admin.houses.force-destroy"
        : "admin.houses.destroy";

    router.delete(route(routeName, { house: housePendingAction.house.id }), {
      preserveScroll: true,
      onFinish: () => setHousePendingAction(null),
    });
  };

  const columns = [
    {
      key: "image",
      label: t("tables.image"),
      width: "w-12",
      sortable: false,
      render: (house) => (
        <img
          src={house.thumbnail?.path}

          className="h-10 w-fit"
        />
      ),
    },
    { key: "title", label: t("tables.title"), width: "w-40", sortable: true },
    { key: "status", label: t("tables.status"), width: "w-36", sortable: true, render: (house) => (
      <span className={`px-2.5 py-1 rounded-full font-semibold text-xs ${
        house.status === "active"
          ? "bg-emerald-50 text-emerald-700"
          : house.status === "deleted"
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700"
      }`}>
        {house.status_label || house.status}
      </span>
    ) },
    { key: "city", label: t("tables.city"), width: "w-32", sortable: true },
    { key: "user", label: t("tables.agent"), width: "w-40", sortable: false, render: (house) => house.user?.name || "-" },
    { key: "price", label: t("tables.price"), width: "w-32", sortable: true },
    { key: "floor", label: t("tables.floor"), width: "w-32", sortable: true },
  ];

  const actions = (house) => {
    const isDeleted = Boolean(house.deleted_at) || house.status === "deleted";

    if (isDeleted) {
      return [
        {
          label: t("actions.restore"),
          variant: "Blue",
          hidden: !canManageDeletedHouses,
          onClick: (row) =>
            router.patch(route("admin.houses.restore", { house: row.id }), {}, {
              preserveScroll: true,
            }),
        },
        {
          label: t("actions.delete_forever"),
          variant: "Red",
          hidden: !canManageDeletedHouses,
          onClick: (row) => setHousePendingAction({ house: row, mode: "force" }),
        },
      ];
    }

    return [
      {
        label: t("actions.edit"),
        variant: "Blue",
        onClick: (row) => router.get(route("admin.houses.edit", { house: row.id })),
      },
      {
        label: t("actions.delete"),
        variant: "Red",
        onClick: (row) => setHousePendingAction({ house: row, mode: "delete" }),
      },
    ];
  };



  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <SideFilters
          filters={houseFilters}
          query={filterQuery}
          action={route("admin.houses.index")}
          side="right"
          title={t("filters.title")}
        />
        <ButtonBasic
          type="button"
          variant="Blue"
          onClick={() => router.get(route("admin.houses.create"))}
        >
          <span className="flex items-center gap-2">
            <FaPlus />
            {t("actions.create_house")}
          </span>
        </ButtonBasic>
      </div>

      <div className="min-w-0 space-y-4">
        <ActiveFilterBar
          filters={houseFilters}
          query={filterQuery}
          action={route("admin.houses.index")}
        />

        <DashTable
          data={houses}
          title={t("tables.houses")}
          columns={columns}
          actions={actions}
          fetchUrl={route("admin.houses.index")}
          filters={filterQuery}
          showCreateButton={false}
        />
      </div>

      <DeleteConfirmationModal
        confirmation={deleteConfirmation}
        onCancel={() => setHousePendingAction(null)}
        onConfirm={confirmHouseAction}
      />
    </div>
  );
}
HouseIndex.layout = (page) => (
  <LayoutAdminDashboard
    children={page}
    titleKey="admin.houses"
  />
);

export default HouseIndex;
