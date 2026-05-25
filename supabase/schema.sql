-- AthleteVault Database Schema
-- Run this entire file in your Supabase SQL Editor (supabase.com → your project → SQL Editor → New query)

-- ── Key-Value Store (powers all app data) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kv_store (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kv_store ENABLE ROW LEVEL SECURITY;

-- Allow public read (anyone with the anon key can read)
CREATE POLICY "Allow public read" ON public.kv_store
  FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert" ON public.kv_store
  FOR INSERT WITH CHECK (true);

-- Allow public update
CREATE POLICY "Allow public update" ON public.kv_store
  FOR UPDATE USING (true);

-- Index for fast key lookups (already covered by PRIMARY KEY, but explicit for clarity)
-- No extra index needed — PRIMARY KEY creates one automatically.

-- Done! Your app will now store all data here instead of the browser.
-- Each "store" in the app (athletes, coaches, messages, etc.) is one row with a JSONB value.
