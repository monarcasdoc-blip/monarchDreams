import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// SERVER ONLY — never import this into a client component.
//
// The service-role key bypasses Row Level Security entirely. `milkweed_official_pins`
// deliberately has no anon write policy, so this client is the only thing that can
// create an official pin; that guarantee evaporates the moment this key reaches the
// browser. Note the env var has no NEXT_PUBLIC_ prefix, so Next will not inline it
// into client bundles — keep it that way.
//
// `null` when unconfigured, matching lib/supabase/client.ts, so callers handle the
// not-set-up case explicitly instead of throwing at import time.
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
