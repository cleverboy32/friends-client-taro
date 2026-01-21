import { useState, memo } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useUserStore from '@/store/user';

interface LoginFormData {
    username: string;
    password: string;
}

interface Props {
    onSwitchToRegister: () => void;
}

export default memo(function LoginForm({ onSwitchToRegister }: Props) {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
    });
    console.log('44')
    const { login, isLoading } = useUserStore();

    const handleUsernameChange = (e: any) => {
        setFormData((prev) => ({ ...prev, username: e.detail.value }));
    };

    const handlePasswordChange = (e: any) => {
        setFormData((prev) => ({ ...prev, password: e.detail.value }));
    };

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
        return true;
    };

    const onSubmit = async () => {
        if (!validateForm()) return;

        try {
            await login({ name: formData.username, password: formData.password });
            Taro.navigateTo({ url: '/pages/discover/index' });
        } catch (error) {
            console.error('登录失败:', error);
        }
    };

    return (
        <View className="w-full relative">
            <View className="mb-[18px]">
                <View className="flex items-center mb-[8px]">
                    <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                    <Text className="text-[#5c6470] text-[26px]">用户名</Text>
                </View>
                <Input
                    className="rounded-[20px] border border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c8]"
                    type="text"
                    placeholder="请输入用户名"
                    value={formData.username}
                    onInput={handleUsernameChange}
                    disabled={isLoading}
                />
            </View>

            <View className="mb-[26px]">
                <View className="flex items-center mb-[8px]">
                    <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                    <Text className="text-[#5c6470] text-[26px]">密码</Text>
                </View>
                <Input
                    className="rounded-[20px] border border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c8]"
                    password
                    placeholder="请输入密码"
                    value={formData.password}
                    onInput={handlePasswordChange}
                    disabled={isLoading}
                />
            </View>

            <View className="text-center">
                <Button
                    className="w-full bg-gradient-to-r mt-[40px] from-[#ffd86f] to-[#fcb045] text-[#5e3c00] text-[28px] font-semibold py-[20px] rounded-[26px] shadow-[0_12px_18px_rgba(252,176,69,0.35)]"
                    onClick={onSubmit}
                    disabled={isLoading}>
                    {isLoading ? '登录中...' : '登 录'}
                </Button>

                <View className="mt-[40px] text-[#f29b38] text-[26px]">
                    <Text onClick={onSwitchToRegister}>还没有账号？立即注册</Text>
                </View>
            </View>
        </View>
    );
});
