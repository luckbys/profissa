import { useState, useEffect, useCallback } from 'react';
import { Subscription, PLAN_LIMITS, DEFAULT_SUBSCRIPTION } from '../types/subscription';
import { UserProfile } from '../types';
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

export const useSubscription = (userProfile?: UserProfile): UseSubscriptionReturn => {
    const [subscription, setSubscription] = useState<Subscription>(DEFAULT_SUBSCRIPTION);
    const [isLoading, setIsLoading] = useState(true);

    // Load subscription on mount or when profile changes
    useEffect(() => {
        const loaded = getSubscription();

        if (userProfile) {
            // Override local data with Supabase data
            const merged: Subscription = {
                ...loaded,
                plan: (userProfile.subscriptionStatus === 'pro' || userProfile.isPro) ? 'pro' : 'free',
                // Use profile credits if available, otherwise fallback to local
                credits: userProfile.credits !== undefined ? userProfile.credits : loaded.credits,
            };

            // If pro, force unlimited logic visual
            if (merged.plan === 'pro') {
                merged.credits = 999999;
                merged.maxCredits = -1;
            }

            setSubscription(merged);
            // We don't save to localStorage here to avoid overwriting with partial data, 
            // or maybe we should? For now let's just use it for display/logic in-memory.
            // saveSubscription(merged); 
        } else {
            setSubscription(loaded);
        }

        setIsLoading(false);
    }, [userProfile]);

    const canGenerateDocument = subscription.credits > 0;

    const useCredit = useCallback((): boolean => {
        // 1. Check Pro Plan (Unlimited)
        if (subscription.plan === 'pro') {
            const updated = { ...subscription, documentsGenerated: subscription.documentsGenerated + 1 };
            setSubscription(updated);
            // We should also sync this usage stat but for now let's focus on credits
            return true;
        }

        // 2. Check Credits (State is the source of truth, merged from Supabase)
        if (subscription.credits <= 0) {
            return false;
        }

        // 3. Decrement Credits
        const newCredits = subscription.credits - 1;
        const updated = {
            ...subscription,
            credits: newCredits,
            documentsGenerated: subscription.documentsGenerated + 1
        };

        setSubscription(updated);
        saveSubscription(updated); // Update local storage immediately

        // 4. Update Supabase if authenticated
        // 4. Update Supabase if authenticated
        if (userProfile?.userId) {
            // Fire and forget update (server-side validation via RPC)
            import('../services/syncService').then(({ consumeDocumentCredit }) => {
                consumeDocumentCredit(userProfile.userId!);
            });
        }

        return true;
    }, [subscription, userProfile]);

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
