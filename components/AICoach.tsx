import React, { useState, useRef, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { useLocalData } from '../hooks/useLocalData';
import { getDocumentStats } from '../services/documentService';
import { getMonthlyCashFlow } from '../services/expenseService';
import { askBusinessCoach, BusinessContext } from '../services/geminiService';
import { Sparkles, Send, Bot, Loader2, Crown } from 'lucide-react';

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

const AICoach: React.FC = () => {
    const { subscription, upgradeToPro } = useSubscription();
    const { clients } = useLocalData();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'ai', text: 'Olá! Sou seu Coach de Negócios. Como posso ajudar você a faturar mais hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getContext = async (): Promise<BusinessContext | undefined> => {
        if (subscription.plan !== 'pro') return undefined;

        const stats = getDocumentStats();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const flow = await getMonthlyCashFlow(stats.paidValue, currentMonth, currentYear);

        const openQuotes = stats.quotes;

        return {
            monthlyRevenue: stats.paidValue + (stats.receipts * (stats.totalValue / (stats.quotes + stats.receipts || 1))),
            monthlyExpenses: flow.expenses,
            monthlyProfit: (stats.paidValue + (stats.receipts * (stats.totalValue / (stats.quotes + stats.receipts || 1)))) - flow.expenses,
            totalClients: clients.length,
            openQuotes: openQuotes
        };
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const context = await getContext();
            const answer = await askBusinessCoach(userMsg.text, context);

            const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: answer };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: 'Tive um erro ao analisar. Tente novamente.' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleDeepAnalysis = async () => {
        if (subscription.plan !== 'pro') {
            upgradeToPro();
            return;
        }

        const msgText = 'Faça uma análise completa do meu negócio hoje.';
        setInput(msgText);

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: msgText };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const context = await getContext();
            const answer = await askBusinessCoach(msgText, context);
            const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: answer };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded-full">
                        <Bot size={24} className="text-purple-600" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800">Coach de Negócios</h1>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                {subscription.plan !== 'pro' && (
                    <button onClick={upgradeToPro} className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-yellow-200">
                        <Crown size={12} />
                        Seja PRO
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                {/* Pro Banner if Free */}
                {subscription.plan !== 'pro' && (
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl text-white shadow-lg mb-6">
                        <div className="flex items-start gap-3">
                            <Sparkles className="shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-sm mb-1">Obtenha Análises Personalizadas</h3>
                                <p className="text-xs opacity-90 mb-3">
                                    No plano Free, dou dicas gerais. No PRO, analiso seu lucro, clientes e gastos para estratégias reais.
                                </p>
                                <button onClick={upgradeToPro} className="bg-white text-purple-600 text-xs font-bold px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                                    Desbloquear Inteligência Completa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl ${msg.sender === 'user'
                            ? 'bg-brand-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none shadow-sm'
                            }`}>
                            {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0 text-sm leading-relaxed">{line}</p>)}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-[90px] left-0 right-0 max-w-md mx-auto bg-white p-3 border-t border-gray-100 flex gap-2 items-end z-20">
                <button
                    onClick={handleDeepAnalysis}
                    className="p-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                    title="Análise Profunda (Pro)"
                >
                    <Sparkles size={20} />
                </button>
                <div className="flex-1 bg-gray-50 rounded-xl flex items-center px-4 border border-gray-200 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-200 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pergunte sobre seu negócio..."
                        className="w-full bg-transparent py-3 outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="p-3 bg-brand-600 text-white rounded-xl shadow-md hover:bg-brand-700 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
            </div>
        </div>
    );
};

export default AICoach;
