import { ServiceTemplate } from '../types/serviceTemplate';

const TEMPLATES_KEY = 'gerente_bolso_service_templates';

// Get all templates
export const getTemplates = (): ServiceTemplate[] => {
    try {
        const data = localStorage.getItem(TEMPLATES_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Save a new template
export const saveTemplate = (template: ServiceTemplate): void => {
    try {
        const existing = getTemplates();
        const updated = [...existing, template];
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save template:', error);
    }
};

// Update a template
export const updateTemplate = (template: ServiceTemplate): void => {
    try {
        const templates = getTemplates();
        const updated = templates.map(t => t.id === template.id ? template : t);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to update template:', error);
    }
};

// Delete a template
export const deleteTemplate = (id: string): void => {
    try {
        const templates = getTemplates();
        const updated = templates.filter(t => t.id !== id);
        localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
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
