import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { route } from "@/ziggy";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiMail,
  FiPhone,
  FiTrash2,
  FiUser,
} from "react-icons/fi";

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

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
};

function DetailRow({ label, value }) {
  return (
    <div className="grid gap-1 py-3 border-b border-gray-100 sm:grid-cols-[10rem_1fr] dark:border-gray-800 last:border-b-0">
      <dt className="font-semibold text-gray-500 text-sm">{label}</dt>
      <dd className="font-semibold text-gray-950 text-sm dark:text-gray-100">
        {value || "-"}
      </dd>
    </div>
  );
}

function StatusBadge({ readAt }) {
  const Icon = readAt ? FiCheckCircle : FiClock;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${
        readAt
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      {readAt ? "Read" : "Unread"}
    </span>
  );
}

function RelatedListing({ house, locale }) {
  if (!house) {
    return (
      <div className="p-5 border border-dashed border-gray-300 rounded-lg font-semibold text-gray-500 text-sm dark:border-gray-700">
        No listing attached
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
          <FiHome aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold text-gray-500 text-xs tracking-wide uppercase">
            Listing
          </p>
          <h2 className="mt-1 font-bold text-gray-950 text-lg dark:text-gray-100">
            {house.title}
          </h2>
          <p className="mt-1 text-gray-500 text-sm">
            {[house.city_label || house.city_record?.name || house.city, house.status, formatMoney(house.price)]
              .filter(Boolean)
              .join(" / ")}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={route("houses.show", { locale, house: house.id })}
          className="px-4 py-2 border border-gray-300 rounded-md bg-color-primary font-semibold text-gray-700 text-sm transition dark:border-gray-700 dark:text-gray-100 hover:bg-gray-50"
        >
          Public page
        </Link>
        <Link
          href={route("admin.houses.edit", { house: house.id })}
          className="px-4 py-2 rounded-md bg-blue-700 font-semibold text-sm text-white transition hover:bg-blue-600"
        >
          Edit listing
        </Link>
      </div>
    </div>
  );
}

function DashContact() {
  const { contact, auth } = usePage().props;
  const { t, locale } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const deleteConfirmation = deleteModalOpen
    ? {
        title: t("actions.delete"),
        message: t("flash.contact_delete_confirm", { subject: contact.subject }),
        confirmLabel: t("actions.delete"),
      }
    : null;

  const deleteContact = () => {
    router.delete(route("admin.contacts.destroy", { contact: contact.id }), {
      onFinish: () => setDeleteModalOpen(false),
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={route("admin.contacts.index")}
            className="inline-flex items-center gap-2 font-semibold text-blue-700 text-sm hover:text-blue-900"
          >
            <FiArrowLeft aria-hidden="true" />
            Back to contacts
          </Link>
          <h1 className="mt-3 font-bold text-3xl text-gray-950 dark:text-gray-100">
            {contact.subject}
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Sent {formatDate(contact.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge readAt={contact.read_at} />
          {auth?.is_admin ? (
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-700 font-semibold text-sm text-white transition hover:bg-red-600"
            >
              <FiTrash2 aria-hidden="true" />
              {t("actions.delete")}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <section className="p-6 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <FiMail aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-gray-500 text-sm tracking-wide uppercase">
                  Message
                </p>
                <h2 className="font-bold text-gray-950 text-xl dark:text-gray-100">
                  {contact.name}
                </h2>
              </div>
            </div>

            <p className="mt-6 leading-7 text-gray-700 whitespace-pre-line dark:text-gray-300">
              {contact.message}
            </p>
          </section>

          <RelatedListing house={contact.house} locale={locale} />
        </main>

        <aside className="space-y-6">
          <section className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100 text-gray-700">
                <FiUser aria-hidden="true" />
              </span>
              <h2 className="font-bold text-gray-950 text-lg dark:text-gray-100">
                Sender
              </h2>
            </div>
            <dl className="mt-4">
              <DetailRow label="Name" value={contact.name} />
              <DetailRow label="Email" value={contact.email} />
              <DetailRow label="Phone" value={contact.phone} />
              <DetailRow label="Account" value={contact.user?.name} />
            </dl>
          </section>

          <section className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                <FiUser aria-hidden="true" />
              </span>
              <h2 className="font-bold text-gray-950 text-lg dark:text-gray-100">
                Recipient
              </h2>
            </div>
            <dl className="mt-4">
              <DetailRow label="Source" value={contact.source} />
              <DetailRow label="Agent" value={contact.agent?.name} />
              <DetailRow label="Agent email" value={contact.agent?.email} />
              <DetailRow label="Agent phone" value={contact.agent?.contact_phone} />
              <DetailRow label="Received" value={formatDate(contact.created_at)} />
              <DetailRow label="Read" value={formatDate(contact.read_at)} />
            </dl>
          </section>

          <div className="grid gap-3">
            <a
              href={`mailto:${contact.email}?subject=${encodeURIComponent(`Re: ${contact.subject}`)}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-700 font-semibold text-sm text-white transition hover:bg-blue-600"
            >
              <FiMail aria-hidden="true" />
              Reply by email
            </a>
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-color-card font-semibold text-gray-700 text-sm transition dark:border-gray-700 dark:text-gray-100 hover:bg-gray-50"
              >
                <FiPhone aria-hidden="true" />
                Call sender
              </a>
            )}
          </div>
        </aside>
      </div>

      <DeleteConfirmationModal
        confirmation={deleteConfirmation}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={deleteContact}
      />
    </div>
  );
}

DashContact.layout = (page) => (
  <LayoutAdminDashboard
    children={page}
    titleKey="admin.contacts"
  />
);

export default DashContact;
