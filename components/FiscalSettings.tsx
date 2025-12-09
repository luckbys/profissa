import React, { useState, useEffect } from 'react';
import { Upload, Shield, Check, AlertTriangle, Loader2 } from 'lucide-react'; // Assuming lucide-react is available
import { fiscalService, FiscalConfig } from '../services/fiscalService';
import { useAuth } from '../hooks/useAuth';

export function FiscalSettings() {
    const { user } = useAuth();
    const [config, setConfig] = useState<FiscalConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        setIsLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertFile(e.target.files[0]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !certFile || !password) {
            setMessage({ type: 'error', text: 'Selecione o arquivo e digite a senha.' });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        const success = await fiscalService.uploadCertificate(user.id, certFile, password);

        if (success) {
            setMessage({ type: 'success', text: 'Certificado salvo com sucesso!' });
            setCertFile(null);
            setPassword('');
            loadConfig();
        } else {
            setMessage({ type: 'error', text: 'Erro ao salvar certificado.' });
        }
        setIsUploading(false);
    };

    const toggleEnv = async () => {
        if (!user?.id || !config) return;
        const newEnv = config.environment === 'production' ? 'homologation' : 'production';
        try {
            await fiscalService.updateEnvironment(user.id, newEnv);
            setConfig({ ...config, environment: newEnv });
        } catch (error) {
            console.error(error);
        }
    }

    if (isLoading) return <div className="p-4 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Configuração Fiscal (NFS-e)</h2>
                    <p className="text-sm text-gray-500">Configure seu certificado digital A1 para emitir notas.</p>
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
            {config && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Ambiente de Emissão</p>
                        <p className="text-xs text-gray-500">{config.environment === 'production' ? 'Produção (Valendo)' : 'Homologação (Teste)'}</p>
                    </div>
                    <button
                        onClick={toggleEnv}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.environment === 'production' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}
                    >
                        Trocar para {config.environment === 'production' ? 'Teste' : 'Produção'}
                    </button>
                </div>
            )}

            {/* Formulário de Upload */}
            <form onSubmit={handleSave} className="space-y-4">
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

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

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
                        'Salvar Configuração'
                    )}
                </button>
            </form>
        </div>
    );
}
