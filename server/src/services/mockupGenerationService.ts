import { supabase } from "../config/supabase.js";

export async function createGeneration(url: string): Promise<string> {
  const { data, error } = await supabase
    .from("mockup_generations")
    .insert([{ url, generated: false }])
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to insert generation record: ${error.message}`);
  }

  return data.id;
}

export async function markGenerationSuccessful(id: string): Promise<void> {
  const { error } = await supabase
    .from("mockup_generations")
    .update({ generated: true })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update generation record to success: ${error.message}`);
  }
}
