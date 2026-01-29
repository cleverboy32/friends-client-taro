import { post } from '@/utils/request';
import Taro from '@tarojs/taro';

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
        header: { 'Content-Type': 'multipart/form-data' },
    });
};

export const taroUpload = async (filePath: string) => {
    const token = Taro.getStorageSync('x-token');
    const uploadRes = await Taro.uploadFile({
        url: 'https://www.meetu.online/api/upload',
        filePath,
        name: 'file',
        header: {
            Authorization: token || '',
        },
    });
    return JSON.parse(uploadRes.data) as {
        code: number;
        data: UploadResponseData;
        message: string;
    };
};
