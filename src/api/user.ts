import { get, post } from '@/utils/request';
import type { UserInfo, LoginParams, RegisterParams, UpdateUserParams } from '@/types/user';

// 用户登录
export const login = (data: LoginParams) => {
    return post<UserInfo>('/user/login', data);
};

// 用户注册
export const register = (data: RegisterParams) => {
    return post<UserInfo>('/user/register', data);
};

// 退出登录
export const logout = () => {
    return post('/user/logout');
};

// 获取用户信息
export const getUserInfo = () => {
    return get<UserInfo>('/user/info');
};

// 更新用户信息
export const updateUser = (data: UpdateUserParams) => {
    return post<UserInfo>('/user/update', data);
};
