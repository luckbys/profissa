export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

/**
 * Calculates the total amount of invoice items.
 * @param items Array of invoice items
 * @returns Total calculated value
 */
export const calculateTotal = (items: InvoiceItem[]): number => {
    if (!items || items.length === 0) return 0;
    
    // Use reduce with initial value 0
    // Ensure we handle potential floating point issues by rounding if necessary, 
    // but for now standard JS math is sufficient for simple cases.
    // In a real app, we might use a library like 'decimal.js' or work in cents.
    return items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
};

/**
 * Formats a number as Brazilian Real (BRL) currency string.
 * @param value The number to format
 * @returns Formatted string (e.g., "R$ 1.234,56")
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};
