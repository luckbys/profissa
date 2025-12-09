import { ServiceTemplate } from '../types/serviceTemplate';
import { getCurrentUser } from './supabaseClient';
import { saveTemplateToSupabase, deleteTemplateFromSupabase } from './syncService';

const TEMPLATES_KEY = 'gerente_bolso_service_templates';

// Helper to check if string is a valid UUID
const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};

// Get all templates
export const getTemplates = (): ServiceTemplate[] => {
    try {
        const data = localStorage.getItem(TEMPLATES_KEY);
        if (!data) return [];

        let templates: ServiceTemplate[] = JSON.parse(data);
        let hasChanges = false;

        // Migrate legacy numeric IDs to UUIDs
        templates = templates.map(t => {
            if (!isValidUUID(t.id)) {
                hasChanges = true;
                return { ...t, id: crypto.randomUUID() };
            }
            return t;
        });

        if (hasChanges) {
            localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
        }

        return templates;
    } catch {
        return [];
    }
};



// Save a new template
export const saveTemplate = async (template: ServiceTemplate): Promise<void> => {
    try {
        const existing = getTemplates();
        const updated = [...existing, template];
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));

        // Sync to Supabase
        const user = await getCurrentUser();
        if (user) {
            await saveTemplateToSupabase(user.id, template);
        }
    } catch (error) {
        console.error('Failed to save template:', error);
    }
};

// Update a template
export const updateTemplate = async (template: ServiceTemplate): Promise<void> => {
    try {
        const templates = getTemplates();
        const updated = templates.map(t => t.id === template.id ? template : t);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));

        // Sync to Supabase
        const user = await getCurrentUser();
        if (user) {
            await saveTemplateToSupabase(user.id, template);
        }
    } catch (error) {
        console.error('Failed to update template:', error);
    }
};

// Delete a template
export const deleteTemplate = async (id: string): Promise<void> => {
    try {
        const templates = getTemplates();
        const updated = templates.filter(t => t.id !== id);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));

        // Sync to Supabase
        const user = await getCurrentUser();
        if (user) {
            await deleteTemplateFromSupabase(id);
        }
    } catch (error) {
        console.error('Failed to delete template:', error);
    }
};

// Get templates by category
export const getTemplatesByCategory = (category: string): ServiceTemplate[] => {
    return getTemplates().filter(t => t.category === category || !category);
};

// Search templates
export const searchTemplates = (query: string): ServiceTemplate[] => {
    const q = query.toLowerCase();
    return getTemplates().filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
};
