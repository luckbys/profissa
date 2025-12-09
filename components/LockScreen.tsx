import React, { useState, useEffect } from 'react';
import { verifyPIN } from '../services/authService';
import { Lock, Unlock, Delete, Fingerprint } from 'lucide-react';

interface LockScreenProps {
    onUnlock: () => void;
    isSettingUp?: boolean; // If true, acts as "Set PIN" screen
    onPinSet?: (pin: string) => void;
    onCancelSetup?: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, isSettingUp = false, onPinSet, onCancelSetup }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [firstPin, setFirstPin] = useState('');

    const handlePress = (num: string) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
    };

    // Effect to check PIN when it reaches 4 digits
    useEffect(() => {
        if (pin.length === 4) {
            const checkPin = async () => {
                if (isSettingUp) {
                    // Setup Logic
                    if (!confirming) {
                        setFirstPin(pin);
                        setConfirming(true);
                        setPin('');
                    } else {
                        // Confirming logic
                        if (pin === firstPin) {
                            onPinSet?.(pin);
                        } else {
                            setError(true);
                            setPin('');
                            setConfirming(false);
                            setFirstPin('');
                            alert('PIN não confere. Tente novamente.');
                        }
                    }
                } else {
                    // Unlock Logic
                    const isValid = await verifyPIN(pin);
                    if (isValid) {
                        onUnlock();
                    } else {
                        setError(true);
                        setPin('');
                        // Vibrate if mobile
                        if (navigator.vibrate) navigator.vibrate(200);
                    }
                }
            };
            checkPin();
        }
    }, [pin, isSettingUp, confirming, firstPin, onUnlock, onPinSet]);

    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

    return (
        <div className="fixed inset-0 bg-gray-900 z-[100] flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-300">
            <div className="mb-8 flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full ${error ? 'bg-red-500/20 text-red-500 animate-shake' : 'bg-brand-500/20 text-brand-400'}`}>
                    {error ? <Lock size={40} /> : <Unlock size={40} />}
                </div>
                <h2 className="text-xl font-bold">
                    {isSettingUp
                        ? (confirming ? 'Confirme seu PIN' : 'Crie um PIN de 4 dígitos')
                        : 'Profissa Protegido'}
                </h2>
                <p className="text-gray-400 text-sm">
                    {isSettingUp ? 'Digite para configurar' : 'Digite seu PIN para entrar'}
                </p>
            </div>

            {/* PIN Dots */}
            <div className="flex gap-4 mb-12">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-200 ${i < pin.length
                            ? (error ? 'bg-red-500' : 'bg-brand-400 scale-125')
                            : 'bg-gray-700'
                            }`}
                    />
                ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
                {numbers.map((num, i) => {
                    if (num === '') return <div key={i} />;
                    if (num === 'back') {
                        return (
                            <button
                                key={i}
                                onClick={handleBackspace}
                                className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors"
                            >
                                <Delete size={24} />
                            </button>
                        );
                    }
                    return (
                        <button
                            key={num}
                            onClick={() => handlePress(num)}
                            className="w-16 h-16 rounded-full bg-white/10 text-2xl font-bold flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                        >
                            {num}
                        </button>
                    );
                })}
            </div>

            {!isSettingUp && (
                <button className="mt-8 flex items-center gap-2 text-brand-400 opacity-60 hover:opacity-100 transition-opacity">
                    <Fingerprint />
                    <span className="text-sm">Usar Biometria</span>
                </button>
            )}

            {isSettingUp && (
                <button onClick={onCancelSetup} className="mt-8 text-gray-500 text-sm hover:text-white">
                    Cancelar
                </button>
            )}
        </div>
    );
};

export default LockScreen;
