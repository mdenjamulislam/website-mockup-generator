import crypto from "node:crypto";
import { supabase } from "../config/supabase.js";
import { config } from "../config/index.js";

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "temp-mockups";
let bucketChecked = false;

/**
 * Checks whether Supabase Storage credentials are configured.
 */
export function isStorageConfigured(): boolean {
  return Boolean(config.supabaseUrl && config.supabaseServiceKey);
}

/**
 * Ensures the temporary storage bucket exists with private access.
 */
export async function ensureBucket(): Promise<boolean> {
  if (!isStorageConfigured()) return false;
  if (bucketChecked) return true;

  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.warn("Storage listBuckets error:", listError.message);
      return false;
    }

    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 20 * 1024 * 1024, // 20 MB max file
      });
      if (createError) {
        console.warn("Storage createBucket error:", createError.message);
        return false;
      }
    }

    bucketChecked = true;
    return true;
  } catch (err) {
    console.warn("ensureBucket error:", err);
    return false;
  }
}

/**
 * Uploads a temporary image buffer and generates a short-lived signed URL.
 * Automatically handles bucket creation if needed.
 */
export async function uploadTempImage(
  buffer: Buffer,
  format: "png" | "webp" = "png",
  expiresInSeconds = 3600
): Promise<{ path: string; signedUrl: string } | null> {
  if (!isStorageConfigured()) return null;

  try {
    const ready = await ensureBucket();
    if (!ready) return null;

    const id = crypto.randomUUID();
    const filePath = `exports/${Date.now()}_${id}.${format}`;
    const contentType = format === "webp" ? "image/webp" : "image/png";

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.warn("Failed to upload temp asset to Supabase Storage:", uploadError.message);
      return null;
    }

    const { data: signedData, error: signError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresInSeconds);

    if (signError || !signedData?.signedUrl) {
      console.warn("Failed to generate signed URL:", signError?.message);
      return null;
    }

    return {
      path: filePath,
      signedUrl: signedData.signedUrl,
    };
  } catch (err) {
    console.warn("Error in uploadTempImage:", err);
    return null;
  }
}

/**
 * Deletes temporary storage assets after use.
 */
export async function deleteTempAssets(paths: string[]): Promise<void> {
  if (!isStorageConfigured() || paths.length === 0) return;

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths);
    if (error) {
      console.warn("Error cleaning up storage assets:", error.message);
    }
  } catch (err) {
    console.warn("deleteTempAssets error:", err);
  }
}

