import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

import { useTranslation } from "@/i18n";

const THEME_KEY = "theme";

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
}

export default function ThemeToggle() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState(getStoredTheme);
  const isDark = theme === "dark";
  const nextLabel = isDark ? t("controls.light") : t("controls.dark");

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const buttonClasses =
    "cursor-pointer inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-color-primary transition-colors dark:text-gray-100 dark:hover:text-indigo-400 hover:bg-black/5 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`${t("controls.theme")}: ${nextLabel}`}
      aria-pressed={isDark}
      title={`${t("controls.theme")}: ${nextLabel}`}
      className={buttonClasses}
    >
      {isDark ? (
        <FiSun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <FiMoon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
