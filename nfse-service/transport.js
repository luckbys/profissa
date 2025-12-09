const axios = require('axios');
const https = require('https');
const { DOMParser } = require('@xmldom/xmldom');

// Nacional NFS-e API Endpoints (Sistema Nacional de NFS-e - ADN)
// IMPORTANT: Verify these URLs against official documentation
const ENDPOINTS = {
    homologacao: {
        enviarDPS: 'https://sefin.nfse.gov.br/sefinnacional/homologacao/nfse',
        consultarNFSe: 'https://sefin.nfse.gov.br/sefinnacional/homologacao/nfse',
    },
    producao: {
        enviarDPS: 'https://sefin.nfse.gov.br/sefinnacional/nfse',
        consultarNFSe: 'https://sefin.nfse.gov.br/sefinnacional/nfse',
    }
};

async function sendDPS(signedXml, certPem, keyPem, isProduction) {
    const env = isProduction ? 'producao' : 'homologacao';
    const baseUrl = ENDPOINTS[env].enviarDPS;

    // Create HTTPS Agent with Client Certificate (mTLS)
    const agent = new https.Agent({
        cert: certPem,
        key: keyPem,
        rejectUnauthorized: false // Set to true in production with proper CA chain
    });

    try {
        console.log(`[NFS-e] Sending to ${baseUrl} (${env})...`);
        console.log('[NFS-e] XML Preview:', signedXml.substring(0, 500) + '...');

        const response = await axios.post(baseUrl, signedXml, {
            httpsAgent: agent,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Accept': 'application/xml'
            },
            timeout: 30000 // 30 seconds timeout
        });

        console.log('[NFS-e] Response Status:', response.status);
        console.log('[NFS-e] Response Data:', response.data);

        // Parse XML Response
        return parseNFSeResponse(response.data);

    } catch (error) {
        console.error('[NFS-e] Axios Error:', error.message);

        if (error.response) {
            console.error('[NFS-e] Response Status:', error.response.status);
            console.error('[NFS-e] Response Data:', error.response.data);

            // Try to parse error response
            const errorData = parseNFSeResponse(error.response.data);
            if (errorData.erro) {
                return errorData;
            }

            return {
                sucesso: false,
                erro: `API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
            };
        }

        // Network or timeout error
        return {
            sucesso: false,
            erro: error.message || 'Erro de comunicação com o servidor da SEFAZ'
        };
    }
}

function parseNFSeResponse(xmlData) {
    try {
        // If response is already an object (JSON), handle it
        if (typeof xmlData === 'object') {
            if (xmlData.sucesso === false || xmlData.erro) {
                return { sucesso: false, erro: xmlData.erro || 'Erro desconhecido' };
            }
            return xmlData;
        }

        // Parse XML
        const doc = new DOMParser().parseFromString(xmlData, 'text/xml');

        // Check for errors first
        const erroNode = doc.getElementsByTagName('xMotivo')[0] ||
            doc.getElementsByTagName('Mensagem')[0] ||
            doc.getElementsByTagName('descricao')[0];

        if (erroNode && erroNode.textContent) {
            const cStatNode = doc.getElementsByTagName('cStat')[0];
            const codigo = cStatNode ? cStatNode.textContent : 'ERRO';

            // Common success codes: 100, 104, etc.
            if (codigo === '100' || codigo === '104') {
                // Success - continue to extract data
            } else {
                return {
                    sucesso: false,
                    erro: `[${codigo}] ${erroNode.textContent}`
                };
            }
        }

        // Extract success data
        const numeroNFSe = getNodeText(doc, 'NumeroNFSe') ||
            getNodeText(doc, 'Numero') ||
            getNodeText(doc, 'nNFSe');

        const codigoVerificacao = getNodeText(doc, 'CodigoVerificacao') ||
            getNodeText(doc, 'CodVerif');

        const linkPdf = getNodeText(doc, 'LinkNFSe') ||
            getNodeText(doc, 'link') ||
            getNodeText(doc, 'urlPdf');

        const chaveNFSe = getNodeText(doc, 'ChNFSe') ||
            getNodeText(doc, 'chave');

        // If we got a numero, it's a success
        if (numeroNFSe) {
            return {
                sucesso: true,
                numero: numeroNFSe,
                codigoVerificacao: codigoVerificacao || '',
                linkPdf: linkPdf || '',
                chaveNFSe: chaveNFSe || '',
                raw: xmlData
            };
        }

        // Check for authorization indicators
        const autorizadaNode = doc.getElementsByTagName('NFSe')[0];
        if (autorizadaNode) {
            return {
                sucesso: true,
                numero: 'AUTORIZADA',
                codigoVerificacao: '',
                linkPdf: '',
                raw: xmlData
            };
        }

        // Fallback - can't determine success
        return {
            sucesso: false,
            erro: 'Resposta não reconhecida do servidor',
            raw: xmlData
        };

    } catch (parseError) {
        console.error('[NFS-e] Parse Error:', parseError.message);
        return {
            sucesso: false,
            erro: 'Erro ao processar resposta: ' + parseError.message,
            raw: xmlData
        };
    }
}

function getNodeText(doc, tagName) {
    const node = doc.getElementsByTagName(tagName)[0];
    return node ? node.textContent : null;
}

module.exports = { sendDPS, parseNFSeResponse };
