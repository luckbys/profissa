import React, { useState, useEffect } from 'react';
import { Expense } from '../types';
import { Appointment } from '../types';
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Calendar, Filter } from 'lucide-react';
import { getExpenses, EXPENSE_CATEGORIES } from '../services/expenseService';

interface CashFlowWidgetProps {
    appointments: Appointment[];
    expenses: Expense[];
    revenue: number;
    expensesTotal: number;
}

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: string;
    category?: string;
}

const CashFlowWidget: React.FC<CashFlowWidgetProps> = ({
    appointments,
    expenses,
    revenue,
    expensesTotal
}) => {
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Build unified transaction list
    useEffect(() => {
        const incomeTransactions: Transaction[] = appointments
            .filter(a => a.status === 'completed')
            .map(a => ({
                id: `income-${a.id}`,
                type: 'income' as const,
                description: a.service,
                amount: a.price,
                date: a.date,
                category: 'Serviço'
            }));

        const expenseTransactions: Transaction[] = expenses.map(e => ({
            id: `expense-${e.id}`,
            type: 'expense' as const,
            description: e.description,
            amount: e.amount,
            date: e.date,
            category: EXPENSE_CATEGORIES.find(c => c.id === e.category)?.label || 'Outros'
        }));

        const all = [...incomeTransactions, ...expenseTransactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTransactions(all);
    }, [appointments, expenses]);

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

    const profit = revenue - expensesTotal;
    const maxValue = Math.max(revenue, expensesTotal) || 1;

    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-gray-800">Fluxo de Caixa</h3>
                    <p className="text-xs text-gray-500 capitalize">{currentMonth}</p>
                </div>
            </div>

            {/* Visual Bars */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-4">
                {/* Income Bar */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ArrowUpCircle size={16} className="text-green-500" />
                            <span className="text-sm font-medium text-gray-600">Entradas</span>
                        </div>
                        <span className="font-bold text-green-600">R$ {revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(revenue / maxValue) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Expense Bar */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <ArrowDownCircle size={16} className="text-red-500" />
                            <span className="text-sm font-medium text-gray-600">Saídas</span>
                        </div>
                        <span className="font-bold text-red-600">R$ {expensesTotal.toFixed(2)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-400 to-rose-500 rounded-full transition-all duration-500"
                            style={{ width: `${(expensesTotal / maxValue) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Profit Summary */}
                <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Saldo do mês</span>
                        <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''} R$ {profit.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Transaction Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter === 'all'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilter('income')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${filter === 'income'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                >
                    <TrendingUp size={12} /> Entradas
                </button>
                <button
                    onClick={() => setFilter('expense')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${filter === 'expense'
                            ? 'bg-red-500 text-white'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                >
                    <TrendingDown size={12} /> Saídas
                </button>
            </div>

            {/* Transaction List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredTransactions.length === 0 ? (
                    <p className="text-center text-gray-400 py-6 text-sm">
                        Nenhuma movimentação encontrada
                    </p>
                ) : (
                    filteredTransactions.slice(0, 10).map(transaction => (
                        <div
                            key={transaction.id}
                            className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${transaction.type === 'income'
                                        ? 'bg-green-100'
                                        : 'bg-red-100'
                                    }`}>
                                    {transaction.type === 'income' ? (
                                        <ArrowUpCircle size={16} className="text-green-600" />
                                    ) : (
                                        <ArrowDownCircle size={16} className="text-red-600" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm line-clamp-1">
                                        {transaction.description}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(transaction.date).toLocaleDateString('pt-BR')} • {transaction.category}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-bold text-sm ${transaction.type === 'income'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}>
                                {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            {filteredTransactions.length > 10 && (
                <p className="text-center text-xs text-gray-400">
                    +{filteredTransactions.length - 10} movimentações anteriores
                </p>
            )}
        </div>
    );
};

export default CashFlowWidget;
