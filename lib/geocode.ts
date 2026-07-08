export type Coordinates = { lat: number; lng: number };

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy requires a descriptive User-Agent identifying the
// app plus a contact point, and asks for at most 1 request/second — both are
// non-issues here since this runs once per form submission, not in bulk.
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(address)}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "SuenosDeUnaMonarcaFilm/1.0 (contact: juliantrejo1@gmail.com)",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) return null;

  const results = (await res.json()) as { lat: string; lon: string }[];
  if (results.length === 0) return null;

  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

// Randomly offsets a coordinate by up to `maxMiles` in a random direction, so
// the public map never plots a submitter's exact home address.
export function jitterCoordinates(
  { lat, lng }: Coordinates,
  maxMiles = 0.5
): Coordinates {
  const earthRadiusMiles = 3958.8;
  const distance = Math.random() * maxMiles;
  const angle = Math.random() * 2 * Math.PI;

  const latOffset = (distance / earthRadiusMiles) * (180 / Math.PI);
  const lngOffset =
    ((distance / earthRadiusMiles) * (180 / Math.PI)) /
    Math.cos((lat * Math.PI) / 180);

  return {
    lat: lat + latOffset * Math.sin(angle),
    lng: lng + lngOffset * Math.cos(angle),
  };
}
