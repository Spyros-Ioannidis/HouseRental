import { Link } from "@inertiajs/react";

import {
  dashboardSectionHref,
  dashboardSections,
} from "@/Pages/User/Dashboard/UserDashboardActions";
import { useTranslation } from "@/i18n";

export default function UserDashboardSidebar({ user, activeSection }) {
  const { t } = useTranslation();
  return (
    <aside className="p-3 border border-color-card rounded-2xl bg-color-card shadow-sm lg:sticky lg:top-20 lg:self-start">
      <nav className="space-y-1">
        {dashboardSections
          .filter((item) => !item.usersOnly || user?.role === "user")
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <Link
                key={item.id}
                href={dashboardSectionHref(item.id)}
                className={`flex w-full items-center justify-between px-4 py-3 rounded-xl font-semibold text-left transition-all ${
                  isActive
                    ? "bg-indigo-950 text-white"
                    : "text-color-primary hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
