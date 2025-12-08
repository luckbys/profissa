import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Publishable Key from the Stripe Dashboard
// Ideally, this should be in an environment variable: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

// For a client-side only app, we can't easily create Checkout Sessions securely without a backend.
// We will use Stripe Payment Links for the simplest integration.
const PAYMENT_LINK_URL = import.meta.env.VITE_STRIPE_PAYMENT_LINK || '';

// Customer Portal URL - allows Pro users to manage their subscription
// Configure in Stripe Dashboard > Settings > Billing > Customer Portal
const CUSTOMER_PORTAL_URL = import.meta.env.VITE_STRIPE_CUSTOMER_PORTAL || '';

export const redirectToCheckout = async () => {
    if (!PAYMENT_LINK_URL || PAYMENT_LINK_URL.includes('test_...')) {
        console.warn('Stripe Payment Link not configured. Simulating success.');
        // Simulate redirect loop for testing
        const currentUrl = window.location.href;
        const separator = currentUrl.includes('?') ? '&' : '?';
        window.location.href = `${currentUrl}${separator}success=true`;
        return;
    }

    window.location.href = PAYMENT_LINK_URL;
};

export const redirectToCustomerPortal = () => {
    if (!CUSTOMER_PORTAL_URL) {
        console.warn('Customer Portal URL not configured.');
        alert('Portal de assinatura não configurado. Entre em contato com o suporte.');
        return;
    }
    window.location.href = CUSTOMER_PORTAL_URL;
};

export const checkPaymentStatus = (): boolean => {
    const params = new URLSearchParams(window.location.search);
    return params.get('success') === 'true';
};
