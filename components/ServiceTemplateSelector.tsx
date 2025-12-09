import React, { useState, useEffect } from 'react';
import { ServiceTemplate, DEFAULT_CATEGORIES } from '../types/serviceTemplate';
import {
    getTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate
} from '../services/templateService';
import {
    Bookmark, Plus, Search, X, Edit2, Trash2,
    Check, DollarSign, Tag, ChevronRight, Sparkles
} from 'lucide-react';

interface ServiceTemplateSelectorProps {
    onSelect: (template: ServiceTemplate) => void;
    onSaveAsTemplate?: (name: string, description: string, price: number, category: string) => void;
    currentDescription?: string;
    currentPrice?: number;
}

const ServiceTemplateSelector: React.FC<ServiceTemplateSelectorProps> = ({
    onSelect,
    onSaveAsTemplate,
    currentDescription,
    currentPrice
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ServiceTemplate | null>(null);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Geral'
    });

    useEffect(() => {
        setTemplates(getTemplates());
    }, [isOpen]);

    // Pre-fill if saving current item as template
    useEffect(() => {
        if (showAddModal && currentDescription && !editingTemplate) {
            setNewTemplate(prev => ({
                ...prev,
                description: currentDescription,
                price: currentPrice?.toString() || ''
            }));
        }
    }, [showAddModal, currentDescription, currentPrice, editingTemplate]);

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = !searchQuery ||
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSaveTemplate = () => {
        if (!newTemplate.name || !newTemplate.description) return;

        const template: ServiceTemplate = {
            id: editingTemplate?.id || crypto.randomUUID(),
            name: newTemplate.name,
            description: newTemplate.description,
            price: parseFloat(newTemplate.price) || 0,
            category: newTemplate.category,
            createdAt: editingTemplate?.createdAt || new Date().toISOString()
        };

        if (editingTemplate) {
            updateTemplate(template);
        } else {
            saveTemplate(template);
        }

        setTemplates(getTemplates());
        resetForm();
    };

    const handleDeleteTemplate = (id: string) => {
        if (confirm('Excluir este template?')) {
            deleteTemplate(id);
            setTemplates(getTemplates());
        }
    };

    const handleEditTemplate = (template: ServiceTemplate) => {
        setEditingTemplate(template);
        setNewTemplate({
            name: template.name,
            description: template.description,
            price: template.price.toString(),
            category: template.category || 'Geral'
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setNewTemplate({ name: '', description: '', price: '', category: 'Geral' });
        setShowAddModal(false);
        setEditingTemplate(null);
    };

    const handleSelectTemplate = (template: ServiceTemplate) => {
        onSelect(template);
        setIsOpen(false);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
            >
                <Bookmark size={16} />
                <span>Templates</span>
            </button>

            {/* Template Selector Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
                    <div className="bg-white w-full max-w-md sm:rounded-2xl rounded-t-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bookmark className="text-purple-600" size={20} />
                                <h2 className="font-bold text-gray-800 text-lg">Templates de Serviço</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setShowAddModal(true); setEditingTemplate(null); }}
                                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                                >
                                    <Plus size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-4 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar template..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${!selectedCategory
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Todos
                                </button>
                                {DEFAULT_CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Template List */}
                        <div className="flex-1 overflow-y-auto p-4 pt-0">
                            {filteredTemplates.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Nenhum template encontrado</p>
                                    <button
                                        onClick={() => setShowAddModal(true)}
                                        className="mt-3 text-purple-600 text-sm font-medium hover:underline"
                                    >
                                        Criar primeiro template
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredTemplates.map(template => (
                                        <div
                                            key={template.id}
                                            className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <button
                                                    onClick={() => handleSelectTemplate(template)}
                                                    className="flex-1 text-left"
                                                >
                                                    <h4 className="font-semibold text-gray-800 text-sm">{template.name}</h4>
                                                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{template.description}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-sm font-bold text-green-600">R$ {template.price.toFixed(2)}</span>
                                                        {template.category && (
                                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[10px] font-medium rounded-full">
                                                                {template.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}
                                                        className="p-1.5 hover:bg-white rounded-lg transition-colors"
                                                    >
                                                        <Edit2 size={14} className="text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={14} className="text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Save as Template Button */}
                        {currentDescription && (
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setShowAddModal(true);
                                        setEditingTemplate(null);
                                    }}
                                    className="w-full py-3 bg-purple-50 text-purple-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors"
                                >
                                    <Sparkles size={16} />
                                    Salvar item atual como template
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add/Edit Template Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">
                                {editingTemplate ? 'Editar Template' : 'Novo Template'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Template *</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Corte de Cabelo"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                    value={newTemplate.name}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                                <textarea
                                    placeholder="Descrição completa do serviço..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
                                    value={newTemplate.description}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <DollarSign size={14} className="text-green-500" /> Preço
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                    value={newTemplate.price}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, price: e.target.value })}
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    <Tag size={14} className="text-purple-500" /> Categoria
                                </label>
                                <select
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white"
                                    value={newTemplate.category}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                >
                                    {DEFAULT_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveTemplate}
                                    disabled={!newTemplate.name || !newTemplate.description}
                                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editingTemplate ? 'Salvar' : 'Criar Template'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ServiceTemplateSelector;
