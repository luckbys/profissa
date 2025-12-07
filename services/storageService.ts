import { Client, Appointment, UserProfile, Expense } from '../types';

const DB_NAME = 'GerenteDeBolsoDB';
const DB_VERSION = 2; // Incremented version for Expenses

interface DBSchema {
    clients: Client;
    appointments: Appointment;
    expenses: Expense;
}

let db: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;

            // Create clients store
            if (!database.objectStoreNames.contains('clients')) {
                database.createObjectStore('clients', { keyPath: 'id' });
            }

            // Create appointments store
            if (!database.objectStoreNames.contains('appointments')) {
                const appointmentsStore = database.createObjectStore('appointments', { keyPath: 'id' });
                appointmentsStore.createIndex('clientId', 'clientId', { unique: false });
                appointmentsStore.createIndex('date', 'date', { unique: false });
            }

            // Create expenses store (Version 2)
            if (!database.objectStoreNames.contains('expenses')) {
                const expensesStore = database.createObjectStore('expenses', { keyPath: 'id' });
                expensesStore.createIndex('date', 'date', { unique: false });
                expensesStore.createIndex('category', 'category', { unique: false });
            }
        };
    });
};

// Generic functions for any store
export const getAll = <T extends keyof DBSchema>(storeName: T): Promise<DBSchema[T][]> => {
    return new Promise(async (resolve, reject) => {
        try {
            const database = await initDB();
            const transaction = database.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = () => {
                reject(request.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};

export const addItem = <T extends keyof DBSchema>(storeName: T, item: DBSchema[T]): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const database = await initDB();
            const transaction = database.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(item);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
};

export const updateItem = <T extends keyof DBSchema>(storeName: T, item: DBSchema[T]): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const database = await initDB();
            const transaction = database.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(item);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteItem = <T extends keyof DBSchema>(storeName: T, id: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const database = await initDB();
            const transaction = database.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
};

export const clearStore = <T extends keyof DBSchema>(storeName: T): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            const database = await initDB();
            const transaction = database.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        } catch (error) {
            reject(error);
        }
    });
};

// User Profile - using LocalStorage (simpler for single object)
const PROFILE_KEY = 'gerente_bolso_profile';

export const getProfile = (): UserProfile | null => {
    try {
        const data = localStorage.getItem(PROFILE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

export const saveProfile = (profile: UserProfile): void => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
        console.error('Failed to save profile:', error);
    }
};

// Bulk insert for initial data
export const bulkInsert = async <T extends keyof DBSchema>(
    storeName: T,
    items: DBSchema[T][]
): Promise<void> => {
    const database = await initDB();
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);

        items.forEach(item => store.put(item));
    });
};
