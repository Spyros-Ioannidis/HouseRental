import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { DEFAULT_CENTER, HOUSE_MARKER_ICON } from "@/Components/Map/mapUtils";

function MapSync({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, map, zoom]);

  return null;
}

function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click(event) {
      onPositionChange?.([event.latlng.lat, event.latlng.lng]);
    },
  });

  return null;
}

function MapCanvas({
  position,
  zoom = 15,
  fallbackZoom = 11,
  className = "h-full w-full",
  draggable = false,
  onPositionChange,
  popup,
  scrollWheelZoom = false,
}) {
  const center = position ?? DEFAULT_CENTER;
  const resolvedZoom = position ? zoom : fallbackZoom;
  const markerEventHandlers = useMemo(
    () => ({
      dragend(event) {
        const nextPosition = event.target.getLatLng();
        onPositionChange?.([nextPosition.lat, nextPosition.lng]);
      },
    }),
    [onPositionChange],
  );

  return (
    <MapContainer
      center={center}
      zoom={resolvedZoom}
      scrollWheelZoom={scrollWheelZoom}
      className={`relative z-0 isolate ${className}`}
    >
      <MapSync center={center} zoom={resolvedZoom} />

      {onPositionChange && (
        <MapClickHandler onPositionChange={onPositionChange} />
      )}

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {position && (
        <Marker
          draggable={draggable}
          eventHandlers={draggable ? markerEventHandlers : undefined}
          icon={HOUSE_MARKER_ICON}
          position={position}
        >
          {popup && <Popup>{popup}</Popup>}
        </Marker>
      )}
    </MapContainer>
  );
}

export default MapCanvas;
