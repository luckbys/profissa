import { describe, it, expect } from 'vitest';
import { calculateTotal, formatCurrency } from './financialUtils';

describe('Financial Utils', () => {
    describe('calculateTotal', () => {
        it('should return 0 for empty items', () => {
            expect(calculateTotal([])).toBe(0);
        });

        it('should calculate total for single item', () => {
            const items = [{ id: '1', description: 'Test', quantity: 2, price: 100 }];
            expect(calculateTotal(items)).toBe(200);
        });

        it('should calculate total for multiple items', () => {
            const items = [
                { id: '1', description: 'Item 1', quantity: 2, price: 50 }, // 100
                { id: '2', description: 'Item 2', quantity: 1, price: 200 } // 200
            ];
            expect(calculateTotal(items)).toBe(300);
        });

        it('should handle decimal values correctly', () => {
            const items = [
                { id: '1', description: 'Item 1', quantity: 1, price: 10.50 },
                { id: '2', description: 'Item 2', quantity: 2, price: 5.25 } // 10.50
            ];
            expect(calculateTotal(items)).toBe(21);
        });
    });

    describe('formatCurrency', () => {
        it('should format BRL currency correctly', () => {
            // Note: Output depends on node/browser locale implementation, but pt-BR usually uses non-breaking space
            // We'll check if it contains the currency symbol and correct separators
            const result = formatCurrency(1234.56);
            expect(result).toContain('R$');
            expect(result).toContain('1.234,56');
        });

        it('should format zero correctly', () => {
            const result = formatCurrency(0);
            expect(result).toContain('0,00');
        });
    });
});
