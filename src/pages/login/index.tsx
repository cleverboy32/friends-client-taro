import { View, Text } from '@tarojs/components';
import LoginForm from './components/LoginForm';
import Layout from '@/components/Layout';
import Title from './components/Title';

export default function Login() {
    return (
        <Layout className="box-border">
            <View className="relative flex flex-col px-[32px] flex-1 w-full bg-white mx-auto overflow-hidden">
                <View className="inline-block w-[100px] items-center px-[16px] py-[6px] rounded-full bg-[#9dc88d]">
                    <Text className="text-white font-bold tracking-[4px]">搭子</Text>
                </View>

                <View className="relative z-10 pb-[24px] pt-[40px] box-border">
                    <Title />

                    <View className="mt-[120px] rounded-[28px] bg-white/90 backdrop-blur-2xl  px-[20px] py-[24px] box-border">
                        <LoginForm />
                    </View>
                </View>
            </View>
        </Layout>
    );
}
