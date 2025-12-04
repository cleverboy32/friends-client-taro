import { View, Text } from '@tarojs/components';
import BottomBar from '@/components/BottomBar';
import Layout from '@/components/Layout';

const NotificationsPage = () => {
    return (
        <Layout className="bg-[#f6f7fb]">
            <View className="pt-[80px] px-[24px] pb-[140px] flex-1">
                <Text className="text-[32px] font-semibold text-[#2c3140] mb-[20px]">通知</Text>
                <View className="rounded-[24px] bg-white shadow-[0_12px_30px_rgba(183,193,210,0.35)] px-[28px] py-[40px] text-center text-[#a0a7b8] text-[26px]">
                    暂时还没有新的通知
                </View>
            </View>
            <BottomBar activeKey="notifications" />
        </Layout>
    );
};

export default NotificationsPage;

