import { Expense, ExpenseCategory } from '../types';
import { addItem, deleteItem, getAll } from './storageService';

export const addExpense = async (expense: Expense): Promise<void> => {
    await addItem('expenses', expense);
};

export const deleteExpense = async (id: string): Promise<void> => {
    await deleteItem('expenses', id);
};

export const getExpenses = async (): Promise<Expense[]> => {
    const expenses = await getAll('expenses');
    // Sort by date desc (newest first)
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getExpensesTotal = async (month?: number, year?: number): Promise<number> => {
    const expenses = await getExpenses();

    if (month !== undefined && year !== undefined) {
        return expenses
            .filter(e => {
                const date = new Date(e.date);
                return date.getMonth() === month && date.getFullYear() === year;
            })
            .reduce((acc, curr) => acc + curr.amount, 0);
    }

    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
};

export const getMonthlyCashFlow = async (revenue: number, month: number, year: number): Promise<{
    revenue: number;
    expenses: number;
    profit: number;
}> => {
    const expensesTotal = await getExpensesTotal(month, year);
    return {
        revenue,
        expenses: expensesTotal,
        profit: revenue - expensesTotal
    };
};

export const EXPENSE_CATEGORIES: { id: ExpenseCategory; label: string; color: string }[] = [
    { id: 'material', label: 'Material', color: 'bg-blue-100 text-blue-800' },
    { id: 'transport', label: 'Transporte', color: 'bg-orange-100 text-orange-800' },
    { id: 'food', label: 'Alimentação', color: 'bg-green-100 text-green-800' },
    { id: 'marketing', label: 'Marketing', color: 'bg-purple-100 text-purple-800' },
    { id: 'utilities', label: 'Contas (Luz/Net)', color: 'bg-gray-100 text-gray-800' },
    { id: 'other', label: 'Outros', color: 'bg-red-100 text-red-800' },
];
