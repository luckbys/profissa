import { getAll, bulkInsert, clearStore, getProfile, saveProfile } from './storageService';
import { getDocuments } from './documentService';

const BACKUP_VERSION = 1;

export interface BackupData {
    version: number;
    timestamp: number;
    data: {
        clients: any[];
        appointments: any[];
        expenses: any[];
        documents: any[];
        profile: any;
    };
}

export const exportData = async (): Promise<void> => {
    try {
        // Fetch data from IndexedDB
        const clients = await getAll('clients');
        const appointments = await getAll('appointments');
        const expenses = await getAll('expenses');

        // Fetch data from LocalStorage
        const documents = getDocuments();
        const profile = getProfile();

        const backup: BackupData = {
            version: BACKUP_VERSION,
            timestamp: Date.now(),
            data: {
                clients,
                appointments,
                expenses,
                documents,
                profile
            }
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_gerentebolso_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Export failed:', error);
        throw new Error('Falha ao exportar dados.');
    }
};

export const importData = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) throw new Error('Arquivo vazio');

                const backup: BackupData = JSON.parse(content);

                // Basic validation
                if (!backup.version || !backup.data) {
                    throw new Error('Formato de arquivo inválido');
                }

                // 1. Clear existing data
                await clearStore('clients');
                await clearStore('appointments');
                await clearStore('expenses');

                // Clear LocalStorage (Specific keys only to avoid clearing auth/settings if any)
                localStorage.removeItem('gerente_bolso_documents');
                localStorage.removeItem('gerente_bolso_profile');

                // 2. Restore IndexedDB data
                if (backup.data.clients?.length) await bulkInsert('clients', backup.data.clients);
                if (backup.data.appointments?.length) await bulkInsert('appointments', backup.data.appointments);
                if (backup.data.expenses?.length) await bulkInsert('expenses', backup.data.expenses);

                // 3. Restore LocalStorage data
                if (backup.data.documents?.length) {
                    localStorage.setItem('gerente_bolso_documents', JSON.stringify(backup.data.documents));
                }
                if (backup.data.profile) {
                    saveProfile(backup.data.profile);
                }

                resolve();
            } catch (error) {
                console.error('Import failed:', error);
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsText(file);
    });
};
