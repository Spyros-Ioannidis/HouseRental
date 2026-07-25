import { Link } from "@inertiajs/react";
import { FiAlertTriangle, FiArrowRight } from "react-icons/fi";

import { localizedPath, useTranslation } from "@/i18n";

const externalUrlPattern = /^https?:\/\//i;

export default function ErrorPage({
  statusCode,
  title,
  message,
  actionText,
  actionUrl,
}) {
  const { locale, locales } = useTranslation();
  const actionHref =
    actionUrl && externalUrlPattern.test(actionUrl)
      ? actionUrl
      : actionUrl
        ? localizedPath(actionUrl, locale, locales)
        : null;
  const hasAction = actionText && actionHref;
  const ActionComponent = actionHref && externalUrlPattern.test(actionHref) ? "a" : Link;

  return (
    <section
      aria-labelledby="error-title"
      className="flex min-h-0 flex-1 items-center justify-center bg-color-primary px-4 py-16 text-color-primary sm:px-6 lg:px-8"
    >
      <div className="mx-auto w-full max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
            <FiAlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold uppercase text-indigo-700 dark:text-indigo-300">
            HTTP {statusCode}
          </p>
        </div>

        <h1
          id="error-title"
          className="mt-6 text-4xl font-bold text-color-primary sm:text-5xl"
        >
          {title}
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-color-secondary">
          {message}
        </p>

        {hasAction && (
          <div className="mt-8">
            <ActionComponent
              href={actionHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            >
              {actionText}
              <FiArrowRight className="h-4 w-4" aria-hidden="true" />
            </ActionComponent>
          </div>
        )}
      </div>
    </section>
  );
}
