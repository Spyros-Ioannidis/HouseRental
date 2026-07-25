import L from "leaflet";

import { FaLocationDot } from "react-icons/fa6";
import { renderToStaticMarkup } from "react-dom/server";

import { FaMapMarkerAlt } from "react-icons/fa";
import { MdLocationPin } from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";
import React from "react";

export const DEFAULT_CENTER = [37.9838, 23.7275];



export const HOUSE_MARKER_ICON = L.divIcon({
    className: "",
    iconSize: [34, 46],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
    html: renderToStaticMarkup(
        React.createElement(
            "div",
            {
                style: {
                    width: 34,
                    height: 46,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "visible",
                },
            },
            React.createElement(FaLocationDot, {
                size: 38,
                color: "#4338ca",
                style: {
                    stroke: "white",
                    strokeWidth: 18,
                    overflow: "visible",
                },
                "aria-hidden": "true",
            }),
        ),
    ),
});

export const toNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : null;
};

export const formatCoordinate = (value) => {
    const number = toNumber(value);

    return number === null ? "" : number.toFixed(7);
};

export const getPosition = ({ latitude, longitude }) => {
    const lat = toNumber(latitude);
    const lng = toNumber(longitude);

    if (lat === null || lng === null) {
        return null;
    }

    return [lat, lng];
};

export const addressText = ({ address, city }) =>
    [address, city].filter(Boolean).join(", ");

export const searchOpenStreetMap = async (
    query,
    { limit = 5, signal } = {},
) => {
    const params = new URLSearchParams({
        addressdetails: "1",
        format: "jsonv2",
        limit: String(limit),
        q: query,
    });

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
            headers: {
                Accept: "application/json",
            },
            signal,
        },
    );

    if (!response.ok) {
        throw new Error("OpenStreetMap lookup failed");
    }

    const results = await response.json();

    return Array.isArray(results) ? results : [];
};

export const getResultPosition = (result) =>
    getPosition({ latitude: result?.lat, longitude: result?.lon });

export const getResultCity = (result) => {
    const details = result?.address ?? {};

    return (
        details.city ||
        details.town ||
        details.village ||
        details.municipality ||
        details.suburb ||
        details.county ||
        ""
    );
};

export const getResultStreetAddress = (result) => {
    const details = result?.address ?? {};
    const road =
        details.road ||
        details.pedestrian ||
        details.footway ||
        details.path ||
        details.neighbourhood ||
        "";

    if (road && details.house_number) {
        return `${road} ${details.house_number}`;
    }

    return road || result?.name || "";
};
