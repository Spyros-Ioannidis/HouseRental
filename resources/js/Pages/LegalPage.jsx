import { useTranslation } from "@/i18n";
import Layout from "@/Layout/Layout";

const legalPages = {
  privacy: {
    canonical: "/privacy-policy",
    sections: [["information", 4], ["use", 3], ["sharing", 3], ["retention", 3], ["contact", 1]],
  },
  terms: {
    canonical: "/terms-of-use",
    sections: [["acceptable_use", 3], ["accounts", 3], ["listings", 3], ["review", 2], ["liability", 3]],
  },
  cookies: {
    canonical: "/cookie-policy",
    sections: [["essential", 2], ["remember_me", 2], ["analytics", 2], ["managing", 2]],
  },
  accessibility: {
    canonical: "/accessibility-statement",
    sections: [["commitment", 2], ["support", 2], ["limits", 2], ["feedback", 2]],
  },
};

function resolveLegalPage(pageKey) {
  return legalPages[pageKey] ?? legalPages.privacy;
}

function sectionId(pageKey, sectionKey) {
  return `${pageKey}-${sectionKey}`;
}

function LegalPage({ pageKey = "privacy" }) {
  const { t } = useTranslation();
  const resolvedPageKey = pageKey in legalPages ? pageKey : "privacy";
  const page = resolveLegalPage(resolvedPageKey);
  const translationKey = `legal.${resolvedPageKey}`;

  return (
    <div className="bg-color-primary text-color-primary">
      <section
        aria-labelledby="legal-page-title"
        className="border-b border-color-card bg-color-card"
      >
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="font-semibold text-indigo-700 text-sm tracking-wide uppercase">
            {t("legal.label")}
          </p>
          <h1
            id="legal-page-title"
            className="mt-3 font-bold text-4xl tracking-tight sm:text-5xl"
          >
            {t(`${translationKey}.title`)}
          </h1>
          <p className="mt-5 max-w-3xl leading-8 text-color-secondary text-lg">
            {t(`${translationKey}.intro`)}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="rounded-lg border border-color-card bg-color-card p-6 shadow-sm sm:p-8">
          <p className="text-color-secondary text-sm">
            {t("legal.last_updated", { date: t("legal.updated_at") })}
          </p>

          <div className="mt-8 space-y-8">
            {page.sections.map(([sectionKey, itemCount]) => {
              const headingId = sectionId(resolvedPageKey, sectionKey);
              const sectionKeyPrefix = `${translationKey}.sections.${sectionKey}`;
              const items = Array.from({ length: itemCount }, (_, index) =>
                t(`${sectionKeyPrefix}.items.${index}`),
              );

              return (
                <section key={sectionKey} aria-labelledby={headingId}>
                  <h2
                    id={headingId}
                    className="font-semibold text-2xl tracking-tight"
                  >
                    {t(`${sectionKeyPrefix}.title`)}
                  </h2>
                  <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-color-secondary">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}

LegalPage.layout = (page) => {
  const pageKey = page.props.pageKey in legalPages ? page.props.pageKey : "privacy";

  return (
    <Layout
      children={page}
      titleKey={`legal.${pageKey}.title`}
      descriptionKey={`legal.${pageKey}.description`}
      canonical={legalPages[pageKey].canonical}
    />
  );
};

export default LegalPage;
