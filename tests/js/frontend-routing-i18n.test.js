import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import {
    buildCleanedFilters,
    cleanQuery,
    getNonFilterQuery,
    removeFilterFromQuery,
} from "../../resources/js/Components/Filters/houseFilterUtils.js";
import { localizedPath, translate } from "../../resources/js/i18n.js";
import { route, syncZiggy } from "../../resources/js/ziggy.js";

const originalZiggy = globalThis.Ziggy;
const locales = { en: "English", el: "Greek" };

afterEach(() => {
    if (originalZiggy === undefined) {
        delete globalThis.Ziggy;
        return;
    }

    globalThis.Ziggy = originalZiggy;
});

test("locale helpers generate expected localized public URLs", () => {
    assert.equal(localizedPath("/", "el", locales), "/el");
    assert.equal(localizedPath("/home", "el", locales), "/el");
    assert.equal(
        localizedPath("/houses?page=2#results", "el", locales),
        "/el/houses?page=2#results",
    );
    assert.equal(localizedPath("/en/contact", "el", locales), "/el/contact");
    assert.equal(localizedPath("/seller/7", "el", locales), "/el/seller/7");
    assert.equal(
        localizedPath("/admin/houses", "el", locales),
        "/admin/houses",
    );
});

test("translations use the active locale and fallback values", () => {
    assert.equal(
        translate({ filters: { search: "Search" } }, "filters.search", {}, {}),
        "Search",
    );
    assert.equal(
        translate(
            {},
            "empty.admin_table",
            { resource: "houses" },
            {
                empty: { admin_table: "No :resource found." },
            },
        ),
        "No houses found.",
    );
});

test("ziggy route syncing works for public and admin routes", () => {
    syncZiggy({
        url: "http://127.0.0.1:8000",
        port: 8000,
        defaults: {},
        routes: {
            "houses.index": {
                uri: "{locale}/houses",
                methods: ["GET", "HEAD"],
                parameters: ["locale"],
            },
            login: { uri: "login", methods: ["GET", "HEAD"] },
        },
    });

    assert.equal(route("houses.index", { locale: "en" }, false), "/en/houses");
    assert.equal(route("login", undefined, false), "/login");

    syncZiggy({
        url: "http://127.0.0.1:8000",
        port: 8000,
        defaults: {},
        routes: {
            admin: { uri: "admin", methods: ["GET", "HEAD"] },
            "admin.houses.edit": {
                uri: "admin/houses/{house}/edit",
                methods: ["GET", "HEAD"],
                parameters: ["house"],
            },
        },
    });

    assert.equal(route("admin", undefined, false), "/admin");
    assert.equal(
        route("admin.houses.edit", { house: 9 }, false),
        "/admin/houses/9/edit",
    );
});

test("filter query cleanup preserves intended house search behavior", () => {
    const filters = {
        city_filter: { key: "city" },
        range_filters: [
            {
                key_min: "price_min",
                key_max: "price_max",
                bounds: { min: 100, max: 1000 },
            },
        ],
        multi_filters: [{ key: "status" }],
    };

    assert.deepEqual(
        cleanQuery({
            search: "sea view",
            city: "",
            status: [],
            page: null,
            order_by: "price",
            order_dir: "asc",
        }),
        {
            search: "sea view",
            order_by: "price",
            order_dir: "asc",
        },
    );

    assert.deepEqual(
        getNonFilterQuery(
            {
                search: "sea view",
                city: "Larisa",
                price_min: "100",
                status: ["active"],
                page: 3,
                order_by: "price",
            },
            filters,
        ),
        {
            search: "sea view",
            order_by: "price",
        },
    );

    assert.deepEqual(
        buildCleanedFilters(
            {
                city: "Larisa",
                price_min: "100",
                price_max: "900",
                status: ["active", ""],
            },
            filters,
        ),
        {
            city: "Larisa",
            price_max: "900",
            status: ["active"],
        },
    );

    assert.deepEqual(
        removeFilterFromQuery(
            {
                search: "sea view",
                status: ["active", "reserved"],
                order_by: "price",
            },
            {
                key: "status",
                value: "active",
            },
        ),
        {
            search: "sea view",
            status: ["reserved"],
            order_by: "price",
        },
    );
});
