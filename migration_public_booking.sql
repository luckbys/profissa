-- SQL Migration: Public Booking Links
-- Copy and paste this into your Supabase SQL Editor

-- 1. Create the public booking links table
CREATE TABLE IF NOT EXISTS public_booking_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    config JSONB NOT NULL,
    schedule JSONB NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public_booking_configs ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anyone to view public booking configs by slug (for clients)
CREATE POLICY "Public can view booking configs by slug" 
ON public_booking_configs FOR SELECT USING (true);

-- 4. Policy: Allow users to manage only their own booking config
CREATE POLICY "Users can manage own booking config" 
ON public_booking_configs FOR ALL USING (auth.uid() = user_id);

-- 5. Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_public_booking_slug ON public_booking_configs(slug);
