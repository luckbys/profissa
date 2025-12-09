const forge = require('node-forge');
const { SignedXml } = require('xml-crypto');

function signXML(xml, p12Buffer, password) {
    // 1. Parse P12
    const p12Der = forge.util.createBuffer(p12Buffer);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    // 2. Extract Key and Cert
    let keyBag = null;
    let certBag = null;

    // Search for bags with key and cert
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

    if (!keyBag) {
        const keyBagsSimple = p12.getBags({ bagType: forge.pki.oids.keyBag });
        keyBag = keyBagsSimple[forge.pki.oids.keyBag]?.[0];
    }

    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    certBag = certBags[forge.pki.oids.certBag]?.[0];

    if (!keyBag || !certBag) {
        throw new Error('Não foi possível extrair Chave Privada ou Certificado do arquivo PFX.');
    }

    const privateKey = keyBag.key;
    const cert = certBag.cert;

    const keyPem = forge.pki.privateKeyToPem(privateKey);
    const certPem = forge.pki.certificateToPem(cert);

    // Extract CNPJ from Subject if possible (CN)
    let cpnjPrestador = '';
    const subjectAttrs = cert.subject.attributes;
    const cnAttr = subjectAttrs.find(attr => attr.shortName === 'CN' || attr.name === 'commonName');
    if (cnAttr) {
        const match = cnAttr.value.match(/\d{14}/);
        if (match) cpnjPrestador = match[0];
    }

    // 3. Sign XML using xml-crypto
    const sig = new SignedXml({
        privateKey: keyPem,
        canonicalizationAlgorithm: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
        signatureAlgorithm: "http://www.w3.org/2000/09/xmldsig#rsa-sha1"
    });

    // ABRASF lote format: sign InfRps element
    sig.addReference({
        xpath: "//*[local-name(.)='InfRps']",
        transforms: [
            "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
            "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
        ],
        digestAlgorithm: "http://www.w3.org/2000/09/xmldsig#sha1"
    });

    sig.computeSignature(xml, {
        location: { reference: "//*[local-name(.)='Rps']", action: "append" }
    });

    // Get signed XML and remove XML declaration if present
    let signedXml = sig.getSignedXml();
    signedXml = signedXml.replace(/<\?xml[^?]*\?>\s*/gi, '');

    return {
        signedXml,
        certPem,
        keyPem,
        cpnjPrestador
    };
}

module.exports = { signXML };
