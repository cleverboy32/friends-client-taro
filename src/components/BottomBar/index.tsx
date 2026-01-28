import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { HomeIcon, PlusIcon, BellIcon, UserIcon } from '@heroicons/react/24/outline';
import useUserStore from '@/store/user';

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
    const [bottomHeight, setBottomHeight] = useState(0);

    const navItems: NavItem[] = [
        {
            key: 'discover',
            label: '发现',
            path: '/pages/discover/index',
            icon: (active) => (
                <HomeIcon
                    className={`w-[28px] h-[28px] ${active ? 'text-[#f5a623]' : 'text-white'}`}
                />
            ),
        },
        {
            key: 'publish',
            label: '发布',
            path: '/pages/packageA/PostActivity/index',
            icon: (active) => (
                <PlusIcon
                    className={`w-[28px] h-[28px] ${active ? 'text-[#f5a623]' : 'text-white'}`}
                />
            ),
            requiresAuth: true,
        },
        {
            key: 'notifications',
            label: '通知',
            path: '/pages/packageB/notifications/index',
            icon: (active) => (
                <BellIcon
                    className={`w-[28px] h-[28px] ${active ? 'text-[#f5a623]' : 'text-white'}`}
                />
            ),
            requiresAuth: true,
        },
        {
            key: 'profile',
            label: '我',
            path: userInfo ? '/pages/person/index' : '/pages/login/index',
            icon: (active) => (
                <UserIcon
                    className={`w-[28px] h-[28px] ${active ? 'text-[#f5a623]' : 'text-white'}`}
                />
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
            height = screenHeight - (safeArea?.bottom ?? 0);
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
