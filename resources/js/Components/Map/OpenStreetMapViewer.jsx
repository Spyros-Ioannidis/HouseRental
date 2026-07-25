import { useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

import MapCanvas from "@/Components/Map/MapCanvas";
import {
  addressText,
  getPosition,
  getResultPosition,
  searchOpenStreetMap,
} from "@/Components/Map/mapUtils";

function OpenStreetMapViewer({ title, address, city, latitude, longitude }) {
  const formattedAddress = useMemo(
    () => addressText({ address, city }),
    [address, city],
  );
  const providedPosition = useMemo(
    () => getPosition({ latitude, longitude }),
    [latitude, longitude],
  );
  const [geocodedPosition, setGeocodedPosition] = useState(null);
  const [status, setStatus] = useState(providedPosition ? "ready" : "idle");

  useEffect(() => {
    if (providedPosition) {
      setGeocodedPosition(null);
      setStatus("ready");
      return;
    }

    if (!formattedAddress) {
      setGeocodedPosition(null);
      setStatus("missing");
      return;
    }

    const controller = new AbortController();

    setStatus("loading");

    async function geocodeAddress() {
      try {
        const results = await searchOpenStreetMap(formattedAddress, {
          limit: 1,
          signal: controller.signal,
        });
        const firstPosition = getResultPosition(results[0]);

        if (!firstPosition) {
          setStatus("missing");
          return;
        }

        setGeocodedPosition(firstPosition);
        setStatus("ready");
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus("missing");
        }
      }
    }

    geocodeAddress();

    return () => controller.abort();
  }, [formattedAddress, providedPosition]);

  const position = providedPosition ?? geocodedPosition;

  return (
    <section className="overflow-hidden border border-gray-200 rounded-lg bg-color-primary text-color-primary shadow-sm">
      <div className="h-80">
        <MapCanvas
          position={position}
          popup={
            <>
              <strong>{title}</strong>
              <br />
              {formattedAddress || "Address unavailable"}
            </>
          }
        />
      </div>

      <div className="flex items-start gap-3 px-5 py-4 border-gray-200 border-t">
        <span className="mt-1 text-indigo-700">
          <FaMapMarkerAlt aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-sm">Location</h2>
          <p className="mt-1 text-gray-600 text-sm">
            {formattedAddress || "No address has been added for this house yet."}
          </p>
          {status === "loading" && (
            <p className="mt-2 font-medium text-gray-500 text-xs">
              Finding this address on OpenStreetMap...
            </p>
          )}
          {status === "missing" && formattedAddress && (
            <p className="mt-2 font-medium text-gray-500 text-xs">
              Coordinates are not saved yet, and OpenStreetMap could not match
              this address.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default OpenStreetMapViewer;
