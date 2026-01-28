import { useState, memo } from 'react';
import { View, Text, Input, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useUserStore from '@/store/user';

interface LoginFormData {
    username: string;
    password: string;
}

export default memo(function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
    });
    const [avatarUrl, setAvatarUrl] = useState('https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'); // 默认头像
    const { login, isLoading } = useUserStore();

    const onChooseAvatar = (e) => {
        const { avatarUrl: tempAvatarUrl } = e.detail;

        Taro.showLoading({ title: '上传中...' });

        const token = Taro.getStorageSync('x-token');

        Taro.uploadFile({
            url: 'https://www.meetu.online/api/upload', // 服务器上传地址
            filePath: tempAvatarUrl,
            name: 'file',
            header: {
                Authorization: token,
            },
            success: (res) => {
                // uploadFile 返回的 res.data 是字符串，需要手动解析
                const data = JSON.parse(res.data);

                if (data.code === 200 && data.data.imageUrl) {
                    // 更新为服务器返回的永久链接
                    setAvatarUrl(data.data.imageUrl);
                    Taro.showToast({ icon: 'success', title: '上传成功' });
                } else {
                    Taro.showToast({ icon: 'none', title: data.message || '上传失败' });
                }
            },
            fail: (err) => {
                console.error('上传失败:', err);
                Taro.showToast({ icon: 'none', title: '上传失败，请重试' });
            },
            complete: () => {
                Taro.hideLoading();
            }
        });
    };


    const handleUsernameChange = (e: any) => {
        setFormData((prev) => ({ ...prev, username: e.detail.value }));
    };

    const handlePasswordChange = (e: any) => {
        setFormData((prev) => ({ ...prev, password: e.detail.value }));
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            Taro.showToast({
                title: '请输入或选择微信昵称',
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

        const data = await Taro.login();

        try {
            // 在实际登录请求中，你可能需要带上 avatarUrl
            await login({ 
                name: formData.username,
                password: formData.password,
                avatar: avatarUrl,
                openId: data.code,
            });
            Taro.navigateTo({ url: '/pages/discover/index' });
        } catch (error) {
            console.error('登录失败:', error);
        }
    };

    return (
        <View className="w-full relative">
            <View className="flex flex-col items-center mb-4">
                <Button
                    className="w-20 h-20 rounded-full p-0 border-none after:border-none overflow-hidden"
                    openType="chooseAvatar"
                    onChooseAvatar={onChooseAvatar}
                >
                    <Image src={avatarUrl} className="w-full h-full" />
                </Button>
                <Text className="text-gray-500 text-xs mt-2">点击上方选择头像</Text>
            </View>

            <View className="mb-[18px]">
                <View className="flex items-center mb-[8px]">
                    <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                    <Text className="text-[#5c6470] text-[26px]">用户名</Text>
                </View>
                <Input
                    className="rounded-[20px] border border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c_c8c8]"
                    type="nickname"
                    placeholder="请输入微信昵称"
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
                    className="w-full bg-gradient-to-r mt-[40px] from-[#b5caa0] to-[#6a8463] text-[#5e3c00] text-[28px] font-semibold py-[20px] rounded-[26px] ]"
                    onClick={onSubmit}
                    disabled={isLoading}>
                    {isLoading ? '登录中...' : '登 录'}
                </Button>
            </View>
        </View>
    );
});
