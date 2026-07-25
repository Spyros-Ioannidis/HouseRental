import { useCallback, useMemo, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import InputSelect from "@/Components/form/Input/InputSelect";
import InputText from "@/Components/form/Input/InputText";
import LocationMatchButton from "@/Components/Map/LocationMatchButton";
import MapCanvas from "@/Components/Map/MapCanvas";
import {
  addressText,
  formatCoordinate,
  getPosition,
  getResultCity,
  getResultPosition,
  getResultStreetAddress,
  searchOpenStreetMap,
} from "@/Components/Map/mapUtils";
import { useTranslation } from "@/i18n";

function MapLocationManager({
  address = "",
  city = "",
  latitude = "",
  longitude = "",
  cityOptions = [],
  errors = {},
  disabled = false,
  onChange,
}) {
  const { t } = useTranslation();
  const [results, setResults] = useState([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const query = useMemo(() => addressText({ address, city }), [address, city]);
  const allowedCityValues = useMemo(
    () => new Set(cityOptions.map((option) => String(option.value))),
    [cityOptions],
  );
  const position = useMemo(
    () => getPosition({ latitude, longitude }),
    [latitude, longitude],
  );

  const updateField = useCallback(
    (field, value) => {
      onChange?.(field, value);
    },
    [onChange],
  );

  const updatePosition = useCallback(
    (nextPosition) => {
      updateField("latitude", formatCoordinate(nextPosition[0]));
      updateField("longitude", formatCoordinate(nextPosition[1]));
    },
    [updateField],
  );

  const handleSearch = useCallback(async () => {
    if (!query.trim() || disabled) {
      setResults([]);
      setStatus("idle");
      setError("");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const nextResults = await searchOpenStreetMap(query, { limit: 6 });

      setResults(nextResults);
      setSelectedPlaceId(null);
      setStatus(nextResults.length > 0 ? "ready" : "empty");
    } catch {
      setResults([]);
      setStatus("error");
      setError("OpenStreetMap lookup failed. Try again in a moment.");
    }
  }, [disabled, query]);

  const handleResultSelect = useCallback(
    (result) => {
      const resultPosition = getResultPosition(result);

      if (!resultPosition) {
        return;
      }

      const nextAddress = getResultStreetAddress(result);
      const nextCity = getResultCity(result);

      if (nextAddress) {
        updateField("address", nextAddress);
      }

      if (
        nextCity &&
        (cityOptions.length === 0 || allowedCityValues.has(String(nextCity)))
      ) {
        updateField("city", nextCity);
      }

      updatePosition(resultPosition);
      setSelectedPlaceId(result.place_id);
    },
    [allowedCityValues, cityOptions.length, updateField, updatePosition],
  );

  const handleAddressKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  };

  const clearMatches = () => {
    setResults([]);
    setSelectedPlaceId(null);
    setStatus("idle");
    setError("");
  };

  const clearPosition = () => {
    updateField("latitude", "");
    updateField("longitude", "");
    setSelectedPlaceId(null);
  };

  return (
    <section className="space-y-4 pt-4 border-gray-200 border-t dark:border-gray-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-gray-950 text-lg dark:text-gray-100">
            {t("forms.map.location")}
          </h2>
        </div>
        <ButtonBasic
          type="button"
          onClick={handleSearch}
          disabled={disabled || status === "loading" || !query.trim()}
          variant="Indigo"
          className="inline-flex items-center justify-center gap-2"
        >
          <FaSearch aria-hidden="true" />
          {status === "loading" ? t("forms.map.searching") : t("forms.map.find_addresses")}
        </ButtonBasic>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <InputText
          required
          name="address"
          label={t("forms.house.address")}
          value={address}
          error={errors.address}
          onChange={(event) => updateField("address", event.target.value)}
          onKeyDown={handleAddressKeyDown}
          disabled={disabled}
        />

        {cityOptions.length > 0 ? (
          <InputSelect
            required
            name="city"
            label={t("forms.house.city")}
            value={city}
            options={cityOptions}
            placeholder={t("forms.select")}
            error={errors.city}
            onChange={(event) => updateField("city", event.target.value)}
            disabled={disabled}
          />
        ) : (
          <InputText
            name="city"
            label={t("forms.house.city")}
            value={city}
            error={errors.city}
            onChange={(event) => updateField("city", event.target.value)}
            onKeyDown={handleAddressKeyDown}
            disabled={disabled}
          />
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <InputText
          name="latitude"
          label={t("forms.house.latitude")}
          inputMode="decimal"
          value={latitude}
          error={errors.latitude}
          onChange={(event) => updateField("latitude", event.target.value)}
          disabled={disabled}
        />

        <InputText
          name="longitude"
          label={t("forms.house.longitude")}
          inputMode="decimal"
          value={longitude}
          error={errors.longitude}
          onChange={(event) => updateField("longitude", event.target.value)}
          disabled={disabled}
        />

        <ButtonBasic
          type="button"
          onClick={clearPosition}
          disabled={disabled || !position}
          variant="GrayOutline"
          className="mt-6 inline-flex items-center justify-center gap-2"
        >
          <FaTimes aria-hidden="true" />
          {t("forms.map.clear_marker")}
        </ButtonBasic>
      </div>

      {status === "empty" && (
        <p className="px-3 py-2 border border-amber-200 rounded-lg bg-amber-50 font-medium text-amber-800 text-sm">
          {t("forms.map.no_matches")}
        </p>
      )}
      {status === "error" && (
        <p className="px-3 py-2 border border-red-200 rounded-lg bg-red-50 font-medium text-red-700 text-sm">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-gray-700 text-sm">
              {t("forms.map.matches")}
            </p>
            <ButtonBasic
              type="button"
              onClick={clearMatches}
              disabled={disabled}
              variant="GrayOutline"
              className="inline-flex items-center justify-center gap-2"
            >
              <FaTimes aria-hidden="true" />
              {t("forms.map.clear_matches")}
            </ButtonBasic>
          </div>
          <div className="grid gap-2">
            {results.map((result) => (
              <LocationMatchButton
                key={result.place_id}
                onClick={() => handleResultSelect(result)}
                disabled={disabled}
                isSelected={selectedPlaceId === result.place_id}
              >
                {result.display_name}
              </LocationMatchButton>
            ))}
          </div>
        </div>
      )}

      <div className="h-80 overflow-hidden border border-gray-200 rounded-lg">
        <MapCanvas
          draggable={!disabled}
          position={position}
          scrollWheelZoom
          onPositionChange={disabled ? undefined : updatePosition}
          popup={
            <>
              <strong>Selected location</strong>
              <br />
              {query || "Manual coordinates"}
            </>
          }
        />
      </div>
    </section>
  );
}

export default MapLocationManager;
