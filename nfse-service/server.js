const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { signXML } = require('./signer');
const { sendDPS } = require('./transport');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PORT = process.env.PORT || 4000;

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Emit NFS-e endpoint
app.post('/emit-nfse', async (req, res) => {
    const { invoiceId } = req.body;

    if (!invoiceId) {
        return res.status(400).json({ sucesso: false, erro: 'invoiceId is required' });
    }

    console.log(`[NFS-e] Processing invoice with Nuvem Fiscal: ${invoiceId}`);

    try {
        // 1. Fetch Invoice Data
        const { data: invoice, error: invoiceError } = await supabase
            .from('nfs_e')
            .select('*, clients(*)')
            .eq('id', invoiceId)
            .single();

        if (invoiceError || !invoice) {
            console.error('[NFS-e] Invoice fetch error:', invoiceError);
            return res.status(404).json({ sucesso: false, erro: 'Nota fiscal não encontrada' });
        }

        // Fetch fiscal_config separately
        const { data: fiscalConfig, error: configError } = await supabase
            .from('fiscal_config')
            .select('*')
            .eq('user_id', invoice.user_id)
            .single();

        if (configError || !fiscalConfig) {
            console.error('[NFS-e] Fiscal config not found:', configError);
            return res.status(400).json({ sucesso: false, erro: 'Configuração fiscal não encontrada. Configure em Perfil > Notas Fiscais.' });
        }

        const config = fiscalConfig;

        // 2. Call Nuvem Fiscal Service
        // Note: We skip local certificate download/signing as Nuvem Fiscal handles it (Cert must be formatted/uploaded there or we add an upload step later)
        // For now, we assume the user configured their company on Nuvem Dashboard.

        // Load nuvem service dynamically or at top
        const { emitirNfse } = require('./nuvem');

        const isProduction = config.environment === 'production';
        const nuvemResponse = await emitirNfse({ invoice, config }, isProduction);

        console.log('[NFS-e] Nuvem Fiscal Response:', nuvemResponse);

        // 3. Update Database with Result
        const updatePayload = {
            updated_at: new Date().toISOString()
        };

        if (nuvemResponse.sucesso) {
            const data = nuvemResponse.data;
            updatePayload.status = data.status === 'autorizada' ? 'authorized' : 'pending';
            updatePayload.nfse_number = data.numero || null;
            updatePayload.auth_code = data.codigo_verificacao || null;
            updatePayload.url_pdf = data.link_url || null;
            updatePayload.xml_return = JSON.stringify(data);
            // Store Nuvem Fiscal ID for status polling
            updatePayload.nuvem_id = data.id || null;
        } else {
            updatePayload.status = 'rejected';
            updatePayload.error_message = nuvemResponse.erro || 'Erro desconhecido na Nuvem Fiscal';
            updatePayload.xml_return = JSON.stringify(nuvemResponse); // Store full error for debug
        }

        const { error: dbError } = await supabase
            .from('nfs_e')
            .update(updatePayload)
            .eq('id', invoiceId);

        if (dbError) {
            console.error('[NFS-e] DB Update Error:', dbError);
        }

        return res.json(nuvemResponse);

    } catch (error) {
        console.error('[NFS-e] Server Error:', error);
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});

// Check NFS-e status endpoint (for polling processing status)
app.post('/check-status', async (req, res) => {
    const { invoiceId } = req.body;

    if (!invoiceId) {
        return res.status(400).json({ sucesso: false, erro: 'invoiceId is required' });
    }

    try {
        // Fetch invoice to get Nuvem ID
        const { data: invoice, error: invoiceError } = await supabase
            .from('nfs_e')
            .select('nuvem_id, status')
            .eq('id', invoiceId)
            .single();

        if (invoiceError || !invoice) {
            return res.status(404).json({ sucesso: false, erro: 'Nota fiscal não encontrada' });
        }

        // If already authorized or error, return current status
        if (invoice.status === 'authorized' || invoice.status === 'error') {
            return res.json({ sucesso: true, status: invoice.status });
        }

        // If no Nuvem ID, can't check
        if (!invoice.nuvem_id) {
            return res.json({ sucesso: false, erro: 'Nota ainda não foi enviada para Nuvem Fiscal' });
        }

        // Query Nuvem Fiscal for current status
        const { consultarNfse } = require('./nuvem');
        const consultaResponse = await consultarNfse(invoice.nuvem_id);

        if (!consultaResponse.sucesso) {
            return res.json(consultaResponse);
        }

        const data = consultaResponse.data;
        const updatePayload = {
            updated_at: new Date().toISOString()
        };

        // Map Nuvem status to our status
        if (data.status === 'autorizada') {
            updatePayload.status = 'authorized';
            updatePayload.nfse_number = data.numero || null;
            updatePayload.auth_code = data.codigo_verificacao || null;
            updatePayload.url_pdf = data.link_url || null;
            updatePayload.xml_return = JSON.stringify(data);
        } else if (data.status === 'rejeitada' || data.status === 'erro' || data.status === 'negada') {
            updatePayload.status = 'rejected';
            updatePayload.error_message = data.mensagens?.[0]?.descricao || 'NFS-e rejeitada pela prefeitura';
            updatePayload.xml_return = JSON.stringify(data);
        }
        // If still processing, don't update status

        await supabase
            .from('nfs_e')
            .update(updatePayload)
            .eq('id', invoiceId);

        // Extract error messages if present
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
        console.error('[NFS-e] Check Status Error:', error);
        res.status(500).json({ sucesso: false, erro: error.message });
    }
});

// Helper function
function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

app.listen(PORT, () => {
    console.log(`[NFS-e] Service running on port ${PORT}`);
    console.log(`[NFS-e] Environment: ${process.env.NODE_ENV || 'development'}`);
});
