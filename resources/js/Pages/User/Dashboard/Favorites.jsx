import { useEffect, useState } from "react";
import CardHouse from "@/Components/Card/CardHouse";

import UserDashboardLayout from "@/Layout/UserDashboardLayout";
import { useTranslation } from "@/i18n";

function Favorites({ favoriteHouses = [] }) {
  const { t } = useTranslation();
  const [houses, setHouses] = useState(favoriteHouses);

  useEffect(() => {
    setHouses(favoriteHouses);
  }, [favoriteHouses]);

  const handleFavoriteChange = (houseId) => (isFavorited) => {
    if (isFavorited) {
      return;
    }

    setHouses((currentHouses) =>
      currentHouses.filter((house) => house.id !== houseId),
    );
  };

  return (
    <div>
      {houses.length > 0 ? (
        <div className="grid gap-5">
          {houses.map((house) => (
            <CardHouse
              key={house.id}
              props={house}
              onFavoriteChange={handleFavoriteChange(house.id)}
            />
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 border border-dashed rounded-2xl text-center">
          <h3 className="font-bold text-lg">{t("empty.favorites_title")}</h3>
          <p className="mt-2 mx-auto max-w-md text-gray-500 text-sm">
            {t("empty.favorites_body")}
          </p>
        </div>
      )}
    </div>
  );
}

Favorites.layout = (page) => {
  return (
    <UserDashboardLayout
      activeSection="favorites"
      user={page.props.user}
      title="Favorite houses"
      description="Houses saved from the public listings stay here for quick access."
    >
      {page}
    </UserDashboardLayout>
  );
};

export default Favorites;
