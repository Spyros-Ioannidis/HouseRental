import axios from "axios";
import { useMemo, useState } from "react";
import { FiSave, FiUserCheck, FiXCircle } from "react-icons/fi";
import { route } from "@/ziggy";

import ButtonBasic from "@/Components/form/Button/ButtonBasic";
import InputSelectSearch from "@/Components/form/Input/InputSelectSearch";
import { addToast } from "@/Components/Other/Toast";
import { useTranslation } from "@/i18n";

const replaceRental = (rentals, rental) =>
  rentals.map((item) => (item.id === rental.id ? rental : item));

function RentalRow({ houseId, rental, canManage, onUpdate }) {
  const { t } = useTranslation();
  const [startsOn, setStartsOn] = useState(rental.starts_on ?? "");
  const [endsOn, setEndsOn] = useState(rental.ends_on ?? "");
  const [processing, setProcessing] = useState(false);
  const isRevoked = Boolean(rental.revoked_at);

  const saveDates = async () => {
    setProcessing(true);

    try {
      const { data } = await axios.put(
        route("admin.houses.rentals.update", {
          house: houseId,
          rental: rental.id,
        }),
        { starts_on: startsOn || null, ends_on: endsOn || null },
        { headers: { Accept: "application/json" } },
      );

      onUpdate(data.rental);
      addToast(t("rentals.update_success"), "success");
    } catch (error) {
      addToast(error.response?.data?.message ?? t("rentals.save_error"), "failure");
    } finally {
      setProcessing(false);
    }
  };

  const revoke = async () => {
    setProcessing(true);

    try {
      const { data } = await axios.delete(
        route("admin.houses.rentals.destroy", {
          house: houseId,
          rental: rental.id,
        }),
        { headers: { Accept: "application/json" } },
      );

      onUpdate(data.rental);
      addToast(t("rentals.revoke_success"), "success");
    } catch (error) {
      addToast(error.response?.data?.message ?? t("rentals.save_error"), "failure");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid gap-3 p-4 border border-gray-200 rounded-lg bg-color-primary lg:grid-cols-[minmax(0,1fr)_9rem_9rem_auto] lg:items-end dark:border-gray-800">
      <div>
        <p className="font-semibold text-gray-950 dark:text-gray-100">
          {rental.user?.name ?? t("house.unknown_user")}
        </p>
        <p className="text-gray-500 text-sm dark:text-gray-400">
          {rental.user?.email}
        </p>
        {isRevoked && (
          <span className="mt-2 inline-flex px-2.5 py-1 rounded-full bg-red-50 font-semibold text-red-700 text-xs">
            {t("rentals.revoked")}
          </span>
        )}
      </div>

      <label className="grid gap-1 font-medium text-gray-700 text-sm dark:text-gray-200">
        {t("rentals.starts_on")}
        <input
          type="date"
          value={startsOn}
          onChange={(event) => setStartsOn(event.target.value)}
          disabled={!canManage || isRevoked}
          className="px-3 py-2 border border-gray-300 rounded-md bg-color-card text-sm dark:border-gray-700"
        />
      </label>

      <label className="grid gap-1 font-medium text-gray-700 text-sm dark:text-gray-200">
        {t("rentals.ends_on")}
        <input
          type="date"
          value={endsOn}
          onChange={(event) => setEndsOn(event.target.value)}
          disabled={!canManage || isRevoked}
          className="px-3 py-2 border border-gray-300 rounded-md bg-color-card text-sm dark:border-gray-700"
        />
      </label>

      {canManage && !isRevoked && (
        <div className="flex flex-wrap gap-2">
          <ButtonBasic
            type="button"
            variant="Indigo"
            disabled={processing}
            onClick={saveDates}
            className="inline-flex items-center gap-2"
          >
            <FiSave aria-hidden="true" />
            {t("rentals.save_dates")}
          </ButtonBasic>
          <ButtonBasic
            type="button"
            variant="Red"
            disabled={processing}
            onClick={revoke}
            className="inline-flex items-center gap-2"
          >
            <FiXCircle aria-hidden="true" />
            {t("rentals.revoke")}
          </ButtonBasic>
        </div>
      )}
    </div>
  );
}

export default function ConfirmedRentersPanel({
  houseId,
  rentalData = {},
  canManage = false,
}) {
  const { t } = useTranslation();
  const [rentals, setRentals] = useState(rentalData.rentals ?? []);
  const [userId, setUserId] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [processing, setProcessing] = useState(false);

  const candidates = rentalData.candidates ?? [];
  const activeUserIds = useMemo(
    () =>
      new Set(
        rentals
          .filter((rental) => !rental.revoked_at && rental.user?.id != null)
          .map((rental) => rental.user.id),
      ),
    [rentals],
  );
  const userOptions = useMemo(
    () =>
      candidates
        .filter((candidate) => !activeUserIds.has(candidate.id))
        .map((candidate) => ({
          value: candidate.id,
          label: candidate.label,
        })),
    [activeUserIds, candidates],
  );

  const addRental = async (event) => {
    event.preventDefault();

    if (!userId) {
      addToast(t("rentals.select_user"), "failure");
      return;
    }

    setProcessing(true);

    try {
      const { data } = await axios.post(
        route("admin.houses.rentals.store", { house: houseId }),
        {
          user_id: userId,
          starts_on: startsOn || null,
          ends_on: endsOn || null,
        },
        { headers: { Accept: "application/json" } },
      );

      setRentals((current) => [data.rental, ...current]);
      setUserId("");
      setStartsOn("");
      setEndsOn("");
      addToast(t("rentals.add_success"), "success");
    } catch (error) {
      addToast(error.response?.data?.message ?? t("rentals.save_error"), "failure");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="p-4 border border-gray-200 rounded-xl bg-color-card shadow-cst-xl dark:border-gray-800">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 font-semibold text-gray-950 text-lg dark:text-gray-100">
          <FiUserCheck aria-hidden="true" />
          {t("rentals.title")}
        </h2>
      </div>

      {canManage && (
        <form
          onSubmit={addRental}
          className="mb-4 grid gap-3 p-4 border border-gray-200 rounded-lg bg-color-primary lg:grid-cols-[minmax(0,1fr)_9rem_9rem_auto] lg:items-end dark:border-gray-800 dark:bg-color-primary"
        >
          <InputSelectSearch
            name="confirmed_renter"
            label={t("rentals.user")}
            value={userId}
            options={userOptions}
            onChange={(event) => setUserId(event.target.value)}
            placeholder={t("rentals.select_user")}
          />
          <label className="grid gap-1 font-medium text-gray-700 text-sm dark:text-gray-200">
            {t("rentals.starts_on")}
            <input
              type="date"
              value={startsOn}
              onChange={(event) => setStartsOn(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-color-card text-sm dark:border-gray-700"
            />
          </label>
          <label className="grid gap-1 font-medium text-gray-700 text-sm dark:text-gray-200">
            {t("rentals.ends_on")}
            <input
              type="date"
              value={endsOn}
              onChange={(event) => setEndsOn(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-color-card text-sm dark:border-gray-700"
            />
          </label>
          <ButtonBasic
            type="submit"
            variant="Blue"
            disabled={processing || userOptions.length === 0}
          >
            {processing ? t("rentals.adding") : t("rentals.add_renter")}
          </ButtonBasic>
        </form>
      )}

      {rentals.length > 0 ? (
        <div className="grid gap-3">
          {rentals.map((rental) => (
            <RentalRow
              key={rental.id}
              houseId={houseId}
              rental={rental}
              canManage={canManage}
              onUpdate={(updatedRental) =>
                setRentals((current) => replaceRental(current, updatedRental))
              }
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm dark:text-gray-400">
          {t("rentals.no_rentals")}
        </p>
      )}
    </section>
  );
}
