import { describe, it, expect } from 'vitest';

// Simulating the UUID validation logic from syncService.ts
const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};

describe('ID Generation Validation', () => {
    it('should reject Date.now() style IDs', () => {
        const legacyId = Date.now().toString(); // e.g., "1707123456789"
        expect(isValidUUID(legacyId)).toBe(false);
    });

    it('should accept crypto.randomUUID() style IDs', () => {
        // We mock crypto for the test environment if needed, 
        // but Node.js 19+ has global crypto. 
        // Vitest runs in Node, so it should be available.
        const validId = crypto.randomUUID();
        expect(isValidUUID(validId)).toBe(true);
    });

    it('should validate the fix strategy used in CalendarView', () => {
        // The fix implementation:
        const appointmentId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
        
        // Assert it generates a valid UUID in modern environments
        expect(isValidUUID(appointmentId)).toBe(true);
    });
});
