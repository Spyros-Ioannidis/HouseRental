import { Link, usePage } from "@inertiajs/react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { el, enUS } from "date-fns/locale";
import { FaBed, FaHeart, FaLayerGroup, FaRegHeart } from "react-icons/fa";
import { HiOutlinePaperClip, HiOutlineUser } from "react-icons/hi2";
import { route } from "@/ziggy";

import useFavoriteToggle from "@/Components/Card/useFavoriteToggle";
import { intlLocale, useTranslation } from "@/i18n";

const formatMoney = (value, fallback = "Price on request", locale = "en") => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return fallback;
  }

  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CardHouse({ props, onFavoriteChange, variant = "list" }) {
  const { props: pageProps } = usePage();
  const { t, locale } = useTranslation();
  const isGrid = variant === "grid";
  const authUser = pageProps.auth?.user;
  const canFavorite = !authUser || authUser.role === "user";
  const cityLabel = props.city_label || props.city;
  const location = [cityLabel, props.address].filter(Boolean).join(" - ");
  const thumbnailPath =
    props.thumbnail?.path || "/storage/DefaultProfilePicture.jpg";
  const bedroomLabel = t("house.bedrooms").toLowerCase();
  const dateLocale = locale === "el" ? el : enUS;
  const houseHref = route("houses.show", { locale, house: props.id });
  const { isFavorited, isProcessing, toggleFavorite } = useFavoriteToggle({
    authUser,
    canFavorite,
    houseId: props.id,
    initialFavorited: props.is_favorited,
    onChange: onFavoriteChange,
  });

  const handleFavoriteClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    toggleFavorite();
  };
  const articleClassName = isGrid
  ? "relative flex h-full flex-col overflow-hidden border border-color-card rounded-xl bg-color-card shadow-cst-xl shadow-cst-xl-hover duration-300 transition-all group"
    : "relative flex flex-row overflow-hidden border border-color-card rounded-xl bg-color-card shadow-cst-xl shadow-cst-xl-hover duration-300 transition-all group";
  const imageWrapperClassName = isGrid
    ? "h-56 shrink-0 overflow-hidden sm:h-64"
    : "h-70 w-70 shrink-0 overflow-hidden";
  const imageClassName = isGrid
    ? "h-full w-full object-cover duration-500 transition-all group-hover:scale-[1.03]"
    : "h-full w-full rounded-l-xl object-cover duration-500 transition-all group-hover:scale-[1.03]";

  return (
    <article className={articleClassName}>
      {canFavorite && (
        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={isProcessing}
          aria-busy={isProcessing}
          className="absolute left-3 top-3 z-[1] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-lg transition disabled:opacity-70 disabled:cursor-wait hover:bg-white hover:scale-105"
          aria-label={
            isFavorited ? t("house.remove_favorite") : t("house.add_favorite")
          }
          title={
            isFavorited ? t("house.remove_favorite") : t("house.add_favorite")
          }
        >
          {isFavorited ? (
            <FaHeart aria-hidden="true" />
          ) : (
            <FaRegHeart aria-hidden="true" />
          )}
        </button>
      )}

      <div
        className="absolute right-3 top-3 px-4 py-1 rounded-xl gradient font-semibold text-white shadow-lg"
      >
        {formatMoney(props.price, t("house.price_on_request"), locale)}/
        {t("house.month")}
      </div>

      <div className={imageWrapperClassName}>
        <img
          src={thumbnailPath}
          alt={props.title}
          className={imageClassName}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="space-y-2">
          <Link
            href={houseHref}
            className="font-bold text-lg"
          >
            {props.title}
          </Link>
          <p className="font-medium line-clamp-1 text-gray-700 dark:text-gray-300">
            {location}
          </p>
          <p className="line-clamp-2 text-color-secondary text-sm">
            {props.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-1 text-sm">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-color-card font-medium">
              <FaLayerGroup className="text-indigo-800" aria-hidden="true" />
              {t("house.floor")} {props.floor ?? "-"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-color-card font-medium">
              <FaBed className="text-indigo-800" aria-hidden="true" />
              {props.bedroom ?? "-"} {bedroomLabel}
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex flex-wrap items-center gap-1 text-sm">
            <span className="mt-0.5">
              <HiOutlineUser size={16} aria-hidden="true" />
            </span>
            <span className="mr-4">
              {props.user ? props.user.name : t("house.unknown_user")}
            </span>

            <span className="mt-0.5">
              <HiOutlinePaperClip size={16} aria-hidden="true" />
            </span>
            {formatDistanceToNowStrict(parseISO(props.created_at), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </span>
          <Link
            href={houseHref}
            aria-label={`${t("house.details")}: ${props.title}`}
            className="btn inline-flex w-full items-center justify-center gradient gradient-hover sm:w-auto"
          >
            {t("house.details")}
          </Link>
        </div>
      </div>
    </article>
  );
}
