import { supabase } from './supabaseClient';

export interface FiscalConfig {
    user_id: string;
    certificate_path: string | null;
    municipal_params: any;
    environment: 'homologation' | 'production';
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

    // 3. Issue NFS-e (Call Edge Function)
    async emitNFSe(invoiceId: string) {
        try {
            // New logic: Call Node.js Microservice
            // For local dev, assuming running on port 3000
            const response = await fetch('http://localhost:3000/emit-nfse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ invoiceId })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Falha ao conectar com serviço de emissão');
            }

            return await response.json();

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
    }
};
