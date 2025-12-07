// Default client tags/categories
export const DEFAULT_CLIENT_TAGS = [
    { id: 'vip', label: 'VIP', color: 'amber' },
    { id: 'regular', label: 'Regular', color: 'blue' },
    { id: 'new', label: 'Novo', color: 'green' },
    { id: 'inactive', label: 'Inativo', color: 'gray' },
    { id: 'business', label: 'Empresa', color: 'purple' },
    { id: 'referral', label: 'Indicação', color: 'pink' }
] as const;

export type ClientTagId = typeof DEFAULT_CLIENT_TAGS[number]['id'];

export interface ClientTag {
    id: string;
    label: string;
    color: string;
}

// Get tag color classes
export const getTagColorClasses = (color: string): { bg: string; text: string; border: string } => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
        green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
        gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
        pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
        red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
        brand: { bg: 'bg-brand-100', text: 'text-brand-700', border: 'border-brand-200' }
    };
    return colors[color] || colors.gray;
};

// Check if today is client's birthday
export const isBirthdayToday = (birthday?: string): boolean => {
    if (!birthday) return false;
    const today = new Date();
    const [month, day] = birthday.split('-').map(Number);
    return today.getMonth() + 1 === month && today.getDate() === day;
};

// Format birthday for display
export const formatBirthday = (birthday?: string): string => {
    if (!birthday) return '';
    const [month, day] = birthday.split('-');
    return `${day}/${month}`;
};

// Check if birthday is coming soon (within next 7 days)
export const isBirthdaySoon = (birthday?: string): boolean => {
    if (!birthday) return false;
    const today = new Date();
    const [month, day] = birthday.split('-').map(Number);

    const thisYear = today.getFullYear();
    let birthdayDate = new Date(thisYear, month - 1, day);

    // If birthday already passed this year, check next year
    if (birthdayDate < today) {
        birthdayDate = new Date(thisYear + 1, month - 1, day);
    }

    const diffTime = birthdayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 && diffDays <= 7;
};
