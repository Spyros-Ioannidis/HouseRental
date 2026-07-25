import { Link } from "@inertiajs/react";
import { FiArrowRight } from "react-icons/fi";
import { route } from "@/ziggy";

import Layout from "@/Layout/Layout";
import { useTranslation } from "@/i18n";
import Breadcrumbs from "@/Components/Navigation/Breadcrumbs";

function Home() {
  const { t, locale } = useTranslation();

  return (
    <div className="bg-color-primary text-color-primary">
      <section
        aria-labelledby="home-title"
        className="mx-auto flex max-w-7xl min-h-[calc(100vh-12rem)] w-full items-start p-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl">
          <p className="mt-6 font-semibold text-indigo-700 text-sm uppercase dark:text-indigo-300">
            {t("pages.home.eyebrow")}
          </p>
        <h1
            id="home-title"
            className="mt-3 font-bold text-3xl tracking-tight sm:text-5xl"
          >
            {t("pages.home.title")}
          </h1>
          <p className="mt-5 max-w-2xl leading-8 text-color-secondary text-lg">
            {t("pages.home.body")}
          </p>
          <div className="mt-8">
            <Link
              href={route("houses.index", { locale })}
              className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-md bg-indigo-700 font-semibold text-sm text-white transition sm:w-fit dark:focus:ring-offset-gray-950 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              {t("pages.home.browse_houses")}
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

Home.layout = (page) => (
  <Layout
    children={page}
    titleKey="meta.home_title"
    descriptionKey="meta.home_description"
    canonical="/"
  />
);

export default Home;
