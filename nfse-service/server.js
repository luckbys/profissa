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

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/emit-nfse', async (req, res) => {
    try {
        const { invoiceId } = req.body;

        if (!invoiceId) {
            return res.status(400).json({ sucesso: false, erro: 'Invoice ID required' });
        }

        console.log(`[NFS-e] Processing invoice: ${invoiceId}`);

        // 1. Fetch Invoice Data with related tables
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
            return res.status(400).json({ sucesso: false, erro: 'Configuração fiscal não encontrada. Configure seu certificado digital em Configurações > Notas Fiscais.' });
        }

        const config = fiscalConfig;
        if (!config.certificate_path || !config.certificate_password) {
            return res.status(400).json({ sucesso: false, erro: 'Certificado digital não configurado' });
        }

        // 2. Download Certificate from Supabase Storage
        const { data: certData, error: certError } = await supabase
            .storage
            .from('fiscal-certs')
            .download(config.certificate_path);

        if (certError) {
            console.error('[NFS-e] Cert download error:', certError);
            return res.status(500).json({ sucesso: false, erro: 'Falha ao baixar certificado digital' });
        }

        const p12Buffer = await certData.arrayBuffer();

        // 3. Build XML based on ABRASF/Nacional standard
        const dpsId = `DPS${invoice.rps_number || Date.now()}`;
        const issueDate = new Date().toISOString().split('.')[0];
        const competencia = issueDate.slice(0, 10);

        // Client data
        const tomadorCpfCnpj = invoice.clients?.cpf?.replace(/\D/g, '') || '';
        const tomadorNome = invoice.clients?.name || 'Consumidor Final';
        const isCnpj = tomadorCpfCnpj.length === 14;

        // Provider data from config
        const prestadorCnpj = config.cnpj?.replace(/\D/g, '') || '';
        const inscMunicipal = config.inscricao_municipal || '';
        const codigoMunicipio = config.codigo_municipio || '3550308'; // Default: São Paulo

        // Service data
        const valorServico = (invoice.service_amount || 0).toFixed(2);
        const aliquotaISS = (config.aliquota_iss || 5).toFixed(2);
        const valorISS = ((invoice.service_amount || 0) * (config.aliquota_iss || 5) / 100).toFixed(2);
        const descricaoServico = invoice.description || 'Prestação de Serviço';
        const codigoServico = config.codigo_servico || '0107'; // Default: IT services
        const codigoTributacaoNacional = config.codigo_tributacao_nacional || '010101';

        // Build XML (Sistema Nacional de NFS-e compliant)
        const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
    <infDPS Id="${dpsId}">
        <tpAmb>${config.environment === 'production' ? '1' : '2'}</tpAmb>
        <dhEmi>${issueDate}</dhEmi>
        <verAplic>PROFISSA-1.0</verAplic>
        <dCompet>${competencia}</dCompet>
        <prest>
            <CNPJ>${prestadorCnpj}</CNPJ>
            <IM>${inscMunicipal}</IM>
        </prest>
        <toma>
            ${isCnpj ? `<CNPJ>${tomadorCpfCnpj}</CNPJ>` : `<CPF>${tomadorCpfCnpj}</CPF>`}
            <xNome>${escapeXml(tomadorNome)}</xNome>
        </toma>
        <serv>
            <locPrest>
                <cMun>${codigoMunicipio}</cMun>
            </locPrest>
            <cServ>
                <cTribNac>${codigoTributacaoNacional}</cTribNac>
                <cTribMun>${codigoServico}</cTribMun>
                <xDescServ>${escapeXml(descricaoServico)}</xDescServ>
            </cServ>
            <vServ>${valorServico}</vServ>
        </serv>
        <valores>
            <vServPrest>
                <vReceb>${valorServico}</vReceb>
            </vServPrest>
            <trib>
                <tribMun>
                    <tribISSQN>1</tribISSQN>
                    <cLocIncworking>${codigoMunicipio}</cLocIncworking>
                    <pAliq>${aliquotaISS}</pAliq>
                    <tpRetISSQN>1</tpRetISSQN>
                </tribMun>
                <totTrib>
                    <vTotTribFed>0.00</vTotTribFed>
                    <vTotTribEst>0.00</vTotTribEst>
                    <vTotTribMun>${valorISS}</vTotTribMun>
                </totTrib>
            </trib>
        </valores>
    </infDPS>
</DPS>`;

        // 4. Sign XML
        const { signedXml, certPem, keyPem, cpnjPrestador } = signXML(
            xmlTemplate,
            Buffer.from(p12Buffer),
            config.certificate_password
        );

        // Use CNPJ from certificate if not configured
        const finalCnpj = prestadorCnpj || cpnjPrestador;
        const finalXml = signedXml.replace(/<CNPJ><\/CNPJ>/g, `<CNPJ>${finalCnpj}</CNPJ>`);

        console.log('[NFS-e] XML Signed successfully');

        // 5. Send to API (mTLS)
        const isProduction = config.environment === 'production';
        const apiResponse = await sendDPS(finalXml, certPem, keyPem, isProduction);

        console.log('[NFS-e] API Response:', apiResponse);

        // 6. Update Database
        const updatePayload = {
            xml_sent: finalXml,
            xml_return: JSON.stringify(apiResponse),
            updated_at: new Date().toISOString()
        };

        if (apiResponse.sucesso) {
            updatePayload.status = 'authorized';
            updatePayload.nfse_number = apiResponse.numero;
            updatePayload.auth_code = apiResponse.codigoVerificacao;
            updatePayload.url_pdf = apiResponse.linkPdf || null;
            updatePayload.chave_nfse = apiResponse.chaveNFSe || null;
        } else {
            updatePayload.status = 'error';
            updatePayload.error_message = apiResponse.erro;
        }

        await supabase
            .from('nfs_e')
            .update(updatePayload)
            .eq('id', invoiceId);

        return res.json(apiResponse);

    } catch (error) {
        console.error('[NFS-e] Server Error:', error);
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
    console.log('[NFS-e] Environment:', process.env.NODE_ENV || 'development');
});
