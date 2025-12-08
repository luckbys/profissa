import React from 'react';
import { Cloud, CloudOff, RefreshCw, Loader2, Check, AlertCircle } from 'lucide-react';
import { SyncStatus } from '../services/syncService';

interface SyncIndicatorProps {
    isOnline: boolean;
    syncStatus: SyncStatus;
    onForceSync: () => void;
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({ isOnline, syncStatus, onForceSync }) => {
    const getStatusIcon = () => {
        if (!isOnline) {
            return <CloudOff size={14} className="text-gray-400" />;
        }
        if (syncStatus.isSyncing) {
            return <Loader2 size={14} className="text-blue-500 animate-spin" />;
        }
        if (syncStatus.error) {
            return <AlertCircle size={14} className="text-red-500" />;
        }
        if (syncStatus.pendingChanges > 0) {
            return <Cloud size={14} className="text-yellow-500" />;
        }
        return <Check size={14} className="text-green-500" />;
    };

    const getStatusText = () => {
        if (!isOnline) return 'Offline';
        if (syncStatus.isSyncing) return 'Sincronizando...';
        if (syncStatus.error) return 'Erro ao sincronizar';
        if (syncStatus.pendingChanges > 0) return `${syncStatus.pendingChanges} pendente(s)`;
        return 'Sincronizado';
    };

    const getStatusColor = () => {
        if (!isOnline) return 'bg-gray-100 text-gray-600';
        if (syncStatus.isSyncing) return 'bg-blue-100 text-blue-700';
        if (syncStatus.error) return 'bg-red-100 text-red-700';
        if (syncStatus.pendingChanges > 0) return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    };

    return (
        <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusIcon()}
                <span>{getStatusText()}</span>
            </div>

            {isOnline && !syncStatus.isSyncing && (
                <button
                    onClick={onForceSync}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Forçar sincronização"
                >
                    <RefreshCw size={14} />
                </button>
            )}
        </div>
    );
};

export default SyncIndicator;
