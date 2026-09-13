-- Migration: Add is_age_restricted column to stores table
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS is_age_restricted BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN stores.is_age_restricted IS 'Whether the store sells age-restricted products (18+ only: rokok, vape, alkohol). Default false.';
