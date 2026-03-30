const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PORT = process.env.PORT || 4000;

// ─── Auth Middleware ───────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ sucesso: false, erro: 'Authorization header ausente' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ sucesso: false, erro: 'Bearer token ausente' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ sucesso: false, erro: 'Token inválido ou expirado' });

    req.user = user;
    next();
}

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Emit NFS-e ───────────────────────────────────────────────────────────────
app.post('/emit-nfse', requireAuth, async (req, res) => {
    const { invoiceId } = req.body;
    const user = req.user;

    if (!invoiceId) {
        return res.status(400).json({ sucesso: false, erro: 'invoiceId é obrigatório' });
    }

    try {
        console.log(`[NFS-e] Processando nota ${invoiceId} para usuário ${user.id}`);

        // 1. Fetch invoice (enforce ownership)
        const { data: invoice, error: invoiceError } = await supabase
            .from('nfs_e')
            .select('*, clients(*)')
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .single();

        if (invoiceError || !invoice) {
            console.error('[NFS-e] Nota não encontrada:', invoiceError);
            return res.status(404).json({ sucesso: false, erro: 'Nota fiscal não encontrada ou acesso negado' });
        }

        // Block re-emission of already authorized notes
        if (invoice.status === 'authorized') {
            return res.status(400).json({ sucesso: false, erro: 'Esta nota fiscal já foi autorizada. Número: ' + invoice.nfse_number });
        }

        // 2. Fetch fiscal config
        const { data: fiscalConfig, error: configError } = await supabase
            .from('fiscal_config')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (configError || !fiscalConfig) {
            console.error('[NFS-e] Config fiscal não encontrada:', configError);
            return res.status(400).json({ sucesso: false, erro: 'Configuração fiscal não encontrada. Configure em Perfil > Notas Fiscais.' });
        }

        // Validate required fiscal config fields
        if (!fiscalConfig.cnpj) {
            return res.status(400).json({ sucesso: false, erro: 'CNPJ não configurado. Acesse Perfil > Notas Fiscais.' });
        }
        if (!fiscalConfig.inscricao_municipal) {
            return res.status(400).json({ sucesso: false, erro: 'Inscrição Municipal não configurada. Acesse Perfil > Notas Fiscais.' });
        }
        if (!fiscalConfig.codigo_municipio) {
            return res.status(400).json({ sucesso: false, erro: 'Código do Município não configurado. Acesse Perfil > Notas Fiscais.' });
        }

        // 3. Auto-assign DPS number if not set
        if (!invoice.dps_number) {
            const { data: lastInvoice } = await supabase
                .from('nfs_e')
                .select('dps_number')
                .eq('user_id', user.id)
                .not('dps_number', 'is', null)
                .order('dps_number', { ascending: false })
                .limit(1)
                .single();

            const nextDpsNumber = (lastInvoice?.dps_number || 0) + 1;

            await supabase
                .from('nfs_e')
                .update({ dps_number: nextDpsNumber })
                .eq('id', invoiceId);

            invoice.dps_number = nextDpsNumber;
        }

        // 4. Set status to pending before emission
        await supabase
            .from('nfs_e')
            .update({ status: 'pending', updated_at: new Date().toISOString() })
            .eq('id', invoiceId);

        // 5. Call Nuvem Fiscal
        const { emitirNfse } = require('./nuvem');
        const isProduction = fiscalConfig.environment === 'production';
        const nuvemResponse = await emitirNfse({ invoice, config: fiscalConfig }, isProduction);

        console.log('[NFS-e] Resposta Nuvem Fiscal:', JSON.stringify(nuvemResponse, null, 2));

        // 6. Update database with result
        const updatePayload = {
            updated_at: new Date().toISOString()
        };

        if (nuvemResponse.sucesso) {
            const data = nuvemResponse.data;
            // Map Nuvem Fiscal status to internal status
            if (data.status === 'autorizada') {
                updatePayload.status = 'authorized';
            } else if (data.status === 'rejeitada' || data.status === 'erro' || data.status === 'negada') {
                updatePayload.status = 'rejected';
                const mensagens = data.mensagens || [];
                updatePayload.error_message = mensagens[0]?.descricao || 'NFS-e rejeitada pela prefeitura';
            } else {
                // processando or other - stays pending
                updatePayload.status = 'pending';
            }
            updatePayload.nfse_number = data.numero || null;
            updatePayload.auth_code = data.codigo_verificacao || null;
            updatePayload.url_pdf = data.link_url || null;
            updatePayload.xml_return = JSON.stringify(data);
            updatePayload.nuvem_id = data.id || null;
        } else {
            updatePayload.status = 'rejected';
            updatePayload.error_message = nuvemResponse.erro || 'Erro desconhecido na Nuvem Fiscal';
            updatePayload.xml_return = JSON.stringify(nuvemResponse);
        }

        const { error: dbError } = await supabase
            .from('nfs_e')
            .update(updatePayload)
            .eq('id', invoiceId);

        if (dbError) {
            console.error('[NFS-e] Erro ao atualizar DB:', dbError);
        }

        return res.json(nuvemResponse);

    } catch (error) {
        console.error('[NFS-e] Erro interno:', error);
        res.status(500).json({ sucesso: false, erro: error.message || 'Erro interno do servidor' });
    }
});

