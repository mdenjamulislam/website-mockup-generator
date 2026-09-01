import { createClient } from "@supabase/supabase-js";
import { config } from "./index.js";

if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.warn("⚠️ Supabase URL or Service Key missing. Supabase client will fail to initialize properly.");
}

// Provide dummy values to prevent createClient from throwing on startup if env vars are missing
export const supabase = createClient(
  config.supabaseUrl || "https://dummy.supabase.co",
  config.supabaseServiceKey || "dummy-key"
);

