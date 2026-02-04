import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Appointment, Client, UserProfile } from '../types';
import { TrendingUp, Users, Calendar, Wallet, Sparkles, RefreshCw, Loader2, ArrowUpCircle, ArrowDownCircle, Target } from 'lucide-react';
import GoalsWidget from './GoalsWidget';
import { askBusinessCoach, BusinessContext } from '../services/geminiService';
import { getDocumentStats } from '../services/documentService';
import { getMonthlyCashFlow } from '../services/expenseService';
import { Expense } from '../types';

interface DashboardProps {
  appointments: Appointment[];
  clients: Client[];
  documentsCount: number;
  userProfile?: UserProfile;
  expenses?: Expense[];
}

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Dashboard: React.FC<DashboardProps> = ({ appointments, clients, documentsCount, userProfile, expenses = [] }) => {
  const [dailyTip, setDailyTip] = useState<string>('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [lastTipDate, setLastTipDate] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate real monthly revenue, expenses and profit
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const revenue = appointments
      .filter(a => {
        const d = new Date(a.date);
        return a.status === 'completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + curr.price, 0);

    const monthlyExpenses = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + curr.amount, 0);

    const profit = revenue - monthlyExpenses;
    
    return { revenue, expenses: monthlyExpenses, profit };
  }, [appointments, expenses]);

  // Calculate real weekly data from completed appointments
  const weeklyData = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    // Start from last Sunday
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const dailyTotals: { [key: number]: number } = {};
    for (let i = 0; i < 7; i++) {
      dailyTotals[i] = 0;
    }

    // Sum completed appointments by day of week
    appointments
      .filter(a => a.status === 'completed')
      .forEach(apt => {
        const aptDate = new Date(apt.date);
        // Only count appointments from current week
        if (aptDate >= startOfWeek && aptDate <= today) {
          const dayOfWeek = aptDate.getDay();
          dailyTotals[dayOfWeek] += apt.price;
        }
      });

    // Convert to chart format starting from Sunday
    return WEEKDAY_NAMES.map((name, index) => ({
      name,
      valor: dailyTotals[index],
      isToday: index === today.getDay()
    }));
  }, [appointments]);

  const totalIncome = appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => acc + curr.price, 0);

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  // Generate AI tip once per day
  const generateDailyTip = async (force = false) => {
    const today = new Date().toDateString();

    // Check if we already have a tip for today (unless forced)
    if (!force && lastTipDate === today && dailyTip) {
      return;
    }

    setIsLoadingTip(true);
    try {
      const stats = getDocumentStats();
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const flow = await getMonthlyCashFlow(stats.paidValue, currentMonth, currentYear);

      const context: BusinessContext = {
        monthlyRevenue: stats.paidValue,
        monthlyExpenses: flow.expenses,
        monthlyProfit: stats.paidValue - flow.expenses,
        totalClients: clients.length,
        openQuotes: stats.quotes
      };

      const prompt = `Dê uma dica rápida e prática (máximo 2 frases) para ${userProfile?.name || 'o profissional'} 
        que é ${userProfile?.profession || 'autônomo'} melhorar o negócio hoje.
        ${context.openQuotes > 0 ? `Ele tem ${context.openQuotes} orçamentos pendentes.` : ''}
        ${context.totalClients === 0 ? 'Ele ainda não tem clientes cadastrados.' : ''}
        ${pendingCount > 0 ? `Tem ${pendingCount} atendimentos agendados.` : ''}
        Seja específico, motivador e prático. Não use emojis no início.`;

      const tip = await askBusinessCoach(prompt, context);
      setDailyTip(tip);
      setLastTipDate(today);

      // Cache the tip
      localStorage.setItem('profissa_daily_tip', JSON.stringify({ tip, date: today }));
    } catch (error) {
      console.error('Error generating tip:', error);
      setDailyTip('Mantenha seus orçamentos organizados e responda rapidamente aos clientes. Agilidade é a chave do sucesso!');
    } finally {
      setIsLoadingTip(false);
    }
  };

  // Load cached tip or generate new one
  useEffect(() => {
    try {
      const cached = localStorage.getItem('profissa_daily_tip');
      if (cached) {
        const { tip, date } = JSON.parse(cached);
        const today = new Date().toDateString();
        if (date === today && tip) {
          setDailyTip(tip);
          setLastTipDate(date);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading cached tip:', e);
    }

    // Generate new tip if no valid cache
    generateDailyTip();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
          <p className="text-gray-500">Bem-vindo{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ', Autônomo de Sucesso'}!</p>
        </div>
        {userProfile?.isPro && (
          <button
            onClick={async () => {
              setIsRefreshing(true);
              try {
                // The actual sync is handled by the forceSync in App.tsx via SyncIndicator,
                // but we can trigger a visual refresh here if needed or just show the user
                // that data is up to date.
                await new Promise(resolve => setTimeout(resolve, 1000));
              } finally {
                setIsRefreshing(false);
              }
            }}
            className={`p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-brand-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            title="Sincronizado na nuvem"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpCircle className="w-12 h-12 text-green-600" />
          </div>
          <div className="p-2 bg-green-100 rounded-lg mb-2 text-green-600">
            <Wallet size={18} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Receita (Mês)</span>
          <span className="text-xl font-black text-gray-800 tracking-tight">R$ {monthlyStats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-start relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-12 h-12 text-blue-600" />
          </div>
          <div className="p-2 bg-blue-100 rounded-lg mb-2 text-blue-600">
            <Calendar size={18} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Agendados</span>
          <span className="text-xl font-black text-gray-800 tracking-tight">{pendingCount}</span>
        </div>
      </div>

      {/* Main Profit Card */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${monthlyStats.profit >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              {monthlyStats.profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <span className="text-sm font-black text-gray-800 uppercase tracking-tight">Lucro Real (Mês)</span>
          </div>
          <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase">Saldo do Período</span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={`text-3xl font-black tracking-tighter leading-none ${monthlyStats.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              R$ {monthlyStats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400 font-bold mt-2 flex items-center gap-1">
              {monthlyStats.profit >= 0 ? 'Resultado positivo' : 'Atenção ao fluxo'} 
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              Foco na meta
            </p>
          </div>
          
          <div className="flex-1 max-w-[120px] space-y-2">
            <div className="flex justify-between items-center text-[9px] font-bold uppercase text-gray-400 tracking-widest">
              <span>Despesas</span>
              <span className="text-rose-500">R$ {monthlyStats.expenses.toFixed(0)}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-1000" 
                style={{ width: `${Math.min((monthlyStats.expenses / (monthlyStats.revenue || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Goals Widget */}
      <GoalsWidget
        appointments={appointments}
        clients={clients}
        documentsCount={documentsCount}
      />

      {/* Chart with Real Data */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-500" />
          Desempenho Semanal
          <span className="text-xs font-normal text-gray-400 ml-auto">Semana atual</span>
        </h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                dy={10}
              />
              <Tooltip
                cursor={{ fill: '#f0f9ff' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
              />
              <Bar
                dataKey="valor"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {weeklyData.every(d => d.valor === 0) && (
          <p className="text-center text-xs text-gray-400 mt-2">
            Complete atendimentos para ver seu faturamento aqui
          </p>
        )}
      </div>

      {/* AI-Powered Daily Tip */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 rounded-xl shadow-md text-white relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <button
            onClick={() => generateDailyTip(true)}
            disabled={isLoadingTip}
            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Gerar nova dica"
          >
            {isLoadingTip ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} />
          <h3 className="font-bold text-lg">Dica do dia</h3>
        </div>
        {isLoadingTip ? (
          <div className="flex items-center gap-2 text-brand-100">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Gerando dica personalizada...</span>
          </div>
        ) : (
          <p className="text-brand-100 text-sm leading-relaxed">
            {dailyTip || 'Clientes que recebem orçamentos detalhados em PDF fecham 30% mais serviços. Use a aba "Financeiro"!'}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;