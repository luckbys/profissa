-- Migration: Secure Credit Management
-- 1. Create a function to prevent direct updates to sensitive columns in profiles
CREATE OR REPLACE FUNCTION prevent_sensitive_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is not a service role (i.e., is a regular authenticated user)
    IF (auth.role() = 'authenticated') THEN
        -- Prevent changes to credits
        IF NEW.credits IS DISTINCT FROM OLD.credits THEN
            RAISE EXCEPTION 'You cannot update your credits directly. Use the appropriate service.';
        END IF;
        
        -- Prevent changes to is_pro
        IF NEW.is_pro IS DISTINCT FROM OLD.is_pro THEN
            RAISE EXCEPTION 'You cannot update your pro status directly.';
        END IF;

        -- Prevent changes to subscription_status
        IF NEW.subscription_status IS DISTINCT FROM OLD.subscription_status THEN
            RAISE EXCEPTION 'You cannot update your subscription status directly.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the trigger on profiles table
DROP TRIGGER IF EXISTS trg_prevent_sensitive_updates ON profiles;
CREATE TRIGGER trg_prevent_sensitive_updates
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE prevent_sensitive_updates();

-- 3. Create a secure RPC to consume a credit
-- This function runs with SECURITY DEFINER, meaning it bypasses RLS and runs as the owner (postgres)
CREATE OR REPLACE FUNCTION consume_document_credit(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_credits INTEGER;
    is_pro_user BOOLEAN;
BEGIN
    -- Get current user state
    SELECT credits, is_pro INTO current_credits, is_pro_user
    FROM profiles
    WHERE id = user_id OR profiles.user_id = consume_document_credit.user_id
    LIMIT 1;

    -- If Pro, no need to consume credits
    IF is_pro_user THEN
        RETURN TRUE;
    END IF;

    -- Check if has credits
    IF current_credits > 0 THEN
        -- Decrement credit
        UPDATE profiles
        SET credits = credits - 1,
            updated_at = NOW()
        WHERE id = user_id OR profiles.user_id = consume_document_credit.user_id;

        -- Log transaction (optional but good for audit)
        INSERT INTO credit_transactions (user_id, amount, type, description)
        VALUES (
            (SELECT profiles.user_id FROM profiles WHERE id = consume_document_credit.user_id OR profiles.user_id = consume_document_credit.user_id LIMIT 1),
            -1, 
            'usage', 
            'Document generation'
        );

        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;
