import React, { useState, useEffect } from 'react';
import { Upload, Shield, Check, AlertTriangle, Loader2, Building2, MapPin, Percent, FileCode, Save } from 'lucide-react';
import { fiscalService, FiscalConfig } from '../services/fiscalService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

export function FiscalSettings() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [config, setConfig] = useState<FiscalConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');

    // Form data for fiscal fields
    const [formData, setFormData] = useState({
        cnpj: '',
        inscricao_municipal: '',
        codigo_municipio: '',
        aliquota_iss: 5,
        codigo_servico: '',
        codigo_tributacao_nacional: '',
        razao_social: ''
    });

    useEffect(() => {
        if (user?.id) {
            loadConfig();
        }
    }, [user?.id]);

    const loadConfig = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        const data = await fiscalService.getConfig(user.id);
        setConfig(data);
        if (data) {
            setFormData({
                cnpj: data.cnpj || '',
                inscricao_municipal: data.inscricao_municipal || '',
                codigo_municipio: data.codigo_municipio || '',
                aliquota_iss: data.aliquota_iss || 5,
                codigo_servico: data.codigo_servico || '',
                codigo_tributacao_nacional: data.codigo_tributacao_nacional || '',
                razao_social: data.razao_social || ''
            });
        }
        setIsLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertFile(e.target.files[0]);
        }
    };

    const handleCertificateSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !certFile || !password) {
            showToast('Erro', 'Selecione o arquivo e digite a senha.', 'error');
            return;
        }

        setIsUploading(true);
        const success = await fiscalService.uploadCertificate(user.id, certFile, password);

        if (success) {
            showToast('Sucesso', 'Certificado salvo com sucesso!', 'success');
            setCertFile(null);
            setPassword('');
            loadConfig();
        } else {
            showToast('Erro', 'Erro ao salvar certificado.', 'error');
        }
        setIsUploading(false);
    };

    const handleSaveFiscalData = async () => {
        if (!user?.id) return;

        // Validate CNPJ format
        const cleanCnpj = formData.cnpj.replace(/\D/g, '');
        if (cleanCnpj && cleanCnpj.length !== 14) {
            showToast('Erro', 'CNPJ deve ter 14 dígitos.', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await fiscalService.updateFiscalData(user.id, {
                cnpj: cleanCnpj,
                inscricao_municipal: formData.inscricao_municipal,
                codigo_municipio: formData.codigo_municipio,
                aliquota_iss: formData.aliquota_iss,
                codigo_servico: formData.codigo_servico,
                codigo_tributacao_nacional: formData.codigo_tributacao_nacional,
                razao_social: formData.razao_social
            });
            showToast('Sucesso', 'Dados fiscais salvos!', 'success');
            loadConfig();
        } catch (error) {
            console.error(error);
            showToast('Erro', 'Falha ao salvar dados fiscais.', 'error');
        }
        setIsSaving(false);
    };

    const toggleEnv = async () => {
        if (!user?.id || !config) return;
        const newEnv = config.environment === 'production' ? 'homologation' : 'production';
        try {
            await fiscalService.updateEnvironment(user.id, newEnv);
            setConfig({ ...config, environment: newEnv });
            showToast('Ambiente Alterado', newEnv === 'production' ? 'Modo Produção ativado' : 'Modo Teste ativado', 'success');
        } catch (error) {
            console.error(error);
        }
    };

    const formatCNPJ = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 14);
        return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    };

    if (isLoading) return <div className="p-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Configuração Fiscal (NFS-e)</h2>
                    <p className="text-sm text-gray-500">Configure seus dados para emitir notas fiscais.</p>
                </div>
            </div>

            {/* Status do Certificado */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${config?.certificate_path ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                {config?.certificate_path ? (
                    <>
                        <Check className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Certificado Configurado</p>
                            <p className="text-xs opacity-80">Seu ambiente está pronto para emitir notas.</p>
                        </div>
                    </>
                ) : (
                    <>
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold">Certificado Pendente</p>
                            <p className="text-xs opacity-80">Você precisa fazer upload do certificado A1 (.pfx ou .p12).</p>
                        </div>
                    </>
                )}
            </div>

            {/* Ambiente */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                    <p className="text-sm font-medium text-gray-700">Ambiente de Emissão</p>
                    <p className="text-xs text-gray-500">{config?.environment === 'production' ? 'Produção (Valendo)' : 'Homologação (Teste)'}</p>
                </div>
                <button
                    onClick={toggleEnv}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${config?.environment === 'production' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}
                >
                    Trocar para {config?.environment === 'production' ? 'Teste' : 'Produção'}
                </button>
            </div>

            {/* Dados da Empresa/MEI */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Building2 size={18} className="text-gray-500" />
                    Dados do Prestador
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social / Nome</label>
                        <input
                            type="text"
                            value={formData.razao_social}
                            onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Sua empresa ou nome MEI"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                        <input
                            type="text"
                            value={formData.cnpj}
                            onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                            placeholder="00.000.000/0001-00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Inscrição Municipal</label>
                        <input
                            type="text"
                            value={formData.inscricao_municipal}
                            onChange={(e) => setFormData({ ...formData, inscricao_municipal: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                            placeholder="CCM ou IM"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <MapPin size={14} /> Código do Município (IBGE)
                        </label>
                        <input
                            type="text"
                            value={formData.codigo_municipio}
                            onChange={(e) => setFormData({ ...formData, codigo_municipio: e.target.value.replace(/\D/g, '').slice(0, 7) })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                            placeholder="Ex: 3550308 (São Paulo)"
                        />
                        <p className="text-xs text-gray-400 mt-1">Consulte o código no site do IBGE</p>
                    </div>
                </div>
            </div>

            {/* Configuração de Serviço */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <FileCode size={18} className="text-gray-500" />
                    Configuração de Serviço
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Percent size={14} /> Alíquota ISS (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="5"
                            value={formData.aliquota_iss}
                            onChange={(e) => setFormData({ ...formData, aliquota_iss: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código do Serviço (LC 116)</label>
                        <input
                            type="text"
                            value={formData.codigo_servico}
                            onChange={(e) => setFormData({ ...formData, codigo_servico: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                            placeholder="Ex: 0107 (Suporte)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Código Tributação Nacional</label>
                        <input
                            type="text"
                            value={formData.codigo_tributacao_nacional}
                            onChange={(e) => setFormData({ ...formData, codigo_tributacao_nacional: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                            placeholder="Ex: 010101"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSaveFiscalData}
                    disabled={isSaving}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                    Salvar Dados Fiscais
                </button>
            </div>

            {/* Formulário de Upload do Certificado */}
            <div className="border-t border-gray-100 pt-6 space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Upload size={18} className="text-gray-500" />
                    Certificado Digital A1
                </h3>

                <form onSubmit={handleCertificateSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo do Certificado (A1)</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pfx,.p12"
                                onChange={handleFileChange}
                                className="hidden"
                                id="cert-upload"
                            />
                            <label
                                htmlFor="cert-upload"
                                className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                            >
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Upload className="w-5 h-5" />
                                    <span className="text-sm">{certFile ? certFile.name : 'Clique para selecionar o arquivo (.pfx)'}</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Senha do Certificado</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            placeholder="Digite a senha..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading || !certFile || !password}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            'Salvar Certificado'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
