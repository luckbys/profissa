const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();

const AUTH_URL = 'https://auth.nuvemfiscal.com.br/oauth/token';
const API_BASE_URL = 'https://api.nuvemfiscal.com.br'; // Production
const API_SANDBOX_URL = 'https://api.sandbox.nuvemfiscal.com.br'; // Sandbox - VERIFY correct URL

// Note: Nuvem Fiscal usually uses the same auth endpoint but different API base for sandbox?
// Actually documentation says: "https://auth.nuvemfiscal.com.br/oauth/token"
// And API: "https://api.nuvemfiscal.com.br"
// For testing, we might need to check if there is a specific sandbox URL or if we just use "ambiente": "homologacao" in payload.
// Documentation says: "ambiente": "homologacao" in the payload directs it to sandbox? 
// Or usually API is `https://api.nuvemfiscal.com.br`. The "ambiente" field in JSON controls destination.

let cachedToken = null;
let tokenExpiration = null;

async function authenticate() {
    if (cachedToken && tokenExpiration && new Date() < tokenExpiration) {
        return cachedToken;
    }

    const clientId = process.env.NUVEM_CLIENT_ID;
    const clientSecret = process.env.NUVEM_CLIENT_SECRET;
    const scope = 'nfse'; // Check docs if scope is needed, usually 'nfse' or 'empresa'

    if (!clientId || !clientSecret) {
        throw new Error('Nuvem Fiscal credentials (CLIENT_ID/SECRET) not configured.');
    }

    try {
        const response = await axios.post(
            AUTH_URL,
            qs.stringify({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: scope
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, expires_in } = response.data;
        cachedToken = access_token;
        // Set expiration 5 minutes before actual expiry to be safe
        tokenExpiration = new Date(new Date().getTime() + (expires_in - 300) * 1000);

        console.log('[Nuvem Fiscal] Authenticated successfully');
        return cachedToken;
    } catch (error) {
        console.error('[Nuvem Fiscal] Auth Error:', error.response?.data || error.message);
        throw new Error('Failed to authenticate with Nuvem Fiscal');
    }
}

async function emitirNfse(data, isProduction = false) {
    const token = await authenticate();

    // Map internal data to Nuvem Fiscal DPS JSON
    const payload = mapToDPS(data, isProduction);

    console.log('[Nuvem Fiscal] Sending DPS Payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(
            `${API_BASE_URL}/nfse/dps`,
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            sucesso: true,
            data: response.data
        };

    } catch (error) {
        console.error('[Nuvem Fiscal] Emission Error:', JSON.stringify(error.response?.data, null, 2) || error.message);
        return {
            sucesso: false,
            erro: error.response?.data?.error?.message || error.response?.data?.message || error.message,
            details: error.response?.data
        };
    }
}

async function consultarNfse(nuvemId) {
    const token = await authenticate();

    try {
        const response = await axios.get(
            `${API_BASE_URL}/nfse/${nuvemId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('[Nuvem Fiscal] Consulta Response:', JSON.stringify(response.data, null, 2));

        return {
            sucesso: true,
            data: response.data
        };

    } catch (error) {
        console.error('[Nuvem Fiscal] Consulta Error:', JSON.stringify(error.response?.data, null, 2) || error.message);
        return {
            sucesso: false,
            erro: error.response?.data?.error?.message || error.response?.data?.message || error.message
        };
    }
}

function mapToDPS(data, isProduction) {
    // data contains: invoice, config, tomador details
    const { invoice, config } = data;

    const prestadorCnpj = config.cnpj?.replace(/\D/g, '') || '';
    const inscMunicipal = config.inscricao_municipal || '';

    // Address mapping - SJC is 3549904
    const codigoMunicipio = config.codigo_municipio || '3549904';

    const tomadorCpfCnpj = invoice.clients?.cpf?.replace(/\D/g, '') || '';
    const tomadorNome = invoice.clients?.name || 'Consumidor Final';
    const tomadorEmail = invoice.clients?.email || '';

    // Basic address fallback if not present on client
    const tomadorEndereco = {
        xLgr: invoice.clients?.address || 'Rua do Cliente',
        nro: invoice.clients?.number || 'S/N',
        xCpl: invoice.clients?.complement || '',
        xBairro: invoice.clients?.neighborhood || 'Centro',
        cMun: invoice.clients?.city_code || codigoMunicipio,
        CEP: invoice.clients?.zip_code?.replace(/\D/g, '') || '12200000'
    };

    // Build tomador object - only include CPF/CNPJ if present
    const tomaObj = {
        xNome: tomadorNome,
        end: {
            endNac: {
                cMun: tomadorEndereco.cMun,
                CEP: tomadorEndereco.CEP
            },
            xLgr: tomadorEndereco.xLgr,
            nro: tomadorEndereco.nro,
            xBairro: tomadorEndereco.xBairro
        }
    };

    // Only add CPF/CNPJ if valid length
    if (tomadorCpfCnpj.length === 14) {
        tomaObj.CNPJ = tomadorCpfCnpj;
    } else if (tomadorCpfCnpj.length === 11) {
        tomaObj.CPF = tomadorCpfCnpj;
    }

    // Add optional fields
    if (tomadorEmail) tomaObj.email = tomadorEmail;
    if (tomadorEndereco.xCpl) tomaObj.end.xCpl = tomadorEndereco.xCpl;

    // Calculate ISS values
    const valorServico = Number(invoice.service_amount || 0);
    const aliquotaIss = Number(config.aliquota_iss || 2); // Stored as percentage (2 = 2%)

    // Round to 2 decimals to match API requirements
    const vISSQN = Number((valorServico * (aliquotaIss / 100)).toFixed(2));
    const vLiq = Number((valorServico - vISSQN).toFixed(2));

    return {
        provedor: "padrao",
        ambiente: isProduction ? "producao" : "homologacao",
        referencia: invoice.id,
        infDPS: {
            tpAmb: isProduction ? 1 : 2,
            dhEmi: new Date().toISOString(),
            dCompet: new Date().toISOString().split('T')[0],
            prest: {
                CNPJ: prestadorCnpj
            },
            toma: tomaObj,
            serv: {
                locPrest: {
                    cLocPrestacao: codigoMunicipio
                },
                cServ: {
                    cTribNac: config.codigo_servico || '01.03',
                    xDescServ: invoice.description || 'Serviços Prestados'
                }
            },
            valores: {
                vServPrest: {
                    vServ: valorServico
                },
                trib: {
                    tribMun: {
                        tribISSQN: 1, // 1 = Operação Tributável
                        pAliq: aliquotaIss / 100, // Convert to decimal (0.02 = 2%)
                        tpRetISSQN: 2, // 2 = Não Retido
                        cLocIncid: codigoMunicipio,
                        vBC: valorServico,
                        vISSQN: vISSQN,
                        vLiq: vLiq
                    }
                }
            }
        }
    };
}

module.exports = { emitirNfse, consultarNfse, authenticate };
