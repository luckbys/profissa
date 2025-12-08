import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    needsOnboarding: boolean;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
        needsOnboarding: false
    });

    useEffect(() => {
        // If Supabase is not configured, still require login
        // but check if user has already logged in before (localStorage flag)
        if (!isSupabaseConfigured()) {
            const hasLocalSession = localStorage.getItem('profissa_local_auth') === 'true';
            setAuthState({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: hasLocalSession, // Only authenticated if previously logged in
                needsOnboarding: false
            });
            return;
        }

        // Get initial session
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    const needsOnboarding = await checkOnboardingStatus(session.user.id);
                    setAuthState({
                        user: session.user,
                        session,
                        isLoading: false,
                        isAuthenticated: true,
                        needsOnboarding
                    });
                } else {
                    setAuthState({
                        user: null,
                        session: null,
                        isLoading: false,
                        isAuthenticated: false,
                        needsOnboarding: false
                    });
                }
            } catch (error) {
                console.error('Auth error:', error);
                setAuthState({
                    user: null,
                    session: null,
                    isLoading: false,
                    isAuthenticated: false,
                    needsOnboarding: false
                });
            }
        };

        initSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const needsOnboarding = await checkOnboardingStatus(session.user.id);
                setAuthState({
                    user: session.user,
                    session,
                    isLoading: false,
                    isAuthenticated: true,
                    needsOnboarding
                });
            } else {
                setAuthState({
                    user: null,
                    session: null,
                    isLoading: false,
                    isAuthenticated: false,
                    needsOnboarding: false
                });
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
        // Check localStorage first for offline support
        const localOnboarding = localStorage.getItem('profissa_onboarding_complete');
        if (localOnboarding === 'true') {
            return false;
        }

        // Check if profile exists and is complete
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('name, profession')
                .eq('user_id', userId)
                .single();

            if (profile && profile.name && profile.profession) {
                localStorage.setItem('profissa_onboarding_complete', 'true');
                return false;
            }

            return true;
        } catch {
            return true;
        }
    };

    const completeOnboarding = () => {
        localStorage.setItem('profissa_onboarding_complete', 'true');
        setAuthState(prev => ({
            ...prev,
            needsOnboarding: false
        }));
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            localStorage.removeItem('profissa_onboarding_complete');
            setAuthState({
                user: null,
                session: null,
                isLoading: false,
                isAuthenticated: false,
                needsOnboarding: false
            });
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return {
        ...authState,
        completeOnboarding,
        signOut,
        isConfigured: isSupabaseConfigured()
    };
};
