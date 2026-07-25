import { Link, usePage } from "@inertiajs/react";
import {
  FaBath,
  FaBed,
  FaCalendarAlt,
  FaDoorOpen,
  FaEnvelope,
  FaHeart,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegHeart,
  FaRegCompass,
  FaRulerCombined,
  FaUserTie,
} from "react-icons/fa";
import { route } from "@/ziggy";

import Layout from "@/Layout/Layout";
import AgentContactForm from "@/Components/Contact/AgentContactForm";
import useFavoriteToggle from "@/Components/Card/useFavoriteToggle";
import ButtonInfo from "@/Components/form/Button/ButtonInfo";
import OpenStreetMapViewer from "@/Components/Map/OpenStreetMapViewer";
import { addressText } from "@/Components/Map/mapUtils";
import { intlLocale, useTranslation } from "@/i18n";
import ImageCarousel from "@/Components/ImageCarousel/ImageCarousel";
import HouseComments from "@/Components/HouseComments";

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

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-color-primary rounded-lg bg-color-primary shadow-sm">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
        <Icon aria-hidden="true" />
      </span>
      <span>
        <span className="block font-semibold text-gray-500 text-xs tracking-wide uppercase">
          {label}
        </span>
        <span className="font-semibold text-colot-primary text-s">
          {value}
        </span>
      </span>
    </div>
  );
}

