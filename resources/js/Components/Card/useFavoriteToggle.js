import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { route } from "@/ziggy";
import { addToast } from "@/Components/Other/Toast";
import { useTranslation } from "@/i18n";

const jsonHeaders = {
  Accept: "application/json",
};

export default function useFavoriteToggle({
  authUser,
  canFavorite,
  houseId,
  initialFavorited,
  onChange,
}) {
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = useState(Boolean(initialFavorited));
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsFavorited(Boolean(initialFavorited));
  }, [initialFavorited]);

  const toggleFavorite = async () => {
    if (!authUser) {
      router.visit(route("login"));
      return;
    }

    if (!canFavorite || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = isFavorited
        ? await axios.delete(route("favorites.destroy", { house: houseId }), {
            headers: jsonHeaders,
          })
        : await axios.post(
            route("favorites.store", { house: houseId }),
            {},
            { headers: jsonHeaders },
          );
      const nextFavorited = Boolean(response.data?.is_favorited ?? !isFavorited);

      setIsFavorited(nextFavorited);
      addToast(
        response.data?.message ??
          t(nextFavorited ? "flash.favorite_added" : "flash.favorite_removed"),
        "success",
      );
      onChange?.(nextFavorited, response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        router.visit(route("login"));
      } else {
        addToast(t("flash.favorite_update_failed"), "failure");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isFavorited,
    isProcessing,
    toggleFavorite,
  };
}
