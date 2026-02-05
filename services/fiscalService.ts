import { supabase } from './supabaseClient';

export interface MunicipalParams {
    [key: string]: unknown;
}

export interface FiscalConfig {
    user_id: string;
    certificate_path: string | null;
    certificate_password?: string;
    municipal_params: MunicipalParams;
    environment: 'homologation' | 'production';
    // Campos fiscais adicionais
    cnpj?: string;
    inscricao_municipal?: string;
    codigo_municipio?: string;
    aliquota_iss?: number;
    codigo_servico?: string;
    codigo_tributacao_nacional?: string;
    razao_social?: string;
}

export interface NFS_e {
    id: string;
    status: 'draft' | 'pending' | 'authorized' | 'rejected' | 'cancelled';
    nfse_number: string | null;
    url_pdf: string | null;
    service_amount: number;
    issue_date: string;
    error_message?: string;
}

export const fiscalService = {
    // 1. Get Configuration
    async getConfig(userId: string): Promise<FiscalConfig | null> {
        const { data, error } = await supabase
            .from('fiscal_config')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching fiscal config:', error);
            return null;
        }
        return data;
    },

    // 2. Upload Certificate
    async uploadCertificate(userId: string, file: File, password: string): Promise<boolean> {
        try {
            // Upload file to storage
            const filePath = `certs/${userId}/${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('fiscal-certs')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Save config to DB
            const { error: dbError } = await supabase
                .from('fiscal_config')
                .upsert({
                    user_id: userId,
                    certificate_path: filePath,
                    certificate_password: password, // In production, encrypt this before sending/storing!
                    updated_at: new Date().toISOString()
                });

            if (dbError) throw dbError;
            return true;
        } catch (error) {
            console.error('Error uploading certificate:', error);
            return false;
        }
    },

    // 3. Issue NFS-e (Call Node.js Microservice)
    async emitNFSe(invoiceId: string) {
        try {
            // Get current session token
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            // Use environment variable or default to localhost:4000
            const serviceUrl = import.meta.env.VITE_NFSE_SERVICE_URL || 'http://localhost:4000';
            const response = await fetch(`${serviceUrl}/emit-nfse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ invoiceId })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.erro || 'Falha ao conectar com serviço de emissão');
            }

            return result;

            /* Old Edge Function Call
            const { data, error } = await supabase.functions.invoke('emit-nfse', {
                body: { invoiceId }
            });

            if (error) throw error;
            return data;
            */
        } catch (error) {
            console.error('Error invoking emit-nfse service:', error);
            throw error;
        }
    },

    // 4. Create Invoice Draft (Prepare for emission)
    async createInvoiceDraft(userId: string, appointmentId: string | null, serviceAmount: number, clientId?: string) {
        const { data, error } = await supabase
            .from('nfs_e')
            .insert({
                user_id: userId,
                appointment_id: appointmentId,
                client_id: clientId,
                service_amount: serviceAmount,
                status: 'draft'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 5. Get Invoices
    async getInvoices(userId: string) {
        const { data, error } = await supabase
            .from('nfs_e')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as NFS_e[];
    },

    // 6. Update Environment
    async updateEnvironment(userId: string, env: 'homologation' | 'production') {
        const { error } = await supabase
            .from('fiscal_config')
            .upsert({
                user_id: userId,
                environment: env,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    },

    // 7. Update Fiscal Data (CNPJ, IM, etc.)
    async updateFiscalData(userId: string, data: Partial<FiscalConfig>) {
        const { error } = await supabase
            .from('fiscal_config')
            .upsert({
                user_id: userId,
                ...data,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
    }
};
