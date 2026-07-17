import { supabase } from "@/lib/supabase/client";

// "community" pins come from public submissions (approved, coordinates jittered
// for privacy); "official" pins are plantings by Claudia / Women for Green Spaces,
// added via /admin/milkweed and shown at their exact location. The map renders
// them with different markers. Both arrive from the public_milkweed_pins view.
export type MilkweedPinType = "community" | "official";

export type MilkweedPin = {
  id: string;
  display_name: string | null;
  plant_name: string | null;
  description: string | null;
  lat: number;
  lng: number;
  // Null only for official pins — a photo is optional when Claudia adds one.
  photo_url: string | null;
  created_at: string;
  pin_type: MilkweedPinType;
  // Official pins only; always null for community submissions, which don't
  // collect a count or event. `event_name` non-null is what marks a planting as
  // having had an event attached; `event_date` may be null even so.
  milkweed_count: number | null;
  event_name: string | null;
  event_date: string | null;
};

export async function getApprovedMilkweedPins(): Promise<MilkweedPin[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("public_milkweed_pins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load milkweed pins", error);
    return [];
  }

  return data ?? [];
}
