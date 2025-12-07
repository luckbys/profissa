export const setPIN = (pin: string): void => {
    localStorage.setItem('app_pin', pin);
    localStorage.setItem('is_app_locked', 'true'); // Auto-lock on set
};

export const verifyPIN = (pin: string): boolean => {
    const stored = localStorage.getItem('app_pin');
    return stored === pin;
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
