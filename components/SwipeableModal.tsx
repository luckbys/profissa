import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';

interface SwipeableModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showCloseButton?: boolean;
    className?: string; // Additional classes for the content area
}

const SwipeableModal: React.FC<SwipeableModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    showCloseButton = true,
    className = ''
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.y > 100 || info.velocity.y > 500) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-colors"
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    />

                    {/* Modal Container - Aligned to bottom for mobile feel */}
                    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            drag="y"
                            dragConstraints={{ top: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            className={`pointer-events-auto bg-white w-full max-w-md rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${className}`}
                        >
                            {/* Drag Handle */}
                            <div className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none">
                                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                            </div>

                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="px-5 pb-3 flex items-center justify-between shrink-0">
                                    {title ? (
                                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                                    ) : (
                                        <div />
                                    )}
                                    {showCloseButton && (
                                        <button
                                            onClick={onClose}
                                            className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-5 pb-8 overscroll-contain">
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SwipeableModal;
