import { useCallback } from "react";
import { router, usePage } from "@inertiajs/react";
import { route } from "./ziggy.js";

const PUBLIC_SEGMENTS = new Set([
    "houses",
    "about",
    "contact",
    "privacy-policy",
    "terms-of-use",
    "cookie-policy",
    "accessibility-statement",
    "seller",
    "test",
]);

const interpolate = (text, values = {}) =>
    Object.entries(values).reduce(
        (result, [key, value]) => result.replaceAll(`:${key}`, value ?? ""),
        text,
    );

const findTranslation = (translations, key) =>
    key
        .split(".")
        .reduce((current, part) => current?.[part], translations);

export function translate(translations, key, values = {}, fallbackTranslations = {}) {
    const value = key
        ? findTranslation(translations, key)
        : undefined;
    const fallback = key
        ? findTranslation(fallbackTranslations, key)
        : undefined;

    if (typeof value === "string") {
        return interpolate(value, values);
    }

    return typeof fallback === "string" ? interpolate(fallback, values) : key;
}

export function intlLocale(locale = "en") {
    return locale === "el" ? "el-GR" : "en-US";
}

export function localizedPath(path = "/", targetLocale, locales = {}) {
    const supportedLocales = Object.keys(locales);
    const base =
        typeof window === "undefined"
            ? "https://example.test"
            : window.location.origin;
    const url = new URL(path, base);
    const segments = url.pathname.split("/").filter(Boolean);
    const firstSegment = segments[0];

    if (supportedLocales.includes(firstSegment)) {
        segments[0] = targetLocale;
        url.pathname = `/${segments.join("/")}`;
        return `${url.pathname}${url.search}${url.hash}`;
    }

    if (segments.length === 0) {
        return `/${targetLocale}${url.search}${url.hash}`;
    }

    if (firstSegment === "home") {
        return `/${targetLocale}${url.search}${url.hash}`;
    }

    if (PUBLIC_SEGMENTS.has(firstSegment)) {
        return `/${targetLocale}${url.pathname}${url.search}${url.hash}`;
    }

    return `${url.pathname}${url.search}${url.hash}`;
}

export function isPublicLocalizedPath(path = "/", locales = {}) {
    const supportedLocales = Object.keys(locales);
    const segments = path.split("?")[0].split("/").filter(Boolean);

    return supportedLocales.includes(segments[0]);
}

export function useTranslation() {
    const { props } = usePage();
    const translations = props.translations ?? {};
    const fallbackTranslations = props.fallbackTranslations ?? {};
    const locale = props.locale ?? "en";
    const locales = props.locales ?? { en: "English" };

    const t = useCallback(
        (key, values = {}) => translate(translations, key, values, fallbackTranslations),
        [fallbackTranslations, translations],
    );

    return { t, locale, locales, translations, fallbackTranslations };
}

export function switchLocale({ currentUrl, locale, locales }) {
    const nextUrl = localizedPath(currentUrl, locale, locales);

    if (nextUrl !== currentUrl && isPublicLocalizedPath(nextUrl, locales)) {
        router.visit(nextUrl);
        return;
    }

    router.post(
        route("locale.switch", { locale }),
        { redirect: currentUrl },
        {
            preserveScroll: true,
        },
    );
}
