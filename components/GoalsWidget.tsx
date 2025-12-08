import React, { useState, useEffect, useMemo } from 'react';
import { Target, Trophy, X, TrendingUp, Users, Calendar, Award, Sparkles, Lock } from 'lucide-react';
import {
    getCurrentGoal,
    saveGoal,
    getAllAchievements,
    checkAchievements,
    calculateGoalProgress,
    MonthlyGoal,
    Achievement
} from '../services/goalsService';
import { Appointment, Client } from '../types';

interface GoalsWidgetProps {
    appointments: Appointment[];
    clients: Client[];
    documentsCount: number;
}

const GoalsWidget: React.FC<GoalsWidgetProps> = ({ appointments, clients, documentsCount }) => {
    const [goal, setGoal] = useState<MonthlyGoal | null>(null);
    const [showSetGoal, setShowSetGoal] = useState(false);
    const [showAchievements, setShowAchievements] = useState(false);
    const [newUnlocks, setNewUnlocks] = useState<Achievement[]>([]);

    const [targetRevenue, setTargetRevenue] = useState('5000');
    const [targetAppointments, setTargetAppointments] = useState('20');

    // Calculate stats
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyAppointments = appointments.filter(a => {
            const date = new Date(a.date);
            return date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear &&
                a.status === 'completed';
        });

        const monthlyRevenue = monthlyAppointments.reduce((acc, a) => acc + a.price, 0);
        const totalRevenue = appointments.filter(a => a.status === 'completed').reduce((acc, a) => acc + a.price, 0);
        const totalAppointments = appointments.filter(a => a.status === 'completed').length;

        return {
            monthlyRevenue,
            monthlyAppointments: monthlyAppointments.length,
            totalRevenue,
            totalAppointments,
            totalClients: clients.length,
            documentsGenerated: documentsCount
        };
    }, [appointments, clients, documentsCount]);

    // Load goal and check achievements
    useEffect(() => {
        setGoal(getCurrentGoal());

        const unlocks = checkAchievements({
            totalRevenue: stats.totalRevenue,
            totalAppointments: stats.totalAppointments,
            totalClients: stats.totalClients,
            documentsGenerated: stats.documentsGenerated
        });

        if (unlocks.length > 0) {
            setNewUnlocks(unlocks);
        }
    }, [stats]);

    const progress = useMemo(() => {
        if (!goal) return null;
        return calculateGoalProgress(
            goal,
            stats.monthlyRevenue,
            stats.monthlyAppointments,
            clients.length
        );
    }, [goal, stats, clients.length]);

    const handleSaveGoal = () => {
        const now = new Date();
        const newGoal: MonthlyGoal = {
            id: Date.now().toString(),
            month: now.getMonth(),
            year: now.getFullYear(),
            targetRevenue: parseFloat(targetRevenue) || 0,
            targetAppointments: parseInt(targetAppointments) || 0,
            targetClients: 0
        };
        saveGoal(newGoal);
        setGoal(newGoal);
        setShowSetGoal(false);
    };

    const achievements = getAllAchievements();
    const unlockedCount = achievements.filter(a => a.unlockedAt).length;

    return (
        <>
            {/* New Achievement Toast */}
            {newUnlocks.length > 0 && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="text-4xl">{newUnlocks[0].icon}</div>
                        <div>
                            <div className="text-xs font-bold opacity-80">🎉 CONQUISTA DESBLOQUEADA!</div>
                            <div className="font-bold text-lg">{newUnlocks[0].name}</div>
                            <div className="text-xs opacity-90">{newUnlocks[0].description}</div>
                        </div>
                        <button onClick={() => setNewUnlocks([])} className="ml-2 opacity-70 hover:opacity-100">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Goals Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Target className="text-purple-600" size={18} />
                        </div>
                        <h3 className="font-bold text-gray-800">Meta do Mês</h3>
                    </div>
                    <button
                        onClick={() => setShowAchievements(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-bold hover:bg-amber-100 transition-colors"
                    >
                        <Trophy size={14} />
                        {unlockedCount}/{achievements.length}
                    </button>
                </div>

                {goal ? (
                    <div className="space-y-3">
                        {/* Revenue Progress */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Faturamento</span>
                                <span className="font-bold text-gray-800">
                                    R$ {stats.monthlyRevenue.toLocaleString('pt-BR')} / R$ {goal.targetRevenue.toLocaleString('pt-BR')}
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${progress!.revenue >= 100 ? 'bg-green-500' : 'bg-purple-500'
                                        }`}
                                    style={{ width: `${progress!.revenue}%` }}
                                />
                            </div>
                        </div>

                        {/* Appointments Progress */}
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Atendimentos</span>
                                <span className="font-bold text-gray-800">
                                    {stats.monthlyAppointments} / {goal.targetAppointments}
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${progress!.appointments >= 100 ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${progress!.appointments}%` }}
                                />
                            </div>
                        </div>

                        {progress!.revenue >= 100 && progress!.appointments >= 100 && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700">
                                <Sparkles size={18} />
                                <span className="font-bold text-sm">🎉 Meta do mês alcançada!</span>
                            </div>
                        )}

                        <button
                            onClick={() => setShowSetGoal(true)}
                            className="w-full py-2 text-sm text-gray-500 hover:text-brand-600 transition-colors"
                        >
                            Editar meta
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-500 text-sm mb-3">Defina uma meta para acompanhar seu progresso!</p>
                        <button
                            onClick={() => setShowSetGoal(true)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors"
                        >
                            Definir Meta
                        </button>
                    </div>
                )}
            </div>

            {/* Set Goal Modal */}
            {showSetGoal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">Meta Mensal</h2>
                            <button onClick={() => setShowSetGoal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                                    Meta de Faturamento (R$)
                                </label>
                                <input
                                    type="number"
                                    value={targetRevenue}
                                    onChange={e => setTargetRevenue(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="5000"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                                    Meta de Atendimentos
                                </label>
                                <input
                                    type="number"
                                    value={targetAppointments}
                                    onChange={e => setTargetAppointments(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="20"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveGoal}
                            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                        >
                            Salvar Meta
                        </button>
                    </div>
                </div>
            )}

            {/* Achievements Modal */}
            {showAchievements && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-white">
                                <Trophy size={20} />
                                <h2 className="font-bold">Conquistas</h2>
                            </div>
                            <button onClick={() => setShowAchievements(false)} className="text-white/70 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
                            {achievements.map(achievement => (
                                <div
                                    key={achievement.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${achievement.unlockedAt
                                            ? 'bg-amber-50 border-amber-200'
                                            : 'bg-gray-50 border-gray-200 opacity-60'
                                        }`}
                                >
                                    <div className={`text-3xl ${!achievement.unlockedAt && 'grayscale'}`}>
                                        {achievement.unlockedAt ? achievement.icon : '🔒'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{achievement.name}</h4>
                                        <p className="text-xs text-gray-500">{achievement.description}</p>
                                    </div>
                                    {achievement.unlockedAt && (
                                        <Award className="text-amber-500" size={20} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GoalsWidget;
