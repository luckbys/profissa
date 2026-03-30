const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();

const AUTH_URL = 'https://auth.nuvemfiscal.com.br/oauth/token';
const API_PROD_URL = 'https://api.nuvemfiscal.com.br';
const API_SANDBOX_URL = 'https://api.sandbox.nuvemfiscal.com.br';

let cachedToken = null;
let tokenExpiration = null;

async function authenticate() {
    if (cachedToken && tokenExpiration && new Date() < tokenExpiration) {
        return cachedToken;
    }

    const clientId = process.env.NUVEM_CLIENT_ID;
    const clientSecret = process.env.NUVEM_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Nuvem Fiscal credentials (NUVEM_CLIENT_ID/NUVEM_CLIENT_SECRET) não configurados.');
    }

    try {
        const response = await axios.post(
            AUTH_URL,
            qs.stringify({
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
                scope: 'nfse'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token, expires_in } = response.data;
        cachedToken = access_token;
        // Cache token with 5-minute buffer before actual expiry
        tokenExpiration = new Date(new Date().getTime() + (expires_in - 300) * 1000);

        console.log('[Nuvem Fiscal] Autenticado com sucesso');
        return cachedToken;
    } catch (error) {
        console.error('[Nuvem Fiscal] Erro de autenticação:', error.response?.data || error.message);
        throw new Error('Falha ao autenticar com Nuvem Fiscal: ' + (error.response?.data?.error_description || error.message));
    }
}

async function emitirNfse(data, isProduction = false) {
    const token = await authenticate();
    const apiUrl = isProduction ? API_PROD_URL : API_SANDBOX_URL;

    const payload = mapToDPS(data, isProduction);

    console.log('[Nuvem Fiscal] Enviando DPS para', isProduction ? 'PRODUÇÃO' : 'SANDBOX');
    console.log('[Nuvem Fiscal] Payload DPS:', JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(
            `${apiUrl}/nfse/dps`,
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
        const apiError = error.response?.data;
        console.error('[Nuvem Fiscal] Erro na emissão:', JSON.stringify(apiError, null, 2) || error.message);

        // Extract most meaningful error message from Nuvem Fiscal response
        let mensagemErro = error.message;
        if (apiError) {
            if (apiError.message) mensagemErro = apiError.message;
            else if (apiError.error?.message) mensagemErro = apiError.error.message;
            else if (apiError.errors?.length) mensagemErro = apiError.errors.map(e => e.message || e).join('; ');
        }

        return {
            sucesso: false,
            erro: mensagemErro,
            details: apiError
        };
    }
}

async function consultarNfse(nuvemId, isProduction = false) {
    const token = await authenticate();
    const apiUrl = isProduction ? API_PROD_URL : API_SANDBOX_URL;

    try {
        const response = await axios.get(
            `${apiUrl}/nfse/${nuvemId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        return {
            sucesso: true,
            data: response.data
        };

    } catch (error) {
        const apiError = error.response?.data;
        console.error('[Nuvem Fiscal] Erro na consulta:', JSON.stringify(apiError, null, 2) || error.message);
        return {
            sucesso: false,
            erro: apiError?.message || apiError?.error?.message || error.message
        };
    }
}

function mapToDPS(data, isProduction) {
    const { invoice, config } = data;

    const prestadorCnpj = config.cnpj?.replace(/\D/g, '') || '';
    const inscMunicipal = config.inscricao_municipal || '';
    const codigoMunicipio = config.codigo_municipio || '3549904';

    // Tomador (cliente)
    const tomadorCpfCnpj = (invoice.clients?.cpf || invoice.clients?.cnpj || '').replace(/\D/g, '');
    const tomadorNome = invoice.clients?.name || 'Consumidor Final';
    const tomadorEmail = invoice.clients?.email || '';

    // Address fields - use empty string rather than fake placeholders
    const logradouro = invoice.clients?.address || '';
    const numero = invoice.clients?.number || 'S/N';
    const complemento = invoice.clients?.complement || '';
    const bairro = invoice.clients?.neighborhood || '';
    const cepCliente = invoice.clients?.zip_code?.replace(/\D/g, '') || '';
    const codigoMunicipioCliente = invoice.clients?.city_code || codigoMunicipio;

    // Build tomador end (address) - only include if we have the required fields
    const endNacObj = { cMun: codigoMunicipioCliente };
    if (cepCliente) endNacObj.CEP = cepCliente;

    const endObj = { endNac: endNacObj };
    if (logradouro) endObj.xLgr = logradouro;
    endObj.nro = numero;
    if (bairro) endObj.xBairro = bairro;
    if (complemento) endObj.xCpl = complemento;

    const tomaObj = {
        xNome: tomadorNome,
        end: endObj
    };

    // Only add CPF/CNPJ if valid
    if (tomadorCpfCnpj.length === 14) {
        tomaObj.CNPJ = tomadorCpfCnpj;
    } else if (tomadorCpfCnpj.length === 11) {
        tomaObj.CPF = tomadorCpfCnpj;
    }

    if (tomadorEmail) tomaObj.email = tomadorEmail;

    // Service values
    const valorServico = Number(invoice.service_amount || 0);
    // aliquota_iss stored as percentage (e.g. 2.5 = 2.5%)
    const aliquotaIssPerc = Number(config.aliquota_iss || 2);
    const aliquotaIssDecimal = aliquotaIssPerc / 100; // e.g. 0.025

    const vISSQN = Number((valorServico * aliquotaIssDecimal).toFixed(2));
    const vLiq = Number((valorServico - vISSQN).toFixed(2));

    // Service codes
    // codigo_tributacao_nacional = LC 116 national code (e.g. "01.01")
    // codigo_servico = municipal service code (e.g. "0101")
    const codigoTribNacional = config.codigo_tributacao_nacional || config.codigo_servico || '01.01';
    const codigoTribMunicipal = config.codigo_servico_municipal || codigoTribNacional.replace('.', '');

    const serviceDescription = invoice.description || invoice.service_description || 'Serviços Prestados';

    // Build prestador object
    const prestObj = { CNPJ: prestadorCnpj };
    if (inscMunicipal) prestObj.IM = inscMunicipal;

    return {
        provedor: 'padrao',
        ambiente: isProduction ? 'producao' : 'homologacao',
        referencia: invoice.id,
        infDPS: {
            tpAmb: isProduction ? 1 : 2,
            dhEmi: new Date().toISOString(),
            dCompet: new Date().toISOString().split('T')[0],
            nDPS: invoice.dps_number || 1,
            serie: invoice.dps_series || 'E',
            prest: prestObj,
            toma: tomaObj,
            serv: {
                locPrest: {
                    cLocPrestacao: codigoMunicipio
                },
                cServ: {
                    cTribNac: codigoTribNacional,
                    cTribMun: codigoTribMunicipal,
                    xDescServ: serviceDescription
                }
            },
            valores: {
                vServPrest: {
                    vServ: valorServico
                },
                trib: {
                    totTrib: {
                        // Include estimated taxes for transparency
                        pTotTrib: aliquotaIssPerc,
                        vTotTrib: vISSQN
                    },
                    tribMun: {
                        tribISSQN: 1, // 1 = Operação Tributável
                        cLocIncid: codigoMunicipio,
                        pAliq: aliquotaIssDecimal,
                        tpRetISSQN: 2, // 2 = Não Retido
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
