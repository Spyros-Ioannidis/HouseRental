import { Link, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { route } from "@/ziggy";

import { CardProfile } from "@/Components/Card/CardProfile";
import Sidebar from "@/Components/Other/Sidebar";
import LanguageSwitcher from "@/Components/Other/LanguageSwitcher";
import ThemeToggle from "@/Components/Other/ThemeToggle";
import { useTranslation } from "@/i18n";

export default function AppHeader() {
  const { props } = usePage();
  const { auth } = props;
  const { t, locale } = useTranslation();

  const [isMenuMode, setIsMenuMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const headerRef = useRef(null);
  const brandRef = useRef(null);
  const desktopContentMeasureRef = useRef(null);
  const headerProfileMeasureRef = useRef(null);

  const classesLink =
    "px-2 py-1 rounded-md font-bold text-color-primary text-sm transition-colors hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600";

  const navLinks = [

    {
      href: route("houses.index", { locale }),
      label: t("nav.houses"),
    },
    {
      href: route("about", { locale }),
      label: t("nav.about"),
    },
    {
      href: route("contact", { locale }),
      label: t("nav.contact"),
    },
  ];

  if (["admin", "agent"].includes(props.auth?.user?.role)) {
    navLinks.push({
      href: route("admin"),
      label: t("nav.dashboard"),
    });
  }

  useEffect(() => {
    const header = headerRef.current;
    const brand = brandRef.current;
    const desktopContentMeasure = desktopContentMeasureRef.current;
    const headerProfileMeasure = headerProfileMeasureRef.current;

    if (!header || !brand || !desktopContentMeasure || !headerProfileMeasure) {
      return;
    }

    const checkLayout = () => {
      const headerWidth = header.getBoundingClientRect().width;
      const brandWidth = brand.getBoundingClientRect().width;
      const desktopContentWidth =
        desktopContentMeasure.getBoundingClientRect().width;
      const headerProfileWidth =
        headerProfileMeasure.getBoundingClientRect().width;

      const headerStyles = window.getComputedStyle(header);
      const headerGap = parseFloat(headerStyles.columnGap || "0") || 0;

      const tolerance = 2;

      const desktopAvailableWidth = headerWidth - brandWidth - headerGap;
      const sidebarButtonWidth = 40;
      const sidebarButtonGap = 12;
      const sidebarModeHeaderWidth =
        sidebarButtonWidth + sidebarButtonGap + headerProfileWidth;

      const shouldUseSidebar =
        desktopContentWidth > desktopAvailableWidth + tolerance ||
        brandWidth + sidebarModeHeaderWidth + headerGap > headerWidth;

      setIsMenuMode(shouldUseSidebar);
    };

    checkLayout();

    const resizeObserver = new ResizeObserver(checkLayout);

    resizeObserver.observe(header);
    resizeObserver.observe(brand);
    resizeObserver.observe(desktopContentMeasure);
    resizeObserver.observe(headerProfileMeasure);

    window.addEventListener("resize", checkLayout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkLayout);
    };
  }, [navLinks.length, locale]);

  useEffect(() => {
    if (!isMenuMode) {
      setIsMenuOpen(false);
    }
  }, [isMenuMode]);

  return (
    <header className="sticky top-0 z-10 border-b border-color-primary bg-color-primary">
      <div
        ref={headerRef}
        className="relative mx-auto flex h-16 max-w-7xl w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link
          ref={brandRef}
          href={route("home", { locale })}
          className="shrink-0 font-extrabold text-color-primary text-lg tracking-tight focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          HouseRental
        </Link>

        <div className="flex min-w-0 shrink-0 items-center gap-3">
          {!isMenuMode && (
            <>
              <nav
                aria-label={t("nav.primary_navigation")}
                className="flex min-w-0 items-center gap-2 sm:gap-4"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    className={classesLink}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <LanguageSwitcher />
              <ThemeToggle />
            </>
          )}

          {isMenuMode && (
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-color-primary transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <FiMenu className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          <CardProfile auth={auth} />
        </div>

        <div
          ref={desktopContentMeasureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 flex w-max items-center gap-3 whitespace-nowrap"
        >
          <nav className="flex items-center gap-2 sm:gap-4">
            {navLinks.map((link) => (
              <span key={link.href} className={classesLink}>
                {link.label}
              </span>
            ))}
          </nav>

          <LanguageSwitcher />
          <ThemeToggle />
          <CardProfile auth={auth} />
        </div>

        <div
          ref={headerProfileMeasureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 w-max"
        >
          <CardProfile auth={auth} />
        </div>
      </div>

      <Sidebar
        open={isMenuMode && isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        side="left"
        title={t("nav.primary_navigation")}
        ariaLabel={t("nav.primary_navigation")}
      >
        <div className="flex flex-col gap-5">


          <nav aria-label={t("nav.primary_navigation")}>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className={`block px-3 py-2 ${classesLink}`}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="border-color-card border-t" />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

        </div>
      </Sidebar>
    </header>
  );
}
