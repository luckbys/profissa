import React, { useState, useEffect } from 'react';
import { Client, UserProfile, Expense, Appointment } from '../types';
import { Receipt, MinusCircle, ChevronDown, Tag, FileText } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { getDocuments, getDocumentStats } from '../services/documentService';
import { getMonthlyCashFlow, getExpenses } from '../services/expenseService';
import { SavedDocument } from '../types/documents';
import CreditsDisplay from './CreditsDisplay';
import ExpenseForm from './ExpenseForm';
import CashFlowWidget from './CashFlowWidget';
import { fiscalService } from '../services/fiscalService';
import { useAuth } from '../hooks/useAuth';

interface FinanceProps {
  clients: Client[];
  userProfile?: UserProfile;
  onViewHistory?: () => void;
  onNewDocument?: () => void;
  initialTab?: 'overview' | 'expenses';
  appointments?: Appointment[];
}

const Finance: React.FC<FinanceProps> = ({
  userProfile,
  onViewHistory,
  onNewDocument,
  initialTab = 'overview',
  appointments = []
}) => {
  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses'>(initialTab);
  const { user } = useAuth();
  const [nfseList, setNfseList] = useState<any[]>([]); // State for NFS-e list

  // Expense State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashFlow, setCashFlow] = useState({ revenue: 0, expenses: 0, profit: 0 });

  const { subscription, upgradeToPro } = useSubscription(userProfile);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'overview') {
      refreshData();
      fetchNfseList();
    }
  }, [activeTab]);

  const fetchNfseList = async () => {
    if (!user?.id) return;
    const notes = await fiscalService.getInvoices(user.id);
    setNfseList(notes || []);
  };

  const refreshData = async () => {
    try {
      const localDocs = getDocuments();

      const formattedNfse = nfseList.map((n: any): SavedDocument => ({
        id: n.id,
        type: 'nfse',
        clientId: n.client_id || '',
        clientName: n.clients?.name || 'Cliente',
        createdAt: n.created_at, // Use createdAt instead of date
        total: n.service_amount,
        items: [],
        documentNumber: n.nfse_number ? `NFS-e ${n.nfse_number}` : `RPS ${n.dps_number || 'Provisório'}`,
        status: n.status === 'authorized' ? 'authorized' : n.status === 'error' ? 'error' : 'pending',
        url_pdf: n.url_pdf,
        error_message: n.error_message,
        clientPhone: n.clients?.phone || ''
      }));

      const allDocs = [...localDocs, ...formattedNfse].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Calculate Revenue for current month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyRevenue = allDocs
        .filter(doc => {
          const d = new Date(doc.createdAt);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear && doc.status !== 'error';
        })
        .reduce((sum, doc) => sum + doc.total, 0);

      const cashFlowData = await getMonthlyCashFlow(monthlyRevenue, currentMonth, currentYear);
      setCashFlow(cashFlowData);

      const expensesData = await getExpenses();
      setExpenses(expensesData || []);
    } catch (error) {
      console.error("Error loading finance data:", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab, nfseList]);


  return (
    <div className="pb-24 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
          <p className="text-gray-500 text-sm">Gerencie ganhos e gastos.</p>
        </div>
        <CreditsDisplay subscription={subscription} onUpgrade={upgradeToPro} compact />
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-100 p-1 rounded-xl flex">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
        >Visão Geral</button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'expenses' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
        >Despesas</button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Cash Flow Widget */}
          <CashFlowWidget
            appointments={appointments}
            expenses={expenses}
            revenue={cashFlow.revenue}
            expensesTotal={cashFlow.expenses}
          />

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onNewDocument}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="bg-green-100 p-2 rounded-lg">
                <Receipt size={20} className="text-green-600" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Novo Documento</span>
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="bg-red-100 p-2 rounded-lg">
                <MinusCircle size={20} className="text-red-600" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Nova Despesa</span>
            </button>
          </div>

          <button
            onClick={onViewHistory}
            className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FileText size={20} className="text-purple-600" />
              </div>
              <div className="text-left">
                <span className="font-bold text-gray-800 block">Histórico Completo</span>
                <span className="text-xs text-gray-500">Ver todos orçamentos e recibos</span>
              </div>
            </div>
            <ChevronDown size={20} className="text-gray-400 -rotate-90" />
          </button>
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeTab === 'expenses' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <MinusCircle size={20} />
            <span>Adicionar Nova Despesa</span>
          </button>

          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhuma despesa registrada.</p>
            ) : (
              expenses.map(expense => (
                <div key={expense.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg">
                      <Tag size={16} className="text-red-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{expense.description}</p>
                      <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-bold text-red-600">- R$ {expense.amount.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ExpenseForm
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onExpenseAdded={refreshData}
      />
    </div>
  );
};

export default Finance;
