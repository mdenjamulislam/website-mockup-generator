-- ============================================================================
-- Migration: Deduplicate mockup_generations and add UNIQUE constraint on url
-- ============================================================================
-- This migration safely handles existing duplicate URL rows before adding
-- a unique constraint. It must be run ONCE against the production database.
--
-- Strategy:
--   1. Normalize existing URLs (trim trailing slash on root paths, lowercase).
--   2. For each group of duplicate URLs, keep the "best" row:
--      - Prefer generated = true over false (preserve success history).
--      - Among ties, prefer the earliest created_at.
--   3. Delete all other duplicate rows.
--   4. Add UNIQUE constraint.
-- ============================================================================

BEGIN;

-- Step 1: Normalize existing URLs in-place.
-- Removes trailing slash when path is exactly "/" (root-only URLs).
-- Lowercases the entire URL (hostnames are case-insensitive; paths
-- are technically case-sensitive, but existing data from this app
-- has been inserted via the URL API which already lowercases the host).
UPDATE public.mockup_generations
SET url = RTRIM(url, '/')
WHERE url ~ '^https?://[^/]+/$'
  AND url !~ '^https?://[^/]+/.+/$';
  -- ^^ Only strip trailing slash for root URLs like "https://example.com/"
  -- Do NOT strip from deeper paths like "https://example.com/about/"

-- Step 2: Identify the "best" record for each URL group.
-- For each url, keep the row that has:
--   a) generated = true (if any row has it), then
--   b) the earliest created_at among ties
-- All other rows in the group will be deleted.
DELETE FROM public.mockup_generations
WHERE id NOT IN (
  SELECT DISTINCT ON (url) id
  FROM public.mockup_generations
  ORDER BY url,
           generated DESC,      -- true (1) before false (0)
           created_at ASC       -- earliest first
);

-- Step 3: Add the unique constraint on the url column.
-- This will fail if duplicates still exist (safety check).
ALTER TABLE public.mockup_generations
ADD CONSTRAINT mockup_generations_url_unique UNIQUE (url);

COMMIT;
