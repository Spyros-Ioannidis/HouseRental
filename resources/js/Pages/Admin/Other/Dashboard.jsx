import { Link, usePage } from "@inertiajs/react";
import { route } from "@/ziggy";
import {
  FiActivity,
  FiArrowRight,
  FiClock,
  FiHeart,
  FiHome,
  FiMail,
  FiMapPin,
  FiTag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import LayoutAdminDashboard from "@/Layout/LayoutAdminDashboard";

const toneClasses = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  rose: "border-rose-100 bg-rose-50 text-rose-700",
  indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
};

const statusColors = {
  active: "bg-emerald-500",
  pending_review: "bg-amber-500",
  hidden: "bg-slate-500",
  reserved: "bg-cyan-500",
  rented: "bg-indigo-500",
  archived: "bg-violet-500",
  deleted: "bg-rose-500",
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(Number(value || 0));

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

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const humanize = (value = "") =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

function StatCard({ icon: Icon, label, value, detail, tone = "blue" }) {
  return (
    <article className="p-5 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-500 text-sm">{label}</p>
          <p className="mt-2 font-bold text-3xl text-gray-950 dark:text-gray-100">
            {value}
          </p>
          {detail && <p className="mt-2 text-gray-500 text-sm">{detail}</p>}
        </div>
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center border rounded-lg ${toneClasses[tone]}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="font-bold text-gray-950 text-xl dark:text-gray-100">
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-gray-500 text-sm">{subtitle}</p>}
    </div>
  );
}

function StatusOverview({ statuses = [] }) {
  const max = Math.max(...statuses.map((item) => item.total), 1);

  return (
    <section className="p-6 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
      <SectionTitle title="Listing status" subtitle="Current inventory by workflow state" />

      <div className="mt-6 space-y-4">
        {statuses.map((item) => (
          <div key={item.status} className="grid gap-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {humanize(item.status)}
              </span>
              <span className="font-bold text-gray-950 dark:text-gray-100">
                {formatNumber(item.total)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full rounded-full ${statusColors[item.status] || "bg-blue-500"}`}
                style={{ width: `${Math.max((item.total / max) * 100, item.total ? 8 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CityStats({ cities = [] }) {
  const max = Math.max(...cities.map((city) => city.total), 1);

  return (
    <section className="p-6 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
      <SectionTitle title="Top cities" subtitle="Active listings by location" />

      <div className="mt-6 space-y-4">
        {cities.length > 0 ? (
          cities.map((city) => (
            <div key={city.city} className="grid gap-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="inline-flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-200">
                  <FiMapPin className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                  {city.city}
                </span>
                <span className="font-bold text-gray-950 dark:text-gray-100">
                  {formatNumber(city.total)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-cyan-500"
                  style={{ width: `${Math.max((city.total / max) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="font-semibold text-gray-500 text-sm">No city data yet.</p>
        )}
      </div>
    </section>
  );
}

function RecentContacts({ contacts = [] }) {
  return (
    <section className="p-6 border border-color-card rounded-lg bg-color-card shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle title="Recent contacts" subtitle="Latest messages across the inbox" />
        <Link
          href={route("admin.contacts.index")}
          className="inline-flex items-center gap-2 font-semibold text-blue-700 text-sm hover:text-blue-900"
        >
          All
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 divide-gray-100 divide-y dark:divide-gray-800">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <Link
              key={contact.id}
              href={route("admin.contacts.show", { contact: contact.id })}
              className="flex items-start justify-between gap-4 py-4 transition hover:text-blue-700"
            >
              <span className="min-w-0">
                <span className="block font-bold text-gray-950 text-sm truncate dark:text-gray-100">
                  {contact.subject}
                </span>
                <span className="mt-1 block text-gray-500 text-sm">
                  {contact.name} / {contact.agent?.name || "Team inbox"}
                </span>
              </span>
              <span className="shrink-0 font-semibold text-gray-400 text-right text-xs">
                {contact.read_at ? "Read" : "Unread"}
              </span>
            </Link>
          ))
        ) : (
          <p className="py-6 font-semibold text-gray-500 text-sm">
            No contacts yet.
          </p>
        )}
      </div>
    </section>
  );
}

function RecentHouses({ houses = [] }) {
  return (
    <section className="p-6 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle title="Recent listings" subtitle="Newest listing activity" />
        <Link
          href={route("admin.houses.index")}
          className="inline-flex items-center gap-2 font-semibold text-blue-700 text-sm hover:text-blue-900"
        >
          All
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-5 divide-gray-100 divide-y dark:divide-gray-800">
        {houses.length > 0 ? (
          houses.map((house) => (
            <Link
              key={house.id}
              href={route("admin.houses.edit", { house: house.id })}
              className="grid gap-1 py-4 transition hover:text-blue-700"
            >
              <span className="flex items-center justify-between gap-4">
                <span className="font-bold text-gray-950 text-sm truncate dark:text-gray-100">
                  {house.title}
                </span>
                <span className="shrink-0 font-semibold text-gray-500 text-sm">
                  {formatMoney(house.price)}
                </span>
              </span>
              <span className="text-gray-500 text-sm">
                {[house.city_label || house.city, humanize(house.status), house.user?.name]
                  .filter(Boolean)
                  .join(" / ")}
              </span>
            </Link>
          ))
        ) : (
          <p className="py-6 font-semibold text-gray-500 text-sm">
            No listings yet.
          </p>
        )}
      </div>
    </section>
  );
}

function TopAgents({ agents = [] }) {
  return (
    <section className="p-6 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
      <SectionTitle title="Agent activity" subtitle="Listing count by agent" />

      <div className="mt-5 divide-gray-100 divide-y dark:divide-gray-800">
        {agents.length > 0 ? (
          agents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <span className="min-w-0">
                <span className="block font-bold text-gray-950 text-sm truncate dark:text-gray-100">
                  {agent.name}
                </span>
                <span className="mt-1 block text-gray-500 text-sm truncate">
                  {agent.email}
                </span>
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 font-bold text-indigo-700 text-sm">
                {formatNumber(agent.houses_count)}
              </span>
            </div>
          ))
        ) : (
          <p className="py-6 font-semibold text-gray-500 text-sm">
            No agent data yet.
          </p>
        )}
      </div>
    </section>
  );
}

function Dashboard() {
  const { stats = {} } = usePage().props;
  const scopeLabel = stats.scope === "agent" ? "Your portfolio" : "Platform overview";
  const summaryCards = [
    stats.isAdmin && {
      icon: FiUsers,
      label: "Users",
      value: formatNumber(stats.totalUsers),
      detail: `${formatNumber(stats.totalAgents)} agents / ${formatNumber(stats.totalCustomers)} customers`,
      tone: "blue",
    },
    {
      icon: FiHome,
      label: "Listings",
      value: formatNumber(stats.totalHouses),
      detail: `${formatNumber(stats.activeHouses)} active`,
      tone: "emerald",
    },
    {
      icon: FiMail,
      label: "Contacts",
      value: formatNumber(stats.totalContacts),
      detail: `${formatNumber(stats.unreadContacts)} unread`,
      tone: "amber",
    },
    {
      icon: FiHeart,
      label: "Favorites",
      value: formatNumber(stats.favoriteCount),
      // detail: "Saved listing signals",
      tone: "rose",
    },
    {
      icon: FiTrendingUp,
      label: "Average active price",
      value: formatMoney(stats.averagePrice),
      detail: `${formatMoney(stats.minimumPrice)} to ${formatMoney(stats.maximumPrice)}`,
      tone: "indigo",
    },
    {
      icon: FiActivity,
      label: "Inventory value",
      value: formatMoney(stats.totalInventoryValue),
      detail: "Active listings",
      tone: "cyan",
    },

  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="p-6 border border-gray-200 rounded-lg bg-color-card shadow-sm dark:border-gray-800">
        <p className="font-semibold text-blue-700 text-sm tracking-wide uppercase">
          {scopeLabel}
        </p>
        <div className="mt-3 flex gap-4 flex-col lg:items-end lg:justify-between lg:flex-row">
          <div>
            <h1 className="font-bold text-3xl text-gray-950 dark:text-gray-100">
              Admin statistics
            </h1>
            <p className="mt-2 max-w-2xl text-gray-500 text-sm">
              Listings, contacts, users, catalog data, and market signals in one place.
            </p>
          </div>
          <Link
            href={route("admin.contacts.index")}
            className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-md bg-blue-700 font-semibold text-sm text-white transition hover:bg-blue-600"
          >
            Review contacts
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <StatusOverview statuses={stats.houseStatus} />
        <CityStats cities={stats.cityStats} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RecentContacts contacts={stats.recentContacts} />
        <RecentHouses houses={stats.recentHouses} />
      </div>

      <TopAgents agents={stats.topAgents} />
    </div>
  );
}

Dashboard.layout = (page) => (
  <LayoutAdminDashboard
    children={page}
    titleKey="admin.dashboard"
  />
);

export default Dashboard;
