import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES, addExpense } from '../services/expenseService';
import { X, Calendar, DollarSign, Tag, Save, Loader2 } from 'lucide-react';

interface ExpenseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onExpenseAdded: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, onExpenseAdded }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState<ExpenseCategory>('other');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        setIsSaving(true);
        try {
            const newExpense: Expense = {
                id: Date.now().toString(),
                description,
                amount: parseFloat(amount),
                date,
                category
            };

            await addExpense(newExpense);
            onExpenseAdded();
            onClose();

            // Reset form
            setDescription('');
            setAmount('');
            setCategory('other');
            setDate(new Date().toISOString().split('T')[0]);
        } catch (error) {
            console.error('Error saving expense:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Nova Despesa</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                        <input
                            required
                            type="text"
                            placeholder="Ex: Combustível, Material..."
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Date & Category Data */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    className="w-full pl-9 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    className="w-full pl-9 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none appearance-none"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-3.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>Salvar Despesa</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;
