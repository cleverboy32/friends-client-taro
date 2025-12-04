import { create } from 'zustand';
import type { UserInfo } from '@/types/user';
import {
    login as loginApi,
    register as registerApi,
    logout as logoutApi,
    getUserInfo as getUserInfoApi,
} from '@/api/user';
import type { LoginParams, RegisterParams } from '@/types/user';

interface UserState {
    // 状态
    userInfo: UserInfo | null;
    isLoading: boolean;

    // 方法
    setUserInfo: (userInfo: UserInfo | null) => void;
    getUserInfo: () => Promise<void>;
    login: (params: LoginParams) => Promise<void>;
    register: (params: RegisterParams) => Promise<void>;
    logout: () => Promise<void>;
    clearUserInfo: () => void;
}

const useUserStore = create<UserState>((set, get) => ({
    // 初始状态
    userInfo: null,
    isLoading: false,

    // 设置用户信息
    setUserInfo: (userInfo) => set({ userInfo }),

    // 获取用户信息
    getUserInfo: async () => {
        try {
            set({ isLoading: true });
            const data = await getUserInfoApi();
            set({ userInfo: data });
        } catch (error) {
            // 如果获取用户信息失败，清除用户信息
            get().clearUserInfo();
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // 登录
    login: async (params) => {
        try {
            set({ isLoading: true });
            const data = await loginApi(params);
            set({ userInfo: data });
        } catch (error) {
            // 错误已经被 request.ts 处理
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // 注册
    register: async (params) => {
        try {
            set({ isLoading: true });
            const data = await registerApi(params);
            set({ userInfo: data });
        } catch (error) {
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // 退出登录
    logout: async () => {
        try {
            set({ isLoading: true });
            await logoutApi();
            get().clearUserInfo();
        } catch (error) {
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // 清除用户信息
    clearUserInfo: () => {
        set({ userInfo: null });
    },
}));

export default useUserStore;
