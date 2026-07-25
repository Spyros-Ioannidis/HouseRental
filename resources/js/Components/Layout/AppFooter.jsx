import { Link, usePage } from "@inertiajs/react";
import { route } from "@/ziggy";

import { useTranslation } from "@/i18n";

function FooterLink({ href, children }) {
  return (
    <Link
      href={href}
      className="text-color-secondary text-sm transition-colors hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
    >
      {children}
    </Link>
  );
}

function FooterGroup({ title, links }) {
  return (
    <section>
      <h2 className="font-semibold text-sm tracking-wide uppercase">{title}</h2>
      <nav className="mt-4 flex flex-col gap-3" aria-label={title}>
        {links.map((link) => (
          <FooterLink key={link.href} href={link.href}>
            {link.label}
          </FooterLink>
        ))}
      </nav>
    </section>
  );
}

function ContactItem({ label, value, href }) {
  const content = (
    <>
      <span className="font-semibold text-sm tracking-wide uppercase">
        {label}
      </span>
      <span className="mt-1 block text-color-secondary text-sm">{value}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block transition-colors hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
      >
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}

export default function AppFooter() {
  const { props } = usePage();
  const { t, locale } = useTranslation();
  const auth = props.auth ?? {};
  const contactSettings = props.site?.contactSettings ?? {};
  const currentYear = new Date().getFullYear();

  const browseLinks = [
    {
      href: route("home", { locale }),
      label: t("nav.home"),
    },
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

  const accountLinks = auth.user
    ? [
        {
          href: route("dashboard"),
          label: t("nav.dashboard"),
        },
      ]
    : [
        {
          href: route("login"),
          label: t("nav.login"),
        },
        {
          href: route("register"),
          label: t("nav.register"),
        },
      ];

  const legalLinks = [
    {
      href: route("privacy.policy", { locale }),
      label: t("nav.privacy_policy"),
    },
    {
      href: route("terms.use", { locale }),
      label: t("nav.terms_of_use"),
    },
    {
      href: route("cookies.policy", { locale }),
      label: t("nav.cookie_policy"),
    },
    {
      href: route("accessibility.statement", { locale }),
      label: t("nav.accessibility_statement"),
    },
  ];

  const phoneHref = contactSettings.phone
    ? `tel:${String(contactSettings.phone).replace(/[^\d+]/g, "")}`
    : null;
  const contactItems = [
    {
      label: t("pages.contact.email"),
      value: contactSettings.email,
      href: contactSettings.email ? `mailto:${contactSettings.email}` : null,
    },
    {
      label: t("pages.contact.phone"),
      value: contactSettings.phone,
      href: phoneHref,
    },
    {
      label: t("pages.contact.office"),
      value: contactSettings.office,
      href: null,
    },
  ].filter((item) => item.value);

  return (
    <footer className="mt-auto border-t border-color-card bg-color-card text-color-primary">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <FooterGroup title={t("footer.browse")} links={browseLinks} />
        <FooterGroup title={t("footer.account")} links={accountLinks} />
        <FooterGroup title={t("footer.legal")} links={legalLinks} />

        {contactItems.length > 0 && (
          <section>
            <h2 className="font-semibold text-sm tracking-wide uppercase">
              {t("footer.contact")}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {contactItems.map((item) => (
                <ContactItem
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  href={item.href}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-color-card">
        <div className="mx-auto max-w-7xl px-4 py-5 text-color-secondary text-sm sm:px-6 lg:px-8">
          Copyright {currentYear} HouseRental. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
