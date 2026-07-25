import { route as ziggyRoute } from "ziggy-js";

function currentZiggy(config) {
    if (config) {
        return config;
    }

    if (typeof globalThis === "undefined") {
        return undefined;
    }

    return globalThis.Ziggy;
}

export function syncZiggy(ziggy) {
    if (!ziggy || typeof globalThis === "undefined") {
        return;
    }

    if (!globalThis.Ziggy || typeof globalThis.Ziggy !== "object") {
        globalThis.Ziggy = { ...ziggy };
        return;
    }

    for (const key of Object.keys(globalThis.Ziggy)) {
        delete globalThis.Ziggy[key];
    }

    Object.assign(globalThis.Ziggy, ziggy);
}

export function route(name, params, absolute, config) {
    return ziggyRoute(name, params, absolute, currentZiggy(config));
}
