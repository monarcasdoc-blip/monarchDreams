import { supabase } from "@/lib/supabase/client";

export type MilkweedPin = {
  id: string;
  display_name: string | null;
  plant_name: string | null;
  lat: number;
  lng: number;
  photo_url: string;
  created_at: string;
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
