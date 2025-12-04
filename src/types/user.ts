export interface UserInfo {
    id: number;
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    createdAt: string;
    updatedAt: string;
    bio?: string;
}

export interface LoginParams {
    name: string;
    password: string;
}

export interface RegisterParams extends LoginParams {
    email?: string;
    phone?: string;
}

export interface UpdateUserParams {
    avatar?: string;
    email?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    name?: string;
    bio?: string;
    birthday?: string; // ISO 字符串 (yyyy-MM-dd)
}
