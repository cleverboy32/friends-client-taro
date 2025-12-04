import { post } from '@/utils/request';

export interface UploadResponseData {
    imageUrl: string;
    imageDetails: {
        id: number;
        filename: string;
        path: string;
        mimetype: string;
        size: number;
        // 允许服务端扩展字段
        [key: string]: any;
    };
}

export const upload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // 基于 request 实例拦截器，服务端需返回 { code, data, message }
    return post<UploadResponseData>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
