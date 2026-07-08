"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { MilkweedPin } from "@/lib/milkweed";

const milkweedIcon = L.icon({
  iconUrl: "/images/milkweed-marker.svg",
  iconSize: [40, 58],
  iconAnchor: [20, 58],
  popupAnchor: [0, -54],
});

// Chicago, home base of the movement — sensible default center when pins
// span a wide area or the map first loads.
const DEFAULT_CENTER: [number, number] = [41.8781, -87.6298];

export default function MilkweedMap({ pins }: { pins: MilkweedPin[] }) {
  const center: [number, number] =
    pins.length > 0 ? [pins[0].lat, pins[0].lng] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={pins.length > 0 ? 6 : 4}
      scrollWheelZoom={false}
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={milkweedIcon}>
          <Popup>
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pin.photo_url}
                alt={pin.display_name ?? "Milkweed"}
                className="w-32 h-32 object-cover rounded-md mx-auto mb-2"
              />
              {pin.display_name && (
                <p className="font-medium text-sm">{pin.display_name}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
