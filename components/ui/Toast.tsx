import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, toast.duration || 4000);

        return () => clearTimeout(timer);
    }, [toast, onClose]);

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStyles = () => {
        switch (toast.type) {
            case 'success': return 'bg-white border-green-100';
            case 'error': return 'bg-white border-red-100';
            case 'warning': return 'bg-white border-amber-100';
            default: return 'bg-white border-blue-100';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex w-full max-w-sm rounded-[18px] border-2 shadow-xl shadow-black/5 p-4 gap-3 ${getStyles()}`}
        >
            <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{toast.title}</p>
                {toast.message && (
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X size={18} />
            </button>
        </motion.div>
    );
};

export default Toast;
