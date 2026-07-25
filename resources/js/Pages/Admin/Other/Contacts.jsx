import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { route } from "@/ziggy";

import DashTable from "@/Components/DashBoard/DashTable";
import DeleteConfirmationModal from "@/Components/ImageCarouselManager/DeleteConfirmationModal";
import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";
import { useTranslation } from "@/i18n";

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const excerpt = (value) => {
  if (!value) {
    return "-";
  }

  return value.length > 140 ? `${value.slice(0, 137)}...` : value;
};

function DashContacts() {
  const { contacts, filters = {}, auth } = usePage().props;
  const { t } = useTranslation();
  const [contactPendingDelete, setContactPendingDelete] = useState(null);
  const deleteConfirmation = contactPendingDelete
    ? {
        title: t("actions.delete"),
        message: t("flash.contact_delete_confirm", {
          subject: contactPendingDelete.subject,
        }),
        confirmLabel: t("actions.delete"),
      }
    : null;

  const deleteContact = () => {
    if (!contactPendingDelete) return;

    router.delete(
      route("admin.contacts.destroy", { contact: contactPendingDelete.id }),
      {
        preserveScroll: true,
        onFinish: () => setContactPendingDelete(null),
      },
    );
  };

  const columns = [
    { key: "name", label: t("tables.name"), width: "w-40", sortable: true },
    { key: "email", label: t("tables.email"), width: "w-56", sortable: true },
    { key: "phone", label: t("tables.phone"), width: "w-36", sortable: true },
    {
      key: "source",
      label: t("tables.source"),
      width: "w-32",
      sortable: true,
      render: (contact) => contact.source || "general",
    },
    {
      key: "agent",
      label: t("tables.agent"),
      width: "w-40",
      sortable: false,
      render: (contact) => contact.agent?.name || "-",
    },
    {
      key: "house",
      label: t("tables.listing"),
      width: "w-52",
      sortable: false,
      render: (contact) => contact.house?.title || "-",
    },
    { key: "subject", label: t("tables.subject"), width: "w-56", sortable: true },
    {
      key: "message",
      label: t("tables.message"),
      width: "w-30",
      sortable: false,
      render: (contact) => (
        <span className="block max-w-30 break-words">
          {excerpt(contact.message)}
        </span>
      ),
    },
    {
      key: "created_at",
      label: t("tables.created_at"),
      width: "w-44",
      sortable: true,
      render: (contact) => formatDate(contact.created_at),
    },
    {
      key: "read_at",
      label: t("tables.status"),
      width: "w-28",
      sortable: true,
      render: (contact) => (
        <span
          className={`px-2.5 py-1 rounded-full font-semibold text-xs ${
            contact.read_at
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {contact.read_at ? "Read" : "Unread"}
        </span>
      ),
    },
  ];

  const actions = (contact) => [
    {
      label: t("actions.view"),
      variant: "Blue",
      onClick: () =>
        router.get(route("admin.contacts.show", { contact: contact.id })),
    },
    ...(auth?.is_admin
      ? [
          {
            label: t("actions.delete"),
            variant: "Red",
            onClick: () => setContactPendingDelete(contact),
          },
        ]
      : []),
  ];

  return (
    <>
      <DashTable
        data={contacts}
        title={t("tables.contacts")}
        columns={columns}
        actions={actions}
        fetchUrl="/admin/contacts"
        filters={filters}
        showCreateButton={false}
      />

      <DeleteConfirmationModal
        confirmation={deleteConfirmation}
        onCancel={() => setContactPendingDelete(null)}
        onConfirm={deleteContact}
      />
    </>
  );
}

DashContacts.layout = (page) => (
  <LayoutAdminDashboard
    children={page}
    titleKey="admin.contacts"
  />
);

export default DashContacts;
