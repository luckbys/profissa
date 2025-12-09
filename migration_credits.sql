-- Run this script to update your existing database

-- 1. Add credits column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'credits') THEN
        ALTER TABLE profiles ADD COLUMN credits INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create the credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'bonus', 'refund')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on the new table
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for credit_transactions (checking if they exist first to avoid errors is complex in simple SQL, 
-- but we can drop them if exists to be safe, or just ignore if they exist. 
-- The cleanest way for a migration is to DROP IF EXISTS then CREATE)

DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON credit_transactions;
CREATE POLICY "Users can insert own transactions" ON credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
