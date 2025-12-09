// Helper to hash PIN using SHA-256
const hashPIN = async (pin: string): Promise<string> => {
    // Fallback for non-secure contexts (http) where crypto.subtle is undefined
    if (!globalThis.crypto?.subtle) {
        console.warn('Crypto API not available. Using basic encoding.');
        // Simple base64 encoding as fallback (not secure hashing, but functional for non-HTTPS dev)
        return btoa('hashed_' + pin);
    }

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.error('Hashing error:', e);
        return btoa('hashed_' + pin); // Fallback
    }
};

export const setPIN = async (pin: string): Promise<void> => {
    const hashed = await hashPIN(pin);
    localStorage.setItem('app_pin', hashed);
    localStorage.setItem('is_app_locked', 'true'); // Auto-lock on set
};

export const verifyPIN = async (pin: string): Promise<boolean> => {
    const stored = localStorage.getItem('app_pin');
    if (!stored) return false;

    // Migration Check: If stored PIN is length 4 (legacy plain text), verification differs
    if (stored.length === 4) {
        if (stored === pin) {
            // Upgrade security automatically
            await setPIN(pin);
            return true;
        }
        return false;
    }

    // Standard Check (Hash)
    const inputHash = await hashPIN(pin);
    return stored === inputHash;
};

export const hasPIN = (): boolean => {
    return !!localStorage.getItem('app_pin');
};

export const removePIN = (): void => {
    localStorage.removeItem('app_pin');
    localStorage.removeItem('is_app_locked');
};

export const isAppLocked = (): boolean => {
    // If no PIN is set, it's not locked.
    if (!hasPIN()) return false;

    // Checking session/state. ideally this defaults to true on page load if PIN exists
    // For this simple implementation, we rely on the component mount logic, 
    // but we can store a 'lock_state' in sessionStorage to keep it unlocked during a session
    return sessionStorage.getItem('is_session_unlocked') !== 'true';
};

export const unlockApp = (): void => {
    sessionStorage.setItem('is_session_unlocked', 'true');
};

export const lockApp = (): void => {
    sessionStorage.removeItem('is_session_unlocked');
};
