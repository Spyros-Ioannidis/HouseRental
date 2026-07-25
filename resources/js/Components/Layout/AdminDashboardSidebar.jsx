import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import { route } from "@/ziggy";
import {
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiHome,
  FiMail,
  FiSettings,
  FiUsers,
} from "react-icons/fi";

import { useTranslation } from "@/i18n";

const SMALL_SIDEBAR_WIDTH = 1024;
const COLLAPSED_STORAGE_KEY = "admin-sidebar-collapsed";

function shouldStartCollapsed() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.innerWidth < SMALL_SIDEBAR_WIDTH ||
    window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true"
  );
}

function normalizePath(value = "/") {
  const fallbackBase =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;

  try {
    const url = new URL(value, fallbackBase);

    return url.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return value.split("?")[0].replace(/\/+$/, "") || "/";
  }
}

function isActiveRoute({ exact = false, name }, currentUrl) {
  const currentPath = normalizePath(currentUrl);
  const linkPath = normalizePath(route(name));
  const isExact = currentPath === linkPath;

  if (exact) {
    return isExact;
  }

  return isExact || currentPath.startsWith(`${linkPath}/`);
}

const sidebarLinks = [
  {
    name: "admin",
    labelKey: "nav.admin_home",
    roles: ["admin", "agent"],
    icon: FiGrid,
    exact: true,
  },
  {
    name: "admin.users",
    labelKey: "nav.users",
    roles: ["admin"],
    icon: FiUsers,
  },
  {
    name: "admin.houses.index",
    labelKey: "nav.houses",
    roles: ["admin", "agent"],
    icon: FiHome,
  },
  {
    name: "admin.contacts.index",
    labelKey: "nav.contacts",
    roles: ["admin", "agent"],
    icon: FiMail,
  },
  {
    name: "admin.settings.index",
    labelKey: "nav.settings",
    roles: ["admin"],
    icon: FiSettings,
  },
];

function SidebarLink({ collapsed, currentUrl, link, label }) {
  const active = isActiveRoute(link, currentUrl);
  const Icon = link.icon;

  return (
    <Link
      href={route(link.name)}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`mx-3 flex h-11 items-center rounded-md text-white transition ${
        collapsed ? "justify-center px-0" : "gap-3 px-4"
      } ${active ? "bg-blue-500 hover:bg-blue-600" : "hover:bg-blue-800"}`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
    </Link>
  );
}

export default function AdminDashboardSidebar() {
  const [collapsed, setCollapsed] = useState(shouldStartCollapsed);
  const { t } = useTranslation();
  const { props, url } = usePage();
  const role = props.auth?.user?.role;
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const ToggleIcon = collapsed ? FiChevronRight : FiChevronLeft;

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;

      if (typeof window !== "undefined") {
        window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      }

      return next;
    });
  }

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-blue-900 border-r bg-blue-950 transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div
        className={`flex h-16 items-center gap-3 ${
          collapsed ? "justify-end px-3" : "justify-between px-6"
        }`}
      >
        <span
          className={`min-w-0 truncate font-semibold text-white text-xl transition-opacity ${
            collapsed ? "sr-only" : ""
          }`}
        >
          Logo
        </span>
        <button
          type="button"
          onClick={toggleSidebar}
          title={toggleLabel}
          aria-label={toggleLabel}
          aria-expanded={!collapsed}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 hover:cursor-pointer"
        >
          <ToggleIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <nav className="space-y-1">
        {sidebarLinks
          .filter((link) => link.roles.includes(role))
          .map((link) => (
            <SidebarLink
              key={link.name}
              collapsed={collapsed}
              currentUrl={url}
              link={link}
              label={t(link.labelKey)}
            />
          ))}
      </nav>
    </aside>
  );
}
