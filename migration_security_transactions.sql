-- Migration: Secure Credit Transactions
-- Remove the policy that allows users to insert their own transactions
-- This prevents users from fabricating their transaction history.
-- Inserts should only happen via secure RPCs (like consume_document_credit) which run with SECURITY DEFINER.

DROP POLICY IF EXISTS "Users can insert own transactions" ON credit_transactions;

-- Ensure users can still VIEW their transactions
-- (This policy should already exist, but reiterating or ensuring it's there is good practice, 
-- though we won't recreate it if it errors on duplication. We just focus on the DROP).
-- CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
