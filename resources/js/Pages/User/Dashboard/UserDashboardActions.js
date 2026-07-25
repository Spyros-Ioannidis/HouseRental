import {
    FiHeart,
    FiImage,
    FiLock,
    FiMail,
    FiShield,
    FiUser,
} from "react-icons/fi";

/* global route */

export const dashboardSections = [
    {
        id: "profile",
        labelKey: "account.profile",
        routeName: "user.dashboard.profile",
        icon: FiUser,
    },
    {
        id: "email",
        labelKey: "account.email",
        routeName: "user.dashboard.email",
        icon: FiMail,
    },
    {
        id: "password",
        labelKey: "account.password",
        routeName: "user.dashboard.password",
        icon: FiLock,
    },
    {
        id: "favorites",
        labelKey: "account.favorite_houses",
        routeName: "user.dashboard.favorites",
        icon: FiHeart,
        usersOnly: true,
    },
];

export const dashboardSectionMap = Object.fromEntries(
    dashboardSections.map((section) => [section.id, section]),
);

export function namedRoute(name) {
    return route(name, undefined, false);
}

export function dashboardSectionHref(sectionId) {
    const routeName = dashboardSectionMap[sectionId]?.routeName;

    return namedRoute(routeName || "dashboard");
}

export function getInitials(name) {
    if (!name || !name.trim()) return "U";

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
