import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useUserStore from '@/store/user';

interface RegisterFormData {
    username: string;
    password: string;
    email: string;
    phone: string;
}

interface Props {
    onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        password: '',
        email: '',
        phone: '',
    });
    const { register, isLoading } = useUserStore();

    // 表单字段变更处理
    const handleInputChange = (field: keyof RegisterFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // 邮箱验证
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 手机号验证
    const validatePhone = (phone: string) => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    };

    // 表单验证
    const validateForm = () => {
        if (!formData.username.trim()) {
            Taro.showToast({
                title: '请输入用户名',
                icon: 'none',
                duration: 2000,
            });
            return false;
        }
        if (!formData.password || formData.password.length < 6) {
            Taro.showToast({
                title: '密码长度不能少于6位',
                icon: 'none',
                duration: 2000,
            });
            return false;
        }
        if (!formData.email.trim() || !validateEmail(formData.email)) {
            Taro.showToast({
                title: '请输入有效的邮箱地址',
                icon: 'none',
                duration: 2000,
            });
            return false;
        }
        if (!formData.phone.trim() || !validatePhone(formData.phone)) {
            Taro.showToast({
                title: '请输入有效的手机号',
                icon: 'none',
                duration: 2000,
            });
            return false;
        }
        return true;
    };

    // 提交逻辑
    const onSubmit = async () => {
        if (!validateForm()) return;

        try {
            await register(formData);
            // 注册成功后自动切换到登录页
            onSwitchToLogin();
        } catch (error) {
            // 错误已经被统一处理
            console.error('注册失败:', error);
        }
    };

    return (
        <View className="w-full">
            <View className="mb-6">
                <View className="flex items-center mb-[8px]">
                    <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                    <Text className="text-[#5c6470] text-[26px]">用户名</Text>
                </View>
                <Input
                    className="rounded-[20px] border border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c8]"
                    type="text"
                    placeholder="请输入用户名"
                    value={formData.username}
                    onInput={(e) => handleInputChange('username', e.detail.value)}
                    disabled={isLoading}
                />
            </View>

            <View className="mb-6">
                <View className="flex items-center mb-[8px]">
                    <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                    <Text className="text-[#5c6470] text-[26px]">密码</Text>
                </View>
                <Input
                    className="rounded-[20px] border border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c8]"
                    password
                    value={formData.password}
                    onInput={(e) => handleInputChange('password', e.detail.value)}
                    disabled={isLoading}
                />
            </View>

            <View className="mb-6">
                <View className="flex items-center mb-[8px]">
                    <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                    <Text className="text-[#5c6470] text-[26px]">邮箱</Text>
                </View>
                <Input
                    className="rounded-[20px] border border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c8]"
                    placeholder="请输入邮箱"
                    value={formData.email}
                    onInput={(e) => handleInputChange('email', e.detail.value)}
                    disabled={isLoading}
                />
            </View>

            <View className="mb-6">
                <View className="flex items-center mb-[8px]">
                    <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                    <Text className="text-[#5c6470] text-[26px]">手机号</Text>
                </View>
                <Input
                    className="rounded-[20px] border border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c8]"
                    placeholder="请输入手机号"
                    type="number"
                    value={formData.phone}
                    onInput={(e) => handleInputChange('phone', e.detail.value)}
                    disabled={isLoading}
                />
            </View>

            <Button
                className="w-full bg-gradient-to-r mt-[40px] from-[#ffd86f] to-[#fcb045] text-[#5e3c00] text-[28px] font-semibold py-[20px] rounded-[26px] shadow-[0_12px_18px_rgba(252,176,69,0.35)]"
                onClick={onSubmit}
                disabled={isLoading}>
                {isLoading ? '注册中...' : '注册'}
            </Button>

            <Text
                className="text-primary hover:text-primary-dark mt-4 text-center block"
                onClick={onSwitchToLogin}>
                已有账号？立即登录
            </Text>
        </View>
    );
}
