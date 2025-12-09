const { authenticate } = require('./nuvem');
require('dotenv').config();

async function test() {
    console.log('Testing Nuvem Fiscal Authentication...');
    try {
        const token = await authenticate();
        console.log('Success! Token received:', token.substring(0, 20) + '...');
    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

test();
