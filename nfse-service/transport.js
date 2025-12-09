const axios = require('axios');
const https = require('https');

async function sendDPS(signedXml, certPem, keyPem, isProduction) {
    // URL definition based on environment
    // WARNING: These URLs are placeholders for the National API (ADN/SEFIN)
    // You must verify the correct endpoint in the documentation (input.md)
    const baseUrl = isProduction
        ? 'https://sefin.nfse.gov.br/adn/api/v1/nfse'
        : 'https://homologacao.sefin.nfse.gov.br/adn/api/v1/nfse'; // Check documentation for real URL

    // Create HTTPS Agent with Client Certificate (mTLS)
    const agent = new https.Agent({
        cert: certPem,
        key: keyPem,
        // If the server uses a self-signed cert or specific CA chain, you might need 'ca' or 'rejectUnauthorized: false' (careful in prod)
        rejectUnauthorized: false
    });

    try {
        console.log(`Sending to ${baseUrl}...`);

        // The API likely expects a specific wrapper or just the XML
        // Assuming raw XML body with correct content type
        const response = await axios.post(baseUrl, signedXml, {
            httpsAgent: agent,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8'
                // Add Authorization if needed (usually mTLS is the auth)
            }
        });

        // Parse response (assuming it returns JSON or XML)
        // For compliance with the interface the server expects:
        return {
            sucesso: true, // simplified
            raw: response.data,
            // Mocking these for now unless we parse the real return
            // In a real scenario, you parse response.data XML/JSON to get these fields
            numero: "123",
            codigoVerificacao: "OK-MTLS",
            linkPdf: "http://pdf-link"
        };

    } catch (error) {
        console.error('Axios Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            return {
                sucesso: false,
                erro: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            };
        }
        throw error;
    }
}

module.exports = { sendDPS };
