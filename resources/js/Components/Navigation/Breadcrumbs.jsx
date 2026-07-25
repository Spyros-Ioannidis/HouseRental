import { Link, usePage } from "@inertiajs/react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { route } from "@/ziggy";

import { useTranslation } from "@/i18n";

const dashboardLabels = {
  profile: "Profile",
  "profile-picture": "Profile picture",
  email: "Email",
  password: "Password",
  security: "Security",
  favorites: "Favorite houses",
};

const dashboardRoutes = {
  profile: "user.dashboard.profile",
  "profile-picture": "user.dashboard.profile-picture",
  email: "user.dashboard.email",
  password: "user.dashboard.password",
  security: "user.dashboard.security",
  favorites: "user.dashboard.favorites",
};

const safeRoute = (name, params, fallback) => {
  if (!name) {
    return fallback;
  }

  try {
    return route(name, params, false);
  } catch {
    return fallback;
  }
};

const humanizeSegment = (segment = "") =>
  segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function Breadcrumbs() {
  const { props, url } = usePage();
  const { t, locale, locales } = useTranslation();
  const supportedLocales = Object.keys(locales);
  const path = (url || "/").split("?")[0];
  const segments = path.split("/").filter(Boolean);
  const firstSegment = segments[0];
  const hasLocalePrefix = supportedLocales.includes(firstSegment);
  const activeLocale = hasLocalePrefix ? firstSegment : locale;
  const pageSegments = hasLocalePrefix ? segments.slice(1) : segments;

  if (pageSegments[0] === "admin") {
    return null;
  }

  const homeHref = safeRoute(
    "home",
    { locale: activeLocale },
    "#",
  );
  const crumbs = [{ label: t("nav.home"), href: homeHref }];
  const [section, id] = pageSegments;

  if (section === "houses") {
    crumbs.push({
      label: t("nav.houses"),
      href: safeRoute(
        "houses.index",
        { locale: activeLocale },
        path,
      ),
    });

    if (id) {
      crumbs.push({
        label: props.house?.title || "House",
        href: safeRoute(
          "houses.show",
          { locale: activeLocale, house: props.house?.id || id },
          path,
        ),
      });
    }
  } else if (section === "about") {
    crumbs.push({
      label: t("nav.about"),
      href: safeRoute("about", { locale: activeLocale }, path),
    });
  } else if (section === "contact") {
    crumbs.push({
      label: t("nav.contact"),
      href: safeRoute("contact", { locale: activeLocale }, path),
    });
  } else if (section === "seller") {
    crumbs.push({
      label: props.user?.name || "Seller",
      href: safeRoute(
        "seller.show",
        { locale: activeLocale, user: props.user?.id || id },
        path,
      ),
    });
  } else if (section === "test") {
    crumbs.push({
      label: t("nav.test"),
      href: safeRoute("test", { locale: activeLocale }, path),
    });
  } else if (section === "dashboard") {
    crumbs.push({
      label: t("nav.dashboard"),
      href: safeRoute("dashboard", undefined, route("dashboard", undefined, false)),
    });

    if (id) {
      crumbs.push({
        label: dashboardLabels[id] || humanizeSegment(id),
        href: safeRoute(
          dashboardRoutes[id],
          undefined,
          dashboardRoutes[id] ? route(dashboardRoutes[id], undefined, false) : path,
        ),
      });
    }
  } else if (section === "login") {
    crumbs.push({ label: "Login", href: safeRoute("login", undefined, path) });
  } else if (section === "register") {
    crumbs.push({ label: "Register", href: safeRoute("register", undefined, path) });
  } else if (section === "email") {
    crumbs.push({
      label: "Email verification",
      href: safeRoute("verification.notice", undefined, path),
    });
  } else if (pageSegments.length > 0) {
    crumbs.push({
      label: humanizeSegment(pageSegments[pageSegments.length - 1]),
      href: path,
    });
  }

  return (
    <nav aria-label={t("nav.breadcrumb")} className="flex min-w-0 items-center gap-[5px] text-sm">
      {crumbs.map((item, index) => {
        const isCurrent = index === crumbs.length - 1;

        return (
          <span key={`${item.label}-${item.href}`} className="flex min-w-0 items-center gap-[5px]">
            <Link
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`text-[0.9rem] text-color-primary truncate dark:text-[#abc2d3] hover:underline ${
                isCurrent ? "!text-indigo-700 dark:!text-indigo-300" : ""
              }`}
            >
              {item.label}
            </Link>
            {!isCurrent && (
              <MdKeyboardArrowDown
                className="shrink-0 text-[0.9rem] text-color-primary rotate-[-90deg] dark:text-[#abc2d3]"
                aria-hidden="true"
              />
            )}
          </span>
        );
      })}
    </nav>
  );
}
