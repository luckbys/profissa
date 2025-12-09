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

app.post('/emit-nfse', async (req, res) => {
    try {
        const { invoiceId } = req.body;

        if (!invoiceId) {
            return res.status(400).json({ error: 'Invoice ID required' });
        }

        console.log(`Processing invoice: ${invoiceId}`);

        // 1. Fetch Invoice Data
        const { data: invoice, error: invoiceError } = await supabase
            .from('nfs_e')
            .select('*, fiscal_config!inner(*), clients(*)')
            .eq('id', invoiceId)
            .single();

        if (invoiceError || !invoice) {
            console.error('Invoice fetch error:', invoiceError);
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const config = invoice.fiscal_config;
        if (!config.certificate_path || !config.certificate_password) {
            return res.status(400).json({ error: 'Certificate not configured' });
        }

        // 2. Download Certificate
        const { data: certData, error: certError } = await supabase
            .storage
            .from('fiscal-certs')
            .download(config.certificate_path);

        if (certError) {
            console.error('Cert download error:', certError);
            return res.status(500).json({ error: 'Failed to download certificate' });
        }

        const p12Buffer = await certData.arrayBuffer();

        // 3. Construct DPS XML
        // Simplified Logic complying with ABRASF/Nacional
        const dpsId = `DPS${invoice.dps_number || Date.now()}`;
        const issueDate = new Date().toISOString().split('.')[0];

        const tomadorCpfCnpj = invoice.clients?.cpf?.replace(/\D/g, '') || '00000000000';
        const tomadorNome = invoice.clients?.name || 'Cliente Consumidor';

        // XML Template (Cleaned up)
        const xmlTemplate = `<DPS xmlns="http://www.sped.fazenda.gov.br/nfse">
    <InfDPS Id="${dpsId}">
        <DhEmi>${issueDate}</DhEmi>
        <dCompetencia>${issueDate.slice(0, 10)}</dCompetencia>
        <Prestador>
            <CpfCnpj>
                <Cnpj>00000000000000</Cnpj> -- TO BE REPLACED BY CERT CNPJ
            </CpfCnpj>
        </Prestador>
        <Tomador>
            <CpfCnpj>
                <Cpf>${tomadorCpfCnpj}</Cpf>
            </CpfCnpj>
            <xNome>${tomadorNome}</xNome>
        </Tomador>
        <Servico>
            <Valores>
                <vServ>${invoice.service_amount.toFixed(2)}</vServ>
                <vBaseCalculo>${invoice.service_amount.toFixed(2)}</vBaseCalculo>
                <vIss>${(invoice.iss_amount || 0).toFixed(2)}</vIss>
                <vLiquido>${(invoice.service_amount).toFixed(2)}</vLiquido>
            </Valores>
            <cServ>
                <cTribNac>010101</cTribNac>
                <xDescServ>Serviço Prestado</xDescServ>
                <cNbsp>00000</cNbsp>
            </cServ>
        </Servico>
    </InfDPS>
</DPS>`;

        // 4. Sign XML
        // We pass the buffer directly to our signer helper
        const { signedXml, certPem, keyPem, cpnjPrestador } = signXML(xmlTemplate, p12Buffer, config.certificate_password);

        // Inject Real CNPJ from Cert if template placeholder exists
        const finalXml = signedXml.replace('00000000000000', cpnjPrestador || '00000000000000');

        console.log('XML Signed successfully');

        // 5. Send to National API (mTLS)
        // This is the CRITICAL STEP the user wanted
        let apiResponse;
        try {
            apiResponse = await sendDPS(finalXml, certPem, keyPem, config.environment === 'production');
        } catch (transportError) {
            console.error('Transport Error:', transportError.message);
            // Even if it fails, we record the attempt
            apiResponse = {
                sucesso: false,
                erro: transportError.message || 'Erro de comunicação mTLS'
            };
        }

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
            updatePayload.url_pdf = apiResponse.linkPdf;
        } else {
            // Keep draft or set error status if logic dictates
            updatePayload.error_message = apiResponse.erro;
        }

        await supabase
            .from('nfs_e')
            .update(updatePayload)
            .eq('id', invoiceId);

        return res.json(apiResponse);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`NFS-e Service running on port ${PORT}`);
});
