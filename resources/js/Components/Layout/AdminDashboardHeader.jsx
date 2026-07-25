import { Link } from "@inertiajs/react";

import { CardProfile } from "@/Components/Card/CardProfile";
import LanguageSwitcher from "@/Components/Other/LanguageSwitcher";
import ThemeToggle from "@/Components/Other/ThemeToggle";
import { useTranslation } from "@/i18n";
import { route } from "@/ziggy";

export default function AdminDashboardHeader({ auth }) {
  const { t, locale } = useTranslation();

  return (
    <header className="flex h-16 items-center justify-between px-8 border-b border-gray-300 bg-color-primary dark:border-gray-800">
      <div className="flex items-center gap-3">
        <span className="font-bold text-gray-950 text-lg dark:text-gray-100">
          {t("admin.dashboard")}
        </span>

      </div>

      <div className="flex items-center gap-3">
        <Link
          href={route("home", { locale })}
          className="inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-color-primary transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          {t("nav.home")}
        </Link>
        <LanguageSwitcher />
        <ThemeToggle />
        <CardProfile auth={auth} />
      </div>
    </header>
  );
}
