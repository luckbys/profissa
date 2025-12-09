const axios = require('axios');
const https = require('https');
const { DOMParser } = require('@xmldom/xmldom');

// São José dos Campos NFS-e SOAP Endpoints
const ENDPOINTS = {
    homologacao: 'https://homol-notajoseense.sjc.sp.gov.br/notafiscal-ws/NotaFiscalSoap',
    producao: 'https://notajoseense.sjc.sp.gov.br/notafiscal-ws/NotaFiscalSoap'
};

// SOAP Actions - SJC WSDL indicates empty SOAPAction for RecepcionarLoteRps
const SOAP_ACTIONS = {
    recepcionarLoteRps: '',
    gerarNfse: 'http://nfse.abrasf.org.br/GerarNfse'
};

// Build cabecalho XML for ABRASF 2.04
function buildCabecalho() {
    return `<?xml version="1.0" encoding="UTF-8"?><cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.04"><versaoDados>2.04</versaoDados></cabecalho>`;
}

// Build SOAP Envelope - ABRASF Standard with Qualified Elements
function buildSoapEnvelope(xmlContent) {
    const cabecalho = buildCabecalho();

    // Namespace: http://www.abrasf.org.br/nfse.xsd
    // Operation: RecepcionarLoteRps
    // Children: nfseCabecMsg, nfseDadosMsg (Qualified per elementFormDefault="qualified")

    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://www.abrasf.org.br/nfse.xsd">
    <soap:Body>
        <ws:RecepcionarLoteRps>
            <ws:nfseCabecMsg><![CDATA[${cabecalho}]]></ws:nfseCabecMsg>
            <ws:nfseDadosMsg><![CDATA[${xmlContent}]]></ws:nfseDadosMsg>
        </ws:RecepcionarLoteRps>
    </soap:Body>
</soap:Envelope>`;
}

async function sendDPS(signedXml, certPem, keyPem, isProduction) {
    const endpoint = isProduction ? ENDPOINTS.producao : ENDPOINTS.homologacao;

    // Create HTTPS Agent with Client Certificate (mTLS)
    const agent = new https.Agent({
        cert: certPem,
        key: keyPem,
        rejectUnauthorized: false
    });

    const soapEnvelope = buildSoapEnvelope(signedXml);

    try {
        console.log(`[NFS-e] Sending SOAP to ${endpoint}...`);
        const soapAction = SOAP_ACTIONS.recepcionarLoteRps;
        console.log(`[NFS-e] SOAPAction: "${soapAction}"`);
        console.log('[NFS-e] SOAP Envelope preview:', soapEnvelope.substring(0, 500));

        const response = await axios.post(endpoint, soapEnvelope, {
            httpsAgent: agent,
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': soapAction
            },
            timeout: 60000
        });

        console.log('[NFS-e] Response Status:', response.status);
        return parseSoapResponse(response.data);

    } catch (error) {
        console.error('[NFS-e] SOAP Error:', error.message);

        if (error.response) {
            console.error('[NFS-e] Response Status:', error.response.status);
            console.error('[NFS-e] Response Data:', error.response.data);
            return parseSoapResponse(error.response.data);
        }

        return {
            sucesso: false,
            erro: error.message || 'Erro de conexão com o webservice'
        };
    }
}

function parseSoapResponse(responseData) {
    try {
        // Handle HTML error pages
        if (typeof responseData === 'string' && responseData.includes('<html')) {
            const titleMatch = responseData.match(/<title>(.*?)<\/title>/i);
            return {
                sucesso: false,
                erro: titleMatch ? titleMatch[1] : 'Erro HTML do servidor',
                raw: responseData
            };
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(responseData, 'text/xml');

        // Check for SOAP Fault
        const fault = doc.getElementsByTagName('soap:Fault')[0] || doc.getElementsByTagName('Fault')[0];
        if (fault) {
            const faultString = fault.getElementsByTagName('faultstring')[0];
            return {
                sucesso: false,
                erro: faultString ? faultString.textContent : 'Erro SOAP desconhecido',
                raw: responseData
            };
        }

        // Check for outputXML (common in ABRASF)
        const outputXml = doc.getElementsByTagName('outputXML')[0];
        if (outputXml && outputXml.textContent) {
            const innerContent = outputXml.textContent.trim();
            // Decode entities if necessary
            let decodedContent = innerContent;
            if (innerContent.includes('&lt;')) {
                decodedContent = innerContent
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"');
            }
            return parseInnerXml(decodedContent);
        }

        // Check for RecepcionarLoteRpsResult (SJC specific?)
        const resultNode = doc.getElementsByTagName('RecepcionarLoteRpsResult')[0];
        if (resultNode && resultNode.textContent) {
            const innerContent = resultNode.textContent.trim();
            if (innerContent.startsWith('<')) {
                return parseInnerXml(innerContent);
            }
        }

        // Generic fallback check
        const nfse = doc.getElementsByTagName('Nfse')[0] || doc.getElementsByTagName('CompNfse')[0];
        if (nfse) return parseInnerXml(responseData); // It's already the XML

        console.log('[NFS-e] Unrecognized structure, raw:', responseData);
        return {
            sucesso: false,
            erro: 'Estrutura de resposta não reconhecida',
            raw: responseData
        };

    } catch (error) {
        console.error('[NFS-e] Parse Error:', error.message);
        return {
            sucesso: false,
            erro: 'Erro ao processar resposta: ' + error.message,
            raw: responseData
        };
    }
}

function parseInnerXml(xmlString) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlString, 'text/xml');

        // Check for NFS-e
        const nfse = doc.getElementsByTagName('Nfse')[0] || doc.getElementsByTagName('CompNfse')[0];
        if (nfse) {
            return {
                sucesso: true,
                numero: getElementText(doc, 'Numero') || getElementText(doc, 'NumeroNfse'),
                codigo_verificacao: getElementText(doc, 'CodigoVerificacao'),
                data_emissao: getElementText(doc, 'DataEmissao'),
                linkPdf: getElementText(doc, 'LinkUrl'), // Some cities return this
                raw: xmlString
            };
        }

        // Check for protocol (Lote received)
        const protocolo = getElementText(doc, 'Protocolo');
        if (protocolo) {
            return {
                sucesso: true,
                protocolo: protocolo,
                numero_lote: getElementText(doc, 'NumeroLote'),
                mensagem: 'Lote recebido com sucesso. Aguardando processamento.',
                raw: xmlString
            };
        }

        // Check for errors
        const mensagens = doc.getElementsByTagName('MensagemRetorno');
        if (mensagens.length > 0) {
            const erros = [];
            for (let i = 0; i < mensagens.length; i++) {
                const codigo = getElementText(mensagens[i], 'Codigo');
                const mensagem = getElementText(mensagens[i], 'Mensagem');
                const correcao = getElementText(mensagens[i], 'Correcao');
                erros.push(`[${codigo}] ${mensagem}${correcao ? ' - ' + correcao : ''}`);
            }
            return {
                sucesso: false,
                erro: erros.join('\n')
            };
        }

        return {
            sucesso: false,
            erro: 'Resposta sem protocolo ou confirmação',
            raw: xmlString
        };
    } catch (e) {
        return {
            sucesso: false,
            erro: 'Erro ao processar XML interno: ' + e.message,
            raw: xmlString
        };
    }
}

function getElementText(parent, tagName) {
    if (!parent) return null;
    const elements = parent.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0].textContent : null;
}

module.exports = { sendDPS, buildSoapEnvelope, buildCabecalho };
