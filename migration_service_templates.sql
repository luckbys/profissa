-- Migration: Service Templates
-- Create table to store reusable service templates
CREATE TABLE IF NOT EXISTS service_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    category TEXT DEFAULT 'Geral',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own templates" ON service_templates 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON service_templates 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON service_templates 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON service_templates 
    FOR DELETE USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_service_templates_user_id ON service_templates(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_service_templates_updated_at
    BEFORE UPDATE ON service_templates
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
