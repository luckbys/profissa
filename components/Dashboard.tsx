import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Appointment } from '../types';
import { TrendingUp, Users, Calendar, Wallet } from 'lucide-react';

interface DashboardProps {
  appointments: Appointment[];
}

const Dashboard: React.FC<DashboardProps> = ({ appointments }) => {
  // Simple data aggregation for the chart
  const data = [
    { name: 'Seg', valor: 150 },
    { name: 'Ter', valor: 300 },
    { name: 'Qua', valor: 200 },
    { name: 'Qui', valor: 450 },
    { name: 'Sex', valor: 380 },
    { name: 'Sáb', valor: 500 },
    { name: 'Dom', valor: 100 },
  ];

  const totalIncome = appointments
    .filter(a => a.status === 'completed')
    .reduce((acc, curr) => acc + curr.price, 0);

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
        <p className="text-gray-500">Bem-vindo, Autônomo de Sucesso!</p>
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

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-500" />
          Desempenho Semanal
        </h2>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#9ca3af'}} 
                dy={10}
              />
              <Tooltip 
                cursor={{fill: '#f0f9ff'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="valor" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-4 rounded-xl shadow-md text-white">
        <h3 className="font-bold text-lg mb-1">Dica do dia</h3>
        <p className="text-brand-100 text-sm">
          Clientes que recebem orçamentos detalhados em PDF fecham 30% mais serviços. Use a aba "Financeiro"!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;