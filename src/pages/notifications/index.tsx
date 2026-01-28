import { View, Text, Image } from '@tarojs/components';
import BottomBar from '@/components/BottomBar';
import Layout from '@/components/Layout';
import Taro from '@tarojs/taro';
import useChatStore from '@/store/chat';

const NotificationsPage = () => {
    const { chatList } = useChatStore();

    return (
        <Layout className="px-[8px] pt-[60px] pb-[140px] bg-white">
            <View className="px-[24px]">
                {chatList.length > 0 ? (
                    <View className="rounded-[24px] bg-white shadow-[0_12px_30px_rgba(183,193,210,0.35)] px-[28px] py-[20px]">
                        {chatList.map(chatUser => (
                            <View
                                key={chatUser.toId}
                                className="py-[20px] border-b border-gray-100 last:border-b-0 flex items-center"
                                onClick={() => {
                                    Taro.navigateTo({
                                        url: `/pages/message/index?toId=${chatUser.toId}`,
                                    })
                                }}
                            >
                                <Image
                                    src={chatUser.toUser.avatar}
                                    className="w-[40px] h-[40px] rounded-full mr-[12px]"
                                />
                                <View className="flex-1">
                                    <Text className="text-[26px] text-[#2c3140] truncate">
                                        {chatUser.toUser.name}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="rounded-[24px] bg-white shadow-[0_12px_30px_rgba(183,193,210,0.35)] px-[28px] py-[40px] text-center text-[#a0a7b8] text-[26px]">
                        暂时还没有新的通知
                    </View>
                )}
            </View>
            <BottomBar activeKey="notifications" />
        </Layout>
    );
};

export default NotificationsPage;