// ─── Check NFS-e Status ────────────────────────────────────────────────────────
app.post('/check-status', requireAuth, async (req, res) => {
    const { invoiceId } = req.body;
    const user = req.user;

    if (!invoiceId) {
        return res.status(400).json({ sucesso: false, erro: 'invoiceId é obrigatório' });
    }

    try {
        // Fetch invoice (enforce ownership)
        const { data: invoice, error: invoiceError } = await supabase
            .from('nfs_e')
            .select('nuvem_id, status, user_id')
            .eq('id', invoiceId)
            .eq('user_id', user.id)
            .single();

        if (invoiceError || !invoice) {
            return res.status(404).json({ sucesso: false, erro: 'Nota fiscal não encontrada ou acesso negado' });
        }

        // If already in a final state, return current status directly
        if (invoice.status === 'authorized' || invoice.status === 'cancelled') {
            return res.json({ sucesso: true, status: invoice.status });
        }

        if (!invoice.nuvem_id) {
            return res.json({ sucesso: false, erro: 'Nota ainda não foi enviada para Nuvem Fiscal' });
        }

        // Fetch fiscal config to know environment
        const { data: fiscalConfig } = await supabase
            .from('fiscal_config')
            .select('environment')
            .eq('user_id', user.id)
            .single();

        const isProduction = fiscalConfig?.environment === 'production';

        const { consultarNfse } = require('./nuvem');
        const consultaResponse = await consultarNfse(invoice.nuvem_id, isProduction);

        if (!consultaResponse.sucesso) {
            return res.json(consultaResponse);
        }

        const data = consultaResponse.data;
        const updatePayload = { updated_at: new Date().toISOString() };

        if (data.status === 'autorizada') {
            updatePayload.status = 'authorized';
            updatePayload.nfse_number = data.numero || null;
            updatePayload.auth_code = data.codigo_verificacao || null;
            updatePayload.url_pdf = data.link_url || null;
            updatePayload.xml_return = JSON.stringify(data);
        } else if (data.status === 'rejeitada' || data.status === 'erro' || data.status === 'negada') {
            updatePayload.status = 'rejected';
            const mensagens = data.mensagens || [];
            updatePayload.error_message = mensagens[0]?.descricao || 'NFS-e rejeitada pela prefeitura';
            updatePayload.xml_return = JSON.stringify(data);
        }

        if (Object.keys(updatePayload).length > 1) {
            await supabase
                .from('nfs_e')
                .update(updatePayload)
                .eq('id', invoiceId);
        }

        const mensagens = data.mensagens || [];
        const primeiroErro = mensagens[0]?.descricao || null;
        const codigoErro = mensagens[0]?.codigo || null;

        return res.json({
            sucesso: true,
            status: data.status,
            numero: data.numero,
            link_url: data.link_url,
            codigo_verificacao: data.codigo_verificacao,
            mensagem: primeiroErro,
            codigo_erro: codigoErro,
            todas_mensagens: mensagens
        });

    } catch (error) {
        console.error('[NFS-e] Erro ao verificar status:', error);
        res.status(500).json({ sucesso: false, erro: error.message || 'Erro interno do servidor' });
    }
});

app.listen(PORT, () => {
    console.log(`[NFS-e] Serviço rodando na porta ${PORT}`);
    console.log(`[NFS-e] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
