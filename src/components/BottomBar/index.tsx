import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import useUserStore from '@/store/user';
import useChatStore from '@/store/chat';

type NavKey = 'discover' | 'publish' | 'notifications' | 'profile';

interface NavItem {
    key: NavKey;
    label: string;
    icon: (active: boolean) => React.ReactNode;
    path: string;
    requiresAuth?: boolean;
}

interface BottomBarProps {
    activeKey?: NavKey;
}

const BottomBar: React.FC<BottomBarProps> = ({ activeKey }) => {
    const { userInfo } = useUserStore();
    const { chatList } = useChatStore();
    const [bottomHeight, setBottomHeight] = useState(0);

    const totalUnread = chatList.reduce((acc, chat) => acc + chat.unRead, 0);

    const navItems: NavItem[] = [
        {
            key: 'discover',
            label: '发现',
            path: '/pages/discover/index',
            icon: (active) => (
                <Text
                    className={`iconfont icon-dza-zhuyeshouye w-[28px] h-[28px] ${active ? 'text-[#f5a623]' : 'text-white'}`}
                ></Text>
            ),
        },
        {
            key: 'publish',
            label: '发布',
            path: '/pages/packageA/PostActivity/index',
            icon: (active) => (
                <Text
                    className={`iconfont icon-dzbianji w-[28px] h-[28px] ${active ? 'text-[#f5a623]' : 'text-white'}`}
                ></Text>
            ),
            requiresAuth: true,
        },
        {
            key: 'notifications',
            label: '通知',
            path: '/pages/packageB/notifications/index',
            icon: (active) => (
                <View className="relative">
                    <Text
                        className={`iconfont icon-dzxiaoxi w-[28px] h-[28px] ${active ? 'text-[#f5a623]' : 'text-white'}`}
                    ></Text>
                    {totalUnread > 0 && (
                        <View className="absolute top-[-10px] right-[-10px] bg-red-500 text-white text-[16px] rounded-full w-[30px] h-[30px] flex items-center justify-center">
                            {totalUnread}
                        </View>
                    )}
                </View>
            ),
            requiresAuth: true,
        },
        {
            key: 'profile',
            label: '我',
            path: userInfo ? '/pages/person/index' : '/pages/login/index',
            icon: (active) => (
                <Text
                    className={`iconfont icon-dzyonghu w-[28px] h-[28px] ${active ? 'text-[#f5a623]' : 'text-white'}`}
                ></Text>
            ),
        },
    ];

    const handleNavClick = (item: NavItem) => {
        if (item.key === activeKey) return;

        // if (item.requiresAuth && !userInfo) {
        //     Taro.navigateTo({ url: '/pages/login/index' });
        //     return;
        // }
        console.log('userInfo', userInfo);
        const target = item.key === 'profile' && !userInfo ? '/pages/login/index' : item.path;

        if (item.key === 'publish') {
            Taro.navigateTo({ url: target });
        } else {
            Taro.reLaunch({ url: target });
        }
    };

    const getBottomHeight = () => {
        let height = 0;
        if (typeof Taro.getWindowInfo === 'function') {
            const { safeArea, screenHeight } = Taro.getWindowInfo();
            height = screenHeight - (safeArea?.bottom || 0);
        }
        console.log(height)
        setBottomHeight(height);
    };

    useEffect(() => {
        getBottomHeight();
    }, []);

    return (
        <View
            className="bg-[#cadcae] flex items-center justify-around py-[24px]"
            style={{
                paddingBottom:  bottomHeight,
            }}>
            {navItems.map((item) => {
                const active = item.key === activeKey;
                return (
                    <View
                        key={item.key}
                        className="flex-1 flex flex-col items-center justify-center gap-[6px]"
                        onClick={() => handleNavClick(item)}>
                        {item.icon(active)}
                        <Text
                            className={`text-[24px] ${
                                active ? 'text-[#f5a623]' : 'text-white'
                            }`}>
                            {item.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

export default BottomBar;
