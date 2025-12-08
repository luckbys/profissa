// React Query hooks for data management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client, Appointment, UserProfile } from '../types';
import {
    initDB,
    getAll,
    addItem,
    updateItem,
    deleteItem,
    getProfile,
    saveProfile
} from '../services/storageService';

// Query Keys
export const queryKeys = {
    clients: ['clients'] as const,
    appointments: ['appointments'] as const,
    profile: ['profile'] as const,
};

// Default Profile
const DEFAULT_PROFILE: UserProfile = {
    name: 'Meu Nome',
    profession: 'Minha Profissão',
    phone: '(00) 00000-0000',
    email: 'email@exemplo.com'
};

// Initialize DB once
let dbInitialized = false;
const ensureDB = async () => {
    if (!dbInitialized) {
        await initDB();
        dbInitialized = true;
    }
};

// ============ CLIENTS HOOKS ============

export const useClients = () => {
    return useQuery({
        queryKey: queryKeys.clients,
        queryFn: async () => {
            await ensureDB();
            return getAll('clients') as Promise<Client[]>;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useAddClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (client: Client) => {
            await ensureDB();
            await addItem('clients', client);
            return client;
        },
        onSuccess: (newClient) => {
            queryClient.setQueryData<Client[]>(queryKeys.clients, (old = []) => [...old, newClient]);
        },
    });
};

export const useUpdateClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (client: Client) => {
            await ensureDB();
            await updateItem('clients', client);
            return client;
        },
        onSuccess: (updatedClient) => {
            queryClient.setQueryData<Client[]>(queryKeys.clients, (old = []) =>
                old.map(c => c.id === updatedClient.id ? updatedClient : c)
            );
        },
    });
};

export const useDeleteClient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await ensureDB();
            await deleteItem('clients', id);
            return id;
        },
        onSuccess: (deletedId) => {
            queryClient.setQueryData<Client[]>(queryKeys.clients, (old = []) =>
                old.filter(c => c.id !== deletedId)
            );
        },
    });
};

// ============ APPOINTMENTS HOOKS ============

export const useAppointments = () => {
    return useQuery({
        queryKey: queryKeys.appointments,
        queryFn: async () => {
            await ensureDB();
            return getAll('appointments') as Promise<Appointment[]>;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useAddAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appointment: Appointment) => {
            await ensureDB();
            await addItem('appointments', appointment);
            return appointment;
        },
        onSuccess: (newAppointment) => {
            queryClient.setQueryData<Appointment[]>(queryKeys.appointments, (old = []) => [...old, newAppointment]);
        },
    });
};

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appointment: Appointment) => {
            await ensureDB();
            await updateItem('appointments', appointment);
            return appointment;
        },
        onSuccess: (updatedAppointment) => {
            queryClient.setQueryData<Appointment[]>(queryKeys.appointments, (old = []) =>
                old.map(a => a.id === updatedAppointment.id ? updatedAppointment : a)
            );
        },
    });
};

export const useToggleAppointmentStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await ensureDB();
            const appointments = await getAll('appointments') as Appointment[];
            const appointment = appointments.find(a => a.id === id);

            if (!appointment) throw new Error('Appointment not found');

            const updated: Appointment = {
                ...appointment,
                status: appointment.status === 'pending' ? 'completed' : 'pending'
            };
            await updateItem('appointments', updated);
            return updated;
        },
        onSuccess: (updatedAppointment) => {
            queryClient.setQueryData<Appointment[]>(queryKeys.appointments, (old = []) =>
                old.map(a => a.id === updatedAppointment.id ? updatedAppointment : a)
            );
        },
    });
};

// ============ PROFILE HOOKS ============

export const useProfile = () => {
    return useQuery({
        queryKey: queryKeys.profile,
        queryFn: async () => {
            await ensureDB();
            const profile = getProfile();
            return profile || DEFAULT_PROFILE;
        },
        staleTime: Infinity, // Profile rarely changes
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            saveProfile(profile);
            return profile;
        },
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData<UserProfile>(queryKeys.profile, updatedProfile);
        },
    });
};

// ============ COMPOSITE HOOK (Backward Compatible) ============

export const useLocalDataQuery = () => {
    const clientsQuery = useClients();
    const appointmentsQuery = useAppointments();
    const profileQuery = useProfile();

    const addClientMutation = useAddClient();
    const updateClientMutation = useUpdateClient();
    const deleteClientMutation = useDeleteClient();

    const addAppointmentMutation = useAddAppointment();
    const toggleStatusMutation = useToggleAppointmentStatus();

    const updateProfileMutation = useUpdateProfile();

    const isLoading = clientsQuery.isLoading || appointmentsQuery.isLoading || profileQuery.isLoading;

    return {
        // Data
        clients: clientsQuery.data || [],
        appointments: appointmentsQuery.data || [],
        userProfile: profileQuery.data || DEFAULT_PROFILE,
        isLoading,
        isOnline: navigator.onLine,

        // Client operations
        addClient: async (client: Client) => { await addClientMutation.mutateAsync(client); },
        updateClient: async (client: Client) => { await updateClientMutation.mutateAsync(client); },
        removeClient: async (id: string) => { await deleteClientMutation.mutateAsync(id); },

        // Appointment operations
        addAppointment: async (appointment: Appointment) => { await addAppointmentMutation.mutateAsync(appointment); },
        toggleAppointmentStatus: async (id: string) => { await toggleStatusMutation.mutateAsync(id); },

        // Profile operations
        setUserProfile: (profile: UserProfile) => { updateProfileMutation.mutate(profile); },
    };
};
