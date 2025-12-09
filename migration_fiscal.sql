-- Fiscal Configuration Table
-- Stores user certificate info and municipal preferences
CREATE TABLE IF NOT EXISTS fiscal_config (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_path TEXT, -- Path in Supabase Storage
    certificate_password TEXT, -- WARNING: Ideally should be encrypted or in Vault. Storing as text for MVP as requested.
    municipal_params JSONB DEFAULT '{}', -- Cache of municipal settings (service codes, rates)
    environment TEXT DEFAULT 'homologation' CHECK (environment IN ('homologation', 'production')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Invoices (NFS-e) Table
-- Stores the lifecycle of a note from DPS (Draft) to Authorized NFS-e
CREATE TABLE IF NOT EXISTS nfs_e (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL, -- Optional link to appointment
    
    -- Control fields
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'authorized', 'rejected', 'cancelled', 'replaced')),
    environment TEXT DEFAULT 'homologation',
    
    -- DPS fields (simplified for query, full content in dps_xml)
    dps_number INTEGER, -- Sequential number
    dps_series TEXT DEFAULT 'E',
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Values
    service_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    taxable_amount DECIMAL(10,2) GENERATED ALWAYS AS (service_amount - deductions) STORED,
    iss_rate DECIMAL(5,2) DEFAULT 0,
    iss_amount DECIMAL(10,2) DEFAULT 0,
    
    -- API Interactions
    xml_sent TEXT, -- The signed DPS XML sent to API
    xml_return TEXT, -- The raw XML returned by API
    
    -- Official NFS-e Data (populated after auth)
    auth_code TEXT, -- Código de Verificação
    nfse_number TEXT, -- Número da Nota gerada
    url_pdf TEXT, -- Link to DANFSe PDF
    
    -- Errors
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE fiscal_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfs_e ENABLE ROW LEVEL SECURITY;

-- Fiscal Config Policies
CREATE POLICY "Users can manage own fiscal config" ON fiscal_config
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- NFS-e Policies
CREATE POLICY "Users can view own nfse" ON nfs_e FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nfse" ON nfs_e FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nfse" ON nfs_e FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nfse" ON nfs_e FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_fiscal_config_updated_at
    BEFORE UPDATE ON fiscal_config
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_nfs_e_updated_at
    BEFORE UPDATE ON nfs_e
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
