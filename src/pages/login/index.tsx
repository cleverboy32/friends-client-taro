import { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Layout from '@/components/Layout';

const words = ['饭搭子', '游戏搭子', '自习搭子', '旅行搭子'];

export default function Login() {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isLoginMode, setIsLoginMode] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    return (
        <Layout className="box-border">
            <View className="relative flex flex-col px-[32px] flex-1 w-full bg-white mx-auto overflow-hidden">
                <View className="inline-block w-[100px] items-center px-[16px] py-[6px] rounded-full bg-[#9dc88d]">
                    <Text className="text-white font-bold tracking-[4px]">搭子</Text>
                </View>

                <View className="relative z-10 pt-[40px] pb-[24px] box-border my-auto">
                    <Text className="block mt-[40px] text-center text-[#627081] text-[28px] leading-[42px]">
                        欢迎👏🏻, 你的【
                        <Text className="text-[#1a9b4d] font-semibold text-[50px] border-b-[6px] border-[#d7f4de] px-[8px]">
                            {words[currentWordIndex]}
                        </Text>
                        】正在等你 ~
                    </Text>

                    <View className="mt-[64px] rounded-[28px] bg-white/90 backdrop-blur-2xl  px-[20px] py-[24px] box-border">
                        {isLoginMode ? (
                            <LoginForm onSwitchToRegister={() => setIsLoginMode(false)} />
                        ) : (
                            <RegisterForm onSwitchToLogin={() => setIsLoginMode(true)} />
                        )}
                    </View>
                </View>

                <Image
                    src="../../static/img/dz.png"
                    className="w-full mt-[8px]"
                />
            </View>
        </Layout>
    );
}
