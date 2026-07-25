import { Link } from "@inertiajs/react";
import { FiArrowRight, FiHome, FiSearch, FiShield, FiUsers } from "react-icons/fi";
import { route } from "@/ziggy";

import Layout from "@/Layout/Layout";
import { useTranslation } from "@/i18n";

const values = [
  {
    titleKey: "about.clear_listings_title",
    descriptionKey: "about.clear_listings_body",
    icon: FiHome,
  },
  {
    titleKey: "about.useful_search_title",
    descriptionKey: "about.useful_search_body",
    icon: FiSearch,
  },
  {
    titleKey: "about.seller_visibility_title",
    descriptionKey: "about.seller_visibility_body",
    icon: FiUsers,
  },
  {
    titleKey: "about.managed_access_title",
    descriptionKey: "about.managed_access_body",
    icon: FiShield,
  },
];

function About() {
  const { t, locale } = useTranslation();

  return (
    <div className="bg-color-primary text-color-primary">
      <section aria-labelledby="about-title" className="border-color-card border-b bg-color-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
          <div>
            <p className="font-semibold text-indigo-700 text-sm tracking-wide uppercase">
              {t("about.eyebrow")}
            </p>
            <h1 id="about-title" className="mt-3 max-w-3xl font-bold text-4xl text-color-primary tracking-tight sm:text-5xl">
              {t("about.title")}
            </h1>
            <p className="mt-5 max-w-2xl leading-8 text-color-secondary text-lg">
              {t("about.body")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={route("houses.index", { locale })}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-950 font-semibold text-sm text-white transition hover:bg-indigo-900"
              >
                {t("about.browse_homes")}
                <FiArrowRight aria-hidden="true" />
              </Link>
              <Link
                href={route("contact", { locale })}
                className="inline-flex items-center gap-2 px-5 py-3 border border-color-card rounded-xl bg-color-primary font-semibold text-color-primary text-sm transition hover:border-indigo-500 hover:text-indigo-700"
              >
                {t("about.contact_us")}
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section aria-labelledby="about-values-title" className="mx-auto max-w-7xl px-6 py-14">
        <h2 id="about-values-title" className="sr-only">
          {t("about.values_title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.titleKey}
                className="p-5 border border-color-card rounded-lg bg-color-card shadow-sm"
              >
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                  <Icon aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-semibold text-color-primary text-lg">
                  {t(item.titleKey)}
                </h2>
                <p className="mt-2 leading-6 text-color-secondary text-sm">
                  {t(item.descriptionKey)}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

About.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.about_title"
    descriptionKey="meta.about_description"
    canonical="/about"
  />
);

export default About;
