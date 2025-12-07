// MinIO Service for Logo Storage
// Uses S3-compatible API

const MINIO_CONFIG = {
    endpoint: 'https://c4crm-minio.zv7gpn.easypanel.host',
    bucket: 'logospc',
    accessKeyId: 'admin',
    secretAccessKey: 'Devs@0101'
};

// Generate unique filename
const generateFileName = (originalName: string): string => {
    const ext = originalName.split('.').pop() || 'png';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `logo_${timestamp}_${random}.${ext}`;
};

// Upload logo to MinIO using fetch (S3-compatible REST API)
export const uploadLogo = async (file: File): Promise<string> => {
    try {
        const fileName = generateFileName(file.name);
        const url = `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${fileName}`;

        // Create authorization for MinIO
        // For simple uploads, we can try using the public bucket approach
        // or implement proper S3 signature

        const formData = new FormData();
        formData.append('file', file);

        // Try direct PUT request to MinIO
        const response = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
            },
            mode: 'cors'
        });

        if (response.ok) {
            return url;
        }

        // If direct upload fails, fall back to base64 storage
        console.warn('MinIO upload failed, falling back to base64');
        return await fileToBase64(file);
    } catch (error) {
        console.error('MinIO upload error:', error);
        // Fallback to base64 on error
        return await fileToBase64(file);
    }
};

// Convert file to base64 (fallback method)
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Delete logo from MinIO (if needed)
export const deleteLogo = async (logoUrl: string): Promise<boolean> => {
    try {
        if (logoUrl.startsWith('data:')) {
            // It's a base64 image, no need to delete from MinIO
            return true;
        }

        const response = await fetch(logoUrl, {
            method: 'DELETE',
            mode: 'cors'
        });

        return response.ok;
    } catch (error) {
        console.error('MinIO delete error:', error);
        return false;
    }
};

// Check if URL is a MinIO URL
export const isMinioUrl = (url?: string): boolean => {
    return url?.startsWith(MINIO_CONFIG.endpoint) ?? false;
};

// Get public URL for logo
export const getLogoUrl = (fileName: string): string => {
    return `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${fileName}`;
};
