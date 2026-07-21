"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLocale, useTranslations } from "next-intl";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { MilkweedPin } from "@/lib/milkweed";

// Pod marker points at an exact spot: anchored at its bottom tip.
const POD_SHAPE = {
  iconSize: [40, 58] as [number, number],
  iconAnchor: [20, 58] as [number, number],
  popupAnchor: [0, -54] as [number, number],
};

// Official pins — milkweed planted by Claudia / Women for Green Spaces. Green
// pod (the org is "Women for Green Spaces"), placed at exact coordinates.
const officialIcon = L.icon({ iconUrl: "/images/milkweed-marker.svg", ...POD_SHAPE });

// Community pins — the monarch butterfly from the site logo. These coordinates
// are jittered ~0.5mi for privacy, so the butterfly is centre-anchored rather
// than pointing at an exact spot.
const communityIcon = L.icon({
  iconUrl: "/images/milkweed-butterfly.svg",
  iconSize: [34, 34] as [number, number],
  iconAnchor: [17, 17] as [number, number],
  popupAnchor: [0, -15] as [number, number],
});

// Chicago, home base of the movement — sensible default center when pins
// span a wide area or the map first loads.
const DEFAULT_CENTER: [number, number] = [41.8781, -87.6298];

// event_date is a Postgres `date` ("2026-05-03"), with no time or zone. Passing
// that straight to new Date() parses it as UTC midnight, which renders as the
// previous day for anyone west of Greenwich — including Chicago. Anchor it to
// local midnight instead so the date shown is the date that was entered.
function formatEventDate(date: string, locale: string): string | null {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MilkweedMap({ pins }: { pins: MilkweedPin[] }) {
  const t = useTranslations("MilkweedMap");
  const locale = useLocale();

  const center: [number, number] =
    pins.length > 0 ? [pins[0].lat, pins[0].lng] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={pins.length > 0 ? 6 : 4}
      scrollWheelZoom={true}
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {pins.map((pin) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
          icon={pin.pin_type === "official" ? officialIcon : communityIcon}
        >
          <Popup>
            <div className="text-center">
              {pin.photo_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={pin.photo_url}
                  alt={pin.display_name ?? "Milkweed"}
                  className="w-32 h-32 object-cover rounded-md mx-auto mb-2"
                />
              )}
              {pin.plant_name && (
                <p className="font-display text-sm text-monarch-orange">
                  {pin.plant_name}
                </p>
              )}
              {pin.display_name && (
                <p className="font-medium text-sm">{pin.display_name}</p>
              )}
              {pin.milkweed_count !== null && (
                <p className="text-xs font-medium text-milkweed-green-dark mt-1">
                  {t("popupCount", { count: pin.milkweed_count })}
                </p>
              )}
              {pin.event_name && (
                <p className="text-xs text-monarch-black/70 mt-1">
                  {pin.event_date
                    ? t("popupEventWithDate", {
                        event: pin.event_name,
                        date: formatEventDate(pin.event_date, locale) ?? pin.event_date,
                      })
                    : t("popupEvent", { event: pin.event_name })}
                </p>
              )}
              {pin.description && (
                <p className="text-xs text-monarch-black/70 mt-1">{pin.description}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
