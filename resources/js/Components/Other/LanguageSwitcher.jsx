

import { usePage } from "@inertiajs/react";

import { switchLocale, useTranslation } from "@/i18n";

const localeFlags = {
  en: "🇬🇧",
  el: "🇬🇷",
};

export default function LanguageSwitcher() {
  const { url } = usePage();
  const { t, locale, locales } = useTranslation();

  const localeCodes = Object.keys(locales);
  const currentIndex = localeCodes.indexOf(locale);
  const nextLocale = localeCodes[(currentIndex + 1) % localeCodes.length];

  const handleLanguageChange = () => {
    switchLocale({
      currentUrl: url,
      locale: nextLocale,
      locales,
    });
  };

  const buttonClasses =
    "cursor-pointer inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-color-primary transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-indigo-600";

  return (
    <button
      type="button"
      onClick={handleLanguageChange}
      aria-label={t("controls.language")}
      className={buttonClasses}
    >
      <span
        aria-hidden="true"
        className="flex h-5 w-5 items-center justify-center leading-none text-[20px]"
      >
        {localeFlags[nextLocale] ?? nextLocale}
      </span>
    </button>
  );
}