function SellerCard({ house }) {
  const { t, locale } = useTranslation();
  const seller = house.user;
  const sellerId = seller?.id ?? house.user_id;

  return (
    <aside
      aria-labelledby="seller-card-title"
      className="p-5 border border-color-card rounded-lg bg-color-card shadow-sm"
    >
      <div className="flex items-center gap-4">
        {seller?.profile_picture ? (
          <img
            src={seller.profile_picture}
            alt={seller?.name ?? t("house.unknown_agent")}
            className="h-14 w-14 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-indigo-50 font-bold text-indigo-700 text-xl">
            {/* {sellerInitial} */}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-500 text-xs tracking-wide uppercase">
            {t("house.listed_by")}
          </p>
          <h2
            id="seller-card-title"
            className="font-semibold text-color-primary text-lg"
          >
            {seller?.name ?? t("house.unknown_agent")}
          </h2>
          <Link
            href={route("seller.show", { locale, user: house.user_id })}
            className="font-semibold text-indigo-700 text-sm hover:text-indigo-900"
          >
            {t("house.view_seller_listings")}
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <ButtonInfo
          endpoint={route("seller.contact", { user: sellerId, type: "phone" })}
          InfoName="phone"
          Icon={FaPhoneAlt}
        />
        <ButtonInfo
          endpoint={route("seller.contact", { user: sellerId, type: "email" })}
          InfoName="email"
          Icon={FaEnvelope}
        />
      </div>
    </aside>
  );
}

function House({ house }) {
  const { props } = usePage();
  const { t, locale } = useTranslation();
  const authUser = props.auth?.user;
  const canFavorite = !authUser || authUser.role === "user";
  const features = house.features ?? [];
  const cityLabel = house.city_label || house.city;
  const address = addressText({ ...house, city: cityLabel });
  const { isFavorited, isProcessing, toggleFavorite } = useFavoriteToggle({
    authUser,
    canFavorite,
    houseId: house.id,
    initialFavorited: house.is_favorited,
  });
  const favoriteLabel = isFavorited
    ? t("house.remove_favorite")
    : t("house.add_favorite");

  return (
    <div className="min-h-full overflow-x-hidden bg-color-primary">
      <div className="mx-auto grid min-w-0 max-w-4xl gap-8 px-4 py-8 sm:px-6 lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
        <div className="min-w-0 space-y-6" aria-labelledby="house-title">
          <section
            aria-label={`${house.title} photos`}
            className="overflow-hidden border border-color-primary rounded-lg bg-color-card shadow-sm "
          >
            <ImageCarousel images={house.images} />
          </section>

          <section className="p-6 border border-color-card rounded-lg bg-color-card shadow-sm ">
            <div className="flex flex-col gap-4 pb-6 border-b border-color-primary md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <h1
                    id="house-title"
                    className="font-bold text-2xl text--color-primary tracking-tight sm:text-3xl "
                  >
                    {house.title}
                  </h1>
                  {canFavorite && (
                    <button
                      type="button"
                      onClick={toggleFavorite}
                      disabled={isProcessing}
                      aria-busy={isProcessing}
                      aria-label={favoriteLabel}
                      className="inline-flex w-fit items-center gap-2 px-4 py-2 border border-rose-200 rounded-full bg-rose-50 font-semibold text-rose-700 text-sm transition disabled:opacity-70 disabled:cursor-wait hover:border-rose-300 hover:bg-rose-100"
                    >
                      {isFavorited ? (
                        <FaHeart aria-hidden="true" />
                      ) : (
                        <FaRegHeart aria-hidden="true" />
                      )}
                      {isFavorited ? t("house.favorited") : t("house.favorite")}
                    </button>
                  )}
                </div>
                {address && (
                  <p className="mt-2 flex items-center gap-2 font-medium text-gray-600 text-sm dark:text-gray-300">
                    <FaMapMarkerAlt
                      className="text-indigo-700"
                      aria-hidden="true"
                    />
                    {address}
                  </p>
                )}
              </div>

              <div className="w-full px-5 py-3 rounded-lg bg-indigo-950 text-white shadow-sm sm:w-auto">
                <p className="font-semibold text-indigo-200 text-xs tracking-wide uppercase">
                  {t("house.monthly_rent")}
                </p>
                <p className="font-bold text-2xl">
                  {formatMoney(house.price, t("house.price_on_request"), locale)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatPill
                icon={FaRulerCombined}
                label={t("house.area")}
                value={`${house.area ?? "-"} m2`}
              />
              <StatPill
                icon={FaBed}
                label={t("house.bedrooms")}
                value={house.bedroom ?? "-"}
              />
              <StatPill
                icon={FaBath}
                label={t("house.bathrooms")}
                value={house.bathroom ?? "-"}
              />
              <StatPill
                icon={FaLayerGroup}
                label={t("house.floor")}
                value={house.floor ?? "-"}
              />
            </div>

            <div className="mt-8">
              <div>
                <h2 className="font-semibold text--color-primary text-xl">
                  {t("house.description")}
                </h2>
                <p className="mt-3 leading-7 text-gray-700 whitespace-pre-line dark:text-gray-300">
                  {house.description}
                </p>
                <div>
                  <br />
                  <p>
                    {t("house.built")}-
                    {house.year_built ?? ": "}
                  </p>
                  <p>
                    {t("house.living_rooms")}-
                    {house.living_room ?? ": "}
                  </p>
                  <p>
                    {t("house.city")}-
                    {cityLabel ?? ": "}
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-8">
              <h2 className="font-semibold text--color-primary text-xl">
                {t("house.features")}
              </h2>
              {features.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {features.map((feature) => (
                    <span
                      key={feature.id}
                      className="px-3 py-1.5 rounded-full bg-indigo-50 font-semibold text-indigo-800 text-sm"
                    >
                      {feature.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-gray-500 text-sm">
                  {t("house.no_features")}
                </p>
              )}
            </div>
          </section>

          <OpenStreetMapViewer
            title={house.title}
            address={house.address}
            city={cityLabel}
            latitude={house.latitude}
            longitude={house.longitude}
          />

          <HouseComments house={house} />
        </div>

        <div
          className="min-w-0 space-y-6"
          aria-label={t("house.contact_listing_title")}
        >
          <SellerCard house={house} />

          <AgentContactForm
            agent={house.user}
            house={house}
            title={t("house.contact_listing_title")}
            body={t("house.contact_listing_body")}
          />
        </div>
      </div>
    </div>
  );
}

House.layout = (page) => {
  const house = page.props.house;
  const cityLabel = house?.city_label || house?.city;
  const city = cityLabel ? ` in ${cityLabel}` : "";

  return (
    <Layout
      children={page}
      title={house?.title || "House"}
      descriptionKey="meta.house_description"
      descriptionValues={{ title: house?.title || "this home", city }}
      canonical={house?.id ? `/houses/${house.id}` : "/houses"}
    />
  );
};

export default House;
