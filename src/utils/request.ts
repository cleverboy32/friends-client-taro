import Taro from '@tarojs/taro';

// 接口返回数据的通用格式
interface ResponseData<T = any> {
    code: number;
    data: T;
    message: string;
}

// 创建一个简单的消息提示函数
const showErrorMessage = (message: string) => {
    // 使用小程序的 toast 方式显示错误信息
    Taro.showToast({
        title: message,
        icon: 'none',
        duration: 2000,
    });
};

// Taro 请求配置
const baseConfig = {
    baseURL: 'https://www.meetu.online/api', // 需要替换为实际的 API 域名
    timeout: 10000, // 请求超时时间
};

// 创建统一的请求函数
const request = async <T = any>(config: any): Promise<T> => {
    try {
        // 配置文件头

        const token = Taro.getStorageSync('x-token');

        const defaultHeaders = {
            'Content-Type': 'application/json;charset=UTF-8',
            Authorization: token,
        };

        // 合并配置
        const finalConfig = {
            ...baseConfig,
            ...config,
            header: {
                ...defaultHeaders,
                ...config.header,
            },
        };

        const { url, baseURL = baseConfig.baseURL, ...rest } = finalConfig;
        const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

        const response = await Taro.request({
            ...rest,
            url: fullUrl,
            method: (config.method || 'GET').toUpperCase() as any,
        });

        // --- 登录请求调试 ---
        const tokenHeaderKey = 'X-Token';
        const lowercaseTokenHeaderKey = 'x-token';

        console.log('----------- 登录请求调试 -----------');
        console.log('完整的响应头 (response.header):', response.header);

        const tokenToStore = response.header[tokenHeaderKey] || response.header[lowercaseTokenHeaderKey];
        
        if (tokenToStore) {
            console.log('准备存储的 Token 值:', tokenToStore);
            try {
                Taro.setStorageSync('x-token', tokenToStore);
                console.log('Taro.setStorageSync 调用成功！');

                // 立刻读回来验证一下
                const storedToken = Taro.getStorageSync('x-token');
                console.log('从 Storage 中立即读回的 Token:', storedToken);

                if (storedToken === tokenToStore) {
                    console.log('✅ 验证成功：写入和读出的值一致！');
                } else {
                    console.error('❌ 验证失败：写入后未能正确读出！');
                }
            } catch (e) {
                console.error('Taro.setStorageSync 抛出异常:', e);
            }
        } else {
             // 如果这不是登录请求，这里没有 token 是正常的，所以不打印警告
            if (url.includes('login')) { // 假设登录接口的URL路径包含'login'
                 console.warn('警告：登录请求的响应头中未找到 X-Token 或 x-token，无法存储。');
            }
        }
        console.log('------------------------------------');
        // --- 结束调试 ---

        // 处理响应数据
        const res = response.data as ResponseData<T>;

        // 检查业务错误码
        if (res.code !== 200) {
            showErrorMessage(res.message || '请求失败');
            throw new Error(res.message || '请求失败');
        }

        return res.data;
    } catch (error: any) {
        // 处理网络错误
        if (error.errMsg === 'request:fail') {
            showErrorMessage('网络异常，请检查网络连接');
        } else if (error.errMsg === 'request:timeout') {
            showErrorMessage('请求超时，请稍后重试');
        } else if (error.statusCode === 401) {
            // 401 认证错误，跳转到登录页
            Taro.showToast({
                title: '未登录或登录已过期',
                icon: 'none',
                duration: 2000,
            });
            setTimeout(() => {
                Taro.reLaunch({ url: '/pages/login/index' });
            }, 2000);
        } else if (error.statusCode) {
            showErrorMessage(`请求失败：${error.statusCode}`);
        } else if (error.message) {
            // 之前抛出的业务错误
            throw error;
        } else {
            showErrorMessage('请求失败，请稍后重试');
        }
        throw error;
    }
};

interface RequestOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    params?: any;
    header?: any;
    timeout?: number;
    baseURL?: string;
}

// 封装GET请求
export function get<T = any>(
    url: string,
    params?: any,
    config?: Partial<RequestOptions>,
): Promise<T> {
    return request<T>({
        ...config,
        url,
        method: 'GET',
        data: params,
    });
}

// 封装POST请求
export function post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestOptions>,
): Promise<T> {
    return request<T>({
        ...config,
        url,
        method: 'POST',
        data,
    });
}

// 封装PUT请求
export function put<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestOptions>,
): Promise<T> {
    return request<T>({
        ...config,
        url,
        method: 'PUT',
        data,
    });
}

// 封装DELETE请求
export function del<T = any>(url: string, config?: Partial<RequestOptions>): Promise<T> {
    return request<T>({
        ...config,
        url,
        method: 'DELETE',
    });
}

// 导出request实例
export default request;
