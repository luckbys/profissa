import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Appointment, Client, UserProfile } from '../types';
import { TrendingUp, Users, Calendar, Wallet, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import GoalsWidget from './GoalsWidget';
import { askBusinessCoach, BusinessContext } from '../services/geminiService';
import { getDocumentStats } from '../services/documentService';
import { getMonthlyCashFlow } from '../services/expenseService';

interface DashboardProps {
  appointments: Appointment[];
  clients: Client[];
  documentsCount: number;
  userProfile?: UserProfile;
}

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const Dashboard: React.FC<DashboardProps> = ({ appointments, clients, documentsCount, userProfile }) => {
  const [dailyTip, setDailyTip] = useState<string>('');
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [lastTipDate, setLastTipDate] = useState<string>('');

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
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
        <p className="text-gray-500">Bem-vindo{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ', Autônomo de Sucesso'}!</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start">
          <div className="p-2 bg-green-100 rounded-lg mb-2">
            <Wallet className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs text-gray-500">Receita (Mês)</span>
          <span className="text-xl font-bold text-gray-800">R$ {totalIncome.toFixed(2)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-start">
          <div className="p-2 bg-blue-100 rounded-lg mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs text-gray-500">Agendados</span>
          <span className="text-xl font-bold text-gray-800">{pendingCount}</span>
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