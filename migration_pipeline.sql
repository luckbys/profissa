-- Pipeline de Vendas / CRM
-- Estágios: lead → contato → orcamento → negociando → ganho | perdido

CREATE TABLE IF NOT EXISTS pipeline_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,

    -- Dados do lead
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    service_interest TEXT,       -- Serviço de interesse
    estimated_value DECIMAL(10,2) DEFAULT 0,

    -- Kanban
    stage TEXT NOT NULL DEFAULT 'lead'
        CHECK (stage IN ('lead','contato','orcamento','negociando','ganho','perdido')),
    stage_order INTEGER DEFAULT 0, -- Ordenação dentro do estágio

    notes TEXT,
    lost_reason TEXT,            -- Motivo da perda (apenas quando stage = perdido)

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE pipeline_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own leads"
    ON pipeline_leads FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_pipeline_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pipeline_leads_updated_at
    BEFORE UPDATE ON pipeline_leads
    FOR EACH ROW EXECUTE FUNCTION update_pipeline_leads_updated_at();

-- Índices
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_user_id ON pipeline_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_stage ON pipeline_leads(stage);
CREATE INDEX IF NOT EXISTS idx_pipeline_leads_client_id ON pipeline_leads(client_id);
