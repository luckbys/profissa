import { useState, useEffect, useCallback } from 'react';
import { Subscription, PLAN_LIMITS, DEFAULT_SUBSCRIPTION } from '../types/subscription';
import {
    getSubscription,
    saveSubscription,
    useCredit as useCreditService,
    upgradeToPro as upgradeToProService,
    downgradeToFree as downgradeToFreeService,
    addBonusCredits as addBonusCreditsService
} from '../services/subscriptionService';

interface UseSubscriptionReturn {
    subscription: Subscription;
    isLoading: boolean;
    canGenerateDocument: boolean;
    useCredit: () => boolean;
    upgradeToPro: () => void;
    downgradeToFree: () => void;
    addBonusCredits: (amount: number) => void;
    refreshSubscription: () => void;
}

export const useSubscription = (): UseSubscriptionReturn => {
    const [subscription, setSubscription] = useState<Subscription>(DEFAULT_SUBSCRIPTION);
    const [isLoading, setIsLoading] = useState(true);

    // Load subscription on mount
    useEffect(() => {
        const loaded = getSubscription();
        setSubscription(loaded);
        setIsLoading(false);
    }, []);

    const canGenerateDocument = subscription.credits > 0;

    const useCredit = useCallback((): boolean => {
        const success = useCreditService();
        if (success) {
            setSubscription(getSubscription());
        }
        return success;
    }, []);

    const upgradeToPro = useCallback(() => {
        const updated = upgradeToProService();
        setSubscription(updated);
    }, []);

    const downgradeToFree = useCallback(() => {
        const updated = downgradeToFreeService();
        setSubscription(updated);
    }, []);

    const addBonusCredits = useCallback((amount: number) => {
        const updated = addBonusCreditsService(amount);
        setSubscription(updated);
    }, []);

    const refreshSubscription = useCallback(() => {
        setSubscription(getSubscription());
    }, []);

    return {
        subscription,
        isLoading,
        canGenerateDocument,
        useCredit,
        upgradeToPro,
        downgradeToFree,
        addBonusCredits,
        refreshSubscription
    };
};
