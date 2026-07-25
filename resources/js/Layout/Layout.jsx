import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";

import AppFooter from "@/Components/Layout/AppFooter";
import AppHeader from "@/Components/Layout/AppHeader";
import Breadcrumbs from "@/Components/Navigation/Breadcrumbs";
import { addToast, ToastProvider } from "@/Components/Other/Toast";
import { localizedPath, useTranslation } from "@/i18n";
import { syncZiggy } from "@/ziggy";

const APP_NAME = "HouseRental";
const DEFAULT_DESCRIPTION =
  "Find homes, compare listings, and contact trusted sellers through the real estate platform.";

const normalizePath = (path = "/") => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const cleanPath = path.split("?")[0] || "/";

  if (typeof window === "undefined") {
    return cleanPath;
  }

  return new URL(cleanPath, window.location.origin).toString();
};

const truncateDescription = (description) =>
  String(description || DEFAULT_DESCRIPTION)
    .trim()
    .slice(0, 155);

export default function Layout({
  children,
  title,
  titleKey,
  titleValues = {},
  description,
  descriptionKey,
  descriptionValues = {},
  canonical,
  fullHeight = false,
}) {
  const { props, url } = usePage();
  syncZiggy(props.ziggy);

  const { t, locale, locales } = useTranslation();
  const { flash = {} } = props;
  const appName = t("meta.app_name");
  const resolvedTitle = titleKey
    ? t(titleKey, titleValues)
    : title || appName || APP_NAME;
  const resolvedDescription = descriptionKey
    ? t(descriptionKey, descriptionValues)
    : description || t("meta.default_description") || DEFAULT_DESCRIPTION;
  const pageTitle =
    resolvedTitle === appName ? appName : `${resolvedTitle} | ${appName}`;
  const canonicalPath = localizedPath(canonical || url || "/", locale, locales);
  const canonicalUrl = normalizePath(canonicalPath);

  useEffect(() => {
    if (flash.message) {
      addToast(flash.message, flash.type ?? "success");
    }
  }, [flash.flash_id, flash.message, flash.type]);

  return (
    <div className="flex min-h-screen flex-col bg-color-primary text-color-primary">
      <Head title={pageTitle}>
        <meta
          head-key="description"
          name="description"
          content={truncateDescription(resolvedDescription)}
        />
        <link head-key="canonical" rel="canonical" href={canonicalUrl} />
      </Head>

      <AppHeader />

      <main
        aria-label={resolvedTitle}
        className={fullHeight ? "flex min-h-0 flex-1 flex-col" : "flex-1"}
      >
        <div className="mx-auto max-w-7xl w-full px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs />
        </div>
        {children}
      </main>

      <AppFooter />
      <ToastProvider />
    </div>
  );
}
