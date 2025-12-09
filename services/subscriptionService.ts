import { Subscription, PlanType, PLAN_LIMITS, DEFAULT_SUBSCRIPTION, PLAN_FEATURES } from '../types/subscription';
import { UserProfile } from '../types';

// We now use the profile as the source of truth
const PROFILE_KEY = 'gerente_bolso_profile';

// Helper to get local profile
const getLocalProfile = (): UserProfile | null => {
    try {
        const data = localStorage.getItem(PROFILE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

// Get subscription from local Profile (synced from Supabase)
export const getSubscription = (): Subscription => {
    try {
        const profile = getLocalProfile();

        if (!profile) {
            return DEFAULT_SUBSCRIPTION;
        }

        const plan: PlanType = (profile.isPro || profile.subscriptionStatus === 'pro') ? 'pro' : 'free';

        // Derive subscription state from profile
        const subscription: Subscription = {
            plan,
            credits: profile.credits !== undefined ? profile.credits : 0,
            maxCredits: PLAN_LIMITS[plan].maxCredits,
            // AI Credits are currently not in profile, defaulting to plan limits for now
            aiCredits: PLAN_LIMITS[plan].maxAiCredits,
            maxAiCredits: PLAN_LIMITS[plan].maxAiCredits,
            documentsGenerated: 0, // This metric might be less accurate now if not in profile, but acceptable
            lastResetDate: new Date().toISOString() // Placeholder
        };

        // Pro plan overrides
        if (plan === 'pro') {
            subscription.credits = 999999;
            subscription.maxCredits = -1;
        }

        return subscription;
    } catch {
        return DEFAULT_SUBSCRIPTION;
    }
};

// Save subscription to localStorage (Updates the Profile object)
export const saveSubscription = (subscription: Subscription): void => {
    try {
        const profile = getLocalProfile();
        if (profile) {
            const updatedProfile: UserProfile = {
                ...profile,
                credits: subscription.credits,
                isPro: subscription.plan === 'pro',
                subscriptionStatus: subscription.plan === 'pro' ? 'pro' : 'free'
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
        }
    } catch (error) {
        console.error('Failed to save subscription to profile:', error);
    }
};

// Use a document credit (returns true if successful, false if no credits left)
export const useCredit = (): boolean => {
    const subscription = getSubscription();

    // Pro users have unlimited documents
    if (subscription.plan === 'pro') {
        return true;
    }

    if (subscription.credits <= 0) {
        return false;
    }

    // Optimistic update
    const updated: Subscription = {
        ...subscription,
        credits: subscription.credits - 1
    };
    saveSubscription(updated);

    // Note: The actual server sync is handled by the consumer (hooks/useSubscription) 
    // calling syncService.consumeDocumentCredit

    return true;
};

// Use an AI credit (returns true if successful)
export const useAiCredit = (): boolean => {
    // Currently AI credits are not strictly enforced on server, keeping local logic
    const subscription = getSubscription();

    if (subscription.aiCredits <= 0) {
        return false;
    }
    // We don't save AI credits to profile yet as the column doesn't exist
    return true;
};

// Check if user has document credits available
export const hasCredits = (): boolean => {
    const subscription = getSubscription();
    if (subscription.plan === 'pro') return true;
    return subscription.credits > 0;
};

// Check if user has AI credits available
export const hasAiCredits = (): boolean => {
    return true; // Temporary: Allow AI usage until strictly enforced
};

// Get remaining document credits
export const getRemainingCredits = (): number => {
    const subscription = getSubscription();
    if (subscription.plan === 'pro') return 999999;
    return subscription.credits;
};

// Get remaining AI credits
export const getRemainingAiCredits = (): number => {
    const subscription = getSubscription();
    return subscription.aiCredits;
};

// Upgrade to Pro plan - DEPRECATED / SERVER ONLY
export const upgradeToPro = (): Subscription => {
    console.warn('Upgrade to Pro must be handled by server/stripe');
    return getSubscription();
};

// Downgrade to Free plan - DEPRECATED / SERVER ONLY
export const downgradeToFree = (): Subscription => {
    console.warn('Downgrade must be handled by server');
    return getSubscription();
};

// Add bonus credits - DEPRECATED / SERVER ONLY
export const addBonusCredits = (amount: number): Subscription => {
    console.warn('Bonus credits must be handled by server');
    return getSubscription();
};

// Add bonus AI credits
export const addBonusAiCredits = (amount: number): Subscription => {
    return getSubscription();
};

// Check if a specific feature is available for the current plan
export const hasFeature = (feature: keyof typeof PLAN_FEATURES.free): boolean => {
    const subscription = getSubscription();
    return !!PLAN_FEATURES[subscription.plan][feature];
};

// Check if user is Pro
export const isPro = (): boolean => {
    return getSubscription().plan === 'pro';
};
