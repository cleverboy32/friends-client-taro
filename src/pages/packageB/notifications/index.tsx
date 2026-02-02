import { View, Text, Image } from '@tarojs/components';
import BottomBar from '@/components/BottomBar';
import Layout from '@/components/Layout';
import Taro from '@tarojs/taro';
import useChatStore from '@/store/chat';
import useUserStore from '@/store/user';
import { useEffect, useState } from 'react';

const NotificationsPage = () => {
    const { chatList, getChatList, deleteChat } = useChatStore();
    const { userInfo } = useUserStore();
    const [touchStartX, setTouchStartX] = useState(0);
    const [swipeIndex, setSwipeIndex] = useState(-1);

    Taro.usePullDownRefresh(async () => {
        if (!userInfo?.id) {
            return;
        }
        await getChatList(userInfo.id);
        Taro.stopPullDownRefresh(); // 停止下拉刷新动画
    });

    useEffect(() => {
        if (!userInfo?.id) {
            return;
        }
        getChatList(userInfo.id);
    }, [userInfo])

    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e, index) => {
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchEndX - touchStartX;
        const swipeThreshold = 50; // pixels to trigger swipe

        // Swipe left to open
        if (deltaX < -swipeThreshold) {
            setSwipeIndex(index);
        }
        // Swipe right to close
        else if (deltaX > swipeThreshold) {
            setSwipeIndex(-1);
        }
    };

    const handleDelete = (chatUserId) => {
        console.log('删除会话：', chatUserId);
        deleteChat(chatUserId); // Call the deleteChat function from the store
        setSwipeIndex(-1); // Close the item
    };

    const handleItemClick = (toId) => {
        // If any item is swiped open, the first action is to close it.
        if (swipeIndex !== -1) {
            setSwipeIndex(-1);
            return; // Stop here. The user can click again to navigate.
        }
        // Only navigate if nothing is swiped open.
        Taro.navigateTo({
            url: `/pages/packageB/message/index?toId=${toId}`,
        });
    };


    return (
        <Layout className=" bg-white h-[100vh] overflow-hidden" >
            <View className="flex-1">
                {chatList.length > 0 ? (
                    <View className="rounded-[24px] py-[20px]">
                        {chatList.map(({ chatUser, unRead }, index) => (
                            <View
                                key={chatUser.id}
                                className="relative overflow-hidden"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={(e) => handleTouchEnd(e, index)}
                            >
                                <View
                                    className="absolute top-0 right-0 h-full flex items-center justify-center bg-red-500 text-white w-[120px] text-center"
                                    onClick={() => handleDelete(chatUser.id)}
                                >
                                    删除
                                </View>
                                <View
                                    className={`relative bg-white w-full py-[20px] px-[20px] border-t border-gray-100 last:border-b flex items-center transition-transform duration-300 ease-in-out ${swipeIndex === index ? 'transform -translate-x-[120px]' : ''
                                        }`}
                                    onClick={() => handleItemClick(chatUser.id)}
                                >
                                    <Image
                                        src={chatUser.avatar}
                                        className="w-[60px] h-[60px] rounded-full mr-[12px]"
                                    />
                                    <View className="flex-1">
                                        <Text className="text-[32px] text-[#2c3140] truncate">
                                            {chatUser.name}
                                        </Text>
                                    </View>
                                    {unRead > 0 && (
                                        <View className="bg-red-500 text-white text-[20px] rounded-full w-[30px] h-[30px] flex items-center justify-center">
                                            {unRead}
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="rounded-[24px] bg-white shadow-[0_12px_30px_rgba(183,193,210,0.35)] px-[28px] py-[40px] text-center text-[#a0a7b8] text-[26px]">
                        暂时还没有消息
                    </View>
                )}
            </View>
            <BottomBar activeKey="notifications" />
        </Layout>
    );
};

export default NotificationsPage;
