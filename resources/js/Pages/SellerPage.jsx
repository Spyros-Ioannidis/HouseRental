import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { route } from "@/ziggy";

import Layout from "@/Layout/Layout";
import AgentContactForm from "@/Components/Contact/AgentContactForm";
import CardHouse from "@/Components/Card/CardHouse";
import HouseViewModeToggle from "@/Components/Filters/HouseViewModeToggle";
import ButtonInfo from "@/Components/form/Button/ButtonInfo";
import { intlLocale, useTranslation } from "@/i18n";

const compactViewQuery = "(max-width: 767px)";

const formatMoney = (value, locale = "en") => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price on request";
  }

  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const hasValue = (value) =>
  value !== null && value !== undefined && value !== "";

const cleanPaginationLabel = (label) =>
  String(label)
    .replace("&laquo;", "Previous")
    .replace("&raquo;", "Next");

function StatBox({ label, value }) {
  return (
    <div className="px-4 py-3 border border-indigo-100 rounded-lg bg-white shadow-sm">
      <p className="font-semibold text-gray-500 text-xs tracking-wide uppercase">
        {label}
      </p>
      <p className="mt-1 font-bold text-gray-950 text-xl">{value}</p>
    </div>
  );
}

function SellerContact({ user }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      <ButtonInfo
        endpoint={route("seller.contact", { user: user.id, type: "phone" })}
        InfoName="phone"
        Icon={FaPhoneAlt}
      />
      <ButtonInfo
        endpoint={route("seller.contact", { user: user.id, type: "email" })}
        InfoName="email"
        Icon={FaEnvelope}
      />
    </div>
  );
}

function PaginationLinks({ links = [] }) {
  if (links.length <= 3) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {links.map((link, index) => {
        const label = cleanPaginationLabel(link.label);
        const isDirectional = label.includes("Previous") || label.includes("Next");
        const ariaLabel = isDirectional ? label : `Page ${label}`;
        const classes = link.active
          ? "border-indigo-700 bg-indigo-700 text-white"
          : "border-color-card bg-color-card text-color-primary hover:border-indigo-300 hover:text-indigo-700";

        if (!link.url) {
          return (
            <span
              key={`${label}-${index}`}
              className="px-3 py-2 border border-color-card rounded-lg font-semibold text-color-secondary text-sm opacity-50"
              aria-label={ariaLabel}
              aria-disabled="true"
            >
              {label}
            </span>
          );
        }

        return (
          <Link
            key={`${label}-${index}`}
            href={link.url}
            className={`px-3 py-2 border rounded-lg font-semibold text-sm transition ${classes}`}
            aria-label={ariaLabel}
            aria-current={link.active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SellerPage({ user, houses = {}, stats = {} }) {
  const { t, locale } = useTranslation();
  const listings = houses.data ?? [];
  const [viewMode, setViewMode] = useState("list");
  const [isCompactView, setIsCompactView] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(compactViewQuery).matches,
  );
  const initials = (user.name ?? "A").charAt(0).toUpperCase();
  const hasPriceRange = hasValue(stats.min_price) && hasValue(stats.max_price);
  const priceRange = hasPriceRange
    ? `${formatMoney(stats.min_price, locale)} - ${formatMoney(stats.max_price, locale)}`
    : "Not available";
  const listingCount = t("pages.seller.listing_count", {
    count: listings.length,
  });
  const effectiveViewMode = isCompactView ? "grid" : viewMode;
  const listingLayoutClassName =
    effectiveViewMode === "grid"
      ? "grid items-start gap-6 md:grid-cols-2"
      : "grid gap-6";

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(compactViewQuery);
    const handleChange = () => setIsCompactView(mediaQuery.matches);

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);

      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);

    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return (
    <div className="min-h-full bg-color-primary text-color-primary">
      <section
        aria-labelledby="seller-title"
        className="border-color-card border-b bg-color-card"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href={route("houses.index", { locale })}
            className="font-semibold text-indigo-700 text-sm hover:text-indigo-900"
          >
            {t("house.back_to_houses")}
          </Link>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
            <div className="flex gap-5">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.name}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-indigo-50 font-bold text-3xl text-indigo-700">
                  {initials}
                </div>
              )}
              <div>
                <p className="font-semibold text-color-secondary text-sm tracking-wide uppercase">
                  {t("pages.seller.profile")}
                </p>
                <h1
                  id="seller-title"
                  className="mt-1 font-bold text-3xl text-color-primary tracking-tight sm:text-4xl"
                >
                  {user.name}
                </h1>
              </div>
            </div>

            <SellerContact user={user} />
          </div>

        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div>
            <h2
              id="seller-listings-title"
              className="font-bold text-2xl text-color-primary"
            >
              {t("pages.seller.houses_for_sale")}
            </h2>
            <p className="mt-1 text-color-secondary text-sm">{listingCount}</p>
          </div>

          <HouseViewModeToggle
            viewMode={viewMode}
            onChange={setViewMode}
          />
        </div>


        <section
          aria-labelledby="seller-listings-title"
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]"
        >
          <div>
            {listings.length > 0 ? (
              <div className={listingLayoutClassName}>
                {listings.map((house) => (
                  <CardHouse
                    key={house.id}
                    props={house}
                    variant={effectiveViewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="px-6 py-14 border border-color-card border-dashed rounded-lg bg-color-card text-center">
                <h2 className="font-semibold text-color-primary text-xl">
                  {t("empty.seller_title")}
                </h2>
                <p className="mt-2 text-color-secondary text-sm">
                  {t("empty.seller_body")}
                </p>
              </div>
            )}
          </div>
          <div>
            <AgentContactForm
              agent={user}
              title={t("pages.seller.message_title", { name: user.name })}
              body={t("pages.seller.message_body")}
            />
          </div>
        </section>


        <div className="mt-8">
          <PaginationLinks links={houses.links} />
        </div>
      </div>
    </div>
  );
}

SellerPage.layout = (page) => {
  const user = page.props.user;

  return (
    <Layout
      children={page}
      titleKey="meta.seller_title"
      titleValues={{ name: user?.name || "Seller" }}
      descriptionKey="meta.seller_description"
      descriptionValues={{ name: user?.name || "this seller" }}
      canonical={user?.id ? `/seller/${user.id}` : "/houses"}
    />
  );
};

export default SellerPage;
