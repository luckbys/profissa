import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkStatusProps {
    isOnline: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOnline }) => {
    const [showToast, setShowToast] = useState(false);
    const [wasOnline, setWasOnline] = useState(isOnline);

    useEffect(() => {
        // Show toast only when status changes (not on initial render)
        if (wasOnline !== isOnline) {
            setShowToast(true);
            const timer = setTimeout(() => setShowToast(false), 3000);
            setWasOnline(isOnline);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOnline]);

    return (
        <>
            {/* Persistent indicator - positioned in bottom right to avoid header overlap */}
            <div
                className={`fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-lg ${isOnline
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
            >
                {isOnline ? (
                    <Wifi size={14} className="text-green-600" />
                ) : (
                    <WifiOff size={14} className="text-gray-500" />
                )}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Toast notification */}
            <div
                className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                    } ${isOnline
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
            >
                <div className="flex items-center gap-2">
                    {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                    <span>
                        {isOnline
                            ? 'Conexão restabelecida!'
                            : 'Modo offline - seus dados estão salvos localmente'
                        }
                    </span>
                </div>
            </div>
        </>
    );
};

export default NetworkStatus;
