import { supabase } from "../config/supabase.js";
import { normalizeUrl } from "../utils/normalizeUrl.js";

interface GenerationResult {
  /** The database record ID (existing or newly created) */
  id: string;
  /** Whether a new row was inserted (false = URL already existed) */
  isNew: boolean;
}

/**
 * Inserts a generation record if the normalized URL does not already exist.
 * Uses PostgreSQL ON CONFLICT DO NOTHING to handle race conditions safely.
 *
 * If the URL already exists, the existing record is returned instead.
 * Duplicate URLs are silently ignored — no errors, no notifications.
 */
export async function createGenerationIfNotExists(rawUrl: string): Promise<GenerationResult> {
  const normalized = normalizeUrl(rawUrl);

  // Attempt conflict-safe insert.
  // ON CONFLICT (url) DO NOTHING will silently skip if URL already exists.
  const { data: insertData, error: insertError } = await supabase
    .from("mockup_generations")
    .upsert(
      { url: normalized, generated: false },
      { onConflict: "url", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle();

  // If upsert returned a row, it was newly inserted
  if (!insertError && insertData) {
    return { id: insertData.id, isNew: true };
  }

  // If no row was returned (duplicate was ignored), look up the existing record
  if (!insertError && !insertData) {
    const { data: existing, error: selectError } = await supabase
      .from("mockup_generations")
      .select("id")
      .eq("url", normalized)
      .single();

    if (selectError || !existing) {
      throw new Error(
        `Failed to find existing generation record for URL: ${selectError?.message ?? "unknown error"}`
      );
    }

    return { id: existing.id, isNew: false };
  }

  // Real database failure
  throw new Error(`Failed to insert generation record: ${insertError?.message ?? "unknown error"}`);
}

/**
 * Marks a generation record as successfully generated.
 *
 * Only transitions generated: false → true.
 * If the record is already generated: true, this is a no-op to preserve history.
 */
export async function markGenerationSuccessful(id: string): Promise<void> {
  const { error } = await supabase
    .from("mockup_generations")
    .update({ generated: true })
    .eq("id", id)
    .eq("generated", false);  // Only update if not already true

  if (error) {
    throw new Error(`Failed to update generation record to success: ${error.message}`);
  }
}
