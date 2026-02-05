/**
 * PIX Utils - Logic to generate BR Code (PIX Copy and Paste)
 * Based on Central Bank of Brazil standards (EMV QRCPS)
 */

export const generatePixPayload = (key: string, name: string, city: string, amount: number, description?: string) => {
    // Helper to format EMV fields: ID + Length + Value
    const formatField = (id: string, value: string) => {
        const len = value.length.toString().padStart(2, '0');
        return `${id}${len}${value}`;
    };

    // Payload Format Indicator
    let payload = formatField('00', '01');

    // Merchant Account Information - PIX
    const gui = formatField('00', 'br.gov.bcb.pix');
    const pixKey = formatField('01', key);
    const info = description ? formatField('02', description.substring(0, 25)) : '';
    payload += formatField('26', `${gui}${pixKey}${info}`);

    // Merchant Category Code
    payload += formatField('52', '0000');

    // Transaction Currency (986 = BRL)
    payload += formatField('53', '986');

    // Transaction Amount
    if (amount > 0) {
        payload += formatField('54', amount.toFixed(2));
    }

    // Country Code
    payload += formatField('58', 'BR');

    // Merchant Name (max 25 chars)
    payload += formatField('59', name.substring(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase());

    // Merchant City (max 15 chars)
    payload += formatField('60', city.substring(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase());

    // Additional Data Field (TXID)
    const txid = formatField('05', '***'); // Use *** for static PIX without specific TXID
    payload += formatField('62', txid);

    // CRC16 - To be calculated at the end
    payload += '6304';

    // CRC16 Calculation
    const crc = calculateCRC16(payload);
    payload += crc.toUpperCase();

    return payload;
};

const calculateCRC16 = (payload: string) => {
    let result = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        result ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((result & 0x8000) !== 0) {
                result = (result << 1) ^ 0x1021;
            } else {
                result <<= 1;
            }
        }
    }
    return (result & 0xFFFF).toString(16).padStart(4, '0');
};

export const getQRCodeUrl = (payload: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
};
