import { useMemo, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { route } from "@/ziggy";

import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";
import DashTable from "@/Components/DashBoard/DashTable";
import DeleteConfirmationModal from "@/Components/ImageCarouselManager/DeleteConfirmationModal";
import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import { useTranslation } from "@/i18n";

const roleBadgeClasses = {
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200",
  agent: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200",
  user: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
};

function RoleFilter({ filters, roles }) {
  const { t } = useTranslation();

  const changeRole = (event) => {
    router.get(
      route("admin.users"),
      cleanParams({
        ...filters,
        role: event.target.value,
        page: 1,
      }),
      { preserveState: true, replace: true },
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="font-semibold text-gray-700 text-sm dark:text-gray-200">
        Role
      </label>
      <select
        value={filters.role || ""}
        onChange={changeRole}
        className="inputField-primary inputField-style-primary min-w-40"
      >
        <option value="">All roles</option>
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
      {filters.role ? (
        <ButtonBasic
          type="button"
          variant="GrayOutline"
          onClick={() =>
            router.get(
              route("admin.users"),
              cleanParams({ ...filters, role: null, page: 1 }),
              { preserveState: true, replace: true },
            )
          }
        >
          {t("filters.clear")}
        </ButtonBasic>
      ) : null}
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "No";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
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

function UserIndex() {
  const { t } = useTranslation();
  const { users, filters = {}, roles = [], userRoutes = {} } = usePage().props;
  const [userPendingAction, setUserPendingAction] = useState(null);
  const roleOptions = roles.length ? roles : [
    { value: "user", label: "User" },
    { value: "agent", label: "Agent" },
    { value: "admin", label: "Admin" },
  ];
  const deleteConfirmation = userPendingAction
    ? {
        title: t("actions.delete_user"),
        message: t("flash.user_delete_confirm", {
          name: userPendingAction.user.name || userPendingAction.user.email,
        }),
        confirmLabel: t("actions.delete_user"),
      }
    : null;

  const confirmUserAction = () => {
    if (!userPendingAction?.user?.routes?.destroy) return;

    router.delete(userPendingAction.user.routes.destroy, {
      preserveScroll: true,
      onFinish: () => setUserPendingAction(null),
    });
  };

  const columns = useMemo(
    () => [
      {
        key: "profile",
        label: "Profile",
        width: "w-16",
        sortable: false,
        render: (user) => (
          <img
            src={user.profile_picture || "/storage/DefaultProfilePicture.jpg"}
            alt={user.name || "User profile"}
            className="h-10 w-10 rounded-full object-cover"
            onError={(event) => {
              event.currentTarget.src = "/storage/DefaultProfilePicture.jpg";
            }}
          />
        ),
      },
      {
        key: "name",
        label: t("tables.name"),
        width: "w-48",
        sortable: true,
        render: (user) => user.name || `${user.first_name} ${user.last_name}`,
      },
      { key: "email", label: t("tables.email"), width: "w-64", sortable: true },
      {
        key: "role",
        label: "Role",
        width: "w-28",
        sortable: true,
        render: (user) => (
          <span
            className={`inline-flex px-2 py-1 rounded-full font-semibold text-xs uppercase ${roleBadgeClasses[user.role] ?? roleBadgeClasses.user}`}
          >
            {user.role}
          </span>
        ),
      },
      {
        key: "email_verified_at",
        label: "Verified",
        width: "w-28",
        sortable: true,
        render: (user) => (user.email_verified_at ? "Yes" : "No"),
      },
      {
        key: "houses_count",
        label: t("tables.houses"),
        width: "w-24",
        sortable: true,
      },
      {
        key: "created_at",
        label: "Joined",
        width: "w-32",
        sortable: true,
        render: (user) => formatDate(user.created_at),
      },
    ],
    [t],
  );

  const actions = (user) => [
    {
      label: t("actions.edit"),
      variant: "Blue",
      disabled: !user.can_update,
      onClick: (row) => router.get(row.routes.edit),
    },
    {
      label: t("actions.delete"),
      variant: "Red",
      disabled: !user.can_delete,
      onClick: (row) => setUserPendingAction({ user: row }),
    },
  ];

  return (
    <>
      <DashTable
        data={users}
        title="Users"
        columns={columns}
        actions={actions}
        fetchUrl={route("admin.users")}
        filters={filters}
        createLabel="Add User"
        onCreate={() => router.get(userRoutes.create || route("admin.users.create"))}
        toolbarRight={<RoleFilter filters={filters} roles={roleOptions} />}
      />

      <DeleteConfirmationModal
        confirmation={deleteConfirmation}
        onCancel={() => setUserPendingAction(null)}
        onConfirm={confirmUserAction}
      />
    </>
  );
}

UserIndex.layout = (page) => (
  <LayoutAdminDashboard
    children={page}
    titleKey="admin.users"
  />
);

export default UserIndex;
