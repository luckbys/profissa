
const { generateBookingLink, parseBookingLink, sendBookingRequest, saveBookingConfig } = require('./services/bookingService');

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Mock window
global.window = {
    location: { origin: 'http://localhost', pathname: '/' },
    open: (url) => console.log('OPEN URL:', url)
};

// Mock btoa/atob
global.btoa = (str) => Buffer.from(str).toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');

// Test Config
const config = {
    isEnabled: true,
    professionalName: 'Teste Silva',
    profession: 'Dev',
    phone: '(11) 99999-8888', // No country code
    services: [{ name: 'Test Service', duration: 60, price: 100 }]
};

saveBookingConfig(config);

console.log('--- GENERATING LINK ---');
const link = generateBookingLink();
console.log('Link:', link);

console.log('--- PARSING LINK ---');
const params = new URLSearchParams(link.split('?')[1]);
const encoded = params.get('booking');
const parsed = parseBookingLink(encoded);

console.log('Parsed Correctly:', parsed.config.professionalName === config.professionalName);
console.log('Parsed Phone:', parsed.config.phone);

console.log('--- GENERATING WHATSAPP URL ---');
// Extract logic from sendBookingRequest to test phone formatting
const cleanPhone = parsed.config.phone.replace(/\D/g, '');
console.log('Clean Phone (Current Logic):', cleanPhone);

// Proposed fix logic
let fixedPhone = cleanPhone;
if (fixedPhone.length >= 10 && fixedPhone.length <= 11) {
    fixedPhone = '55' + fixedPhone;
}
console.log('Proposed Fixed Phone:', fixedPhone);
