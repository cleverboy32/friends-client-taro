import React from 'react';
import { View, Text } from '@tarojs/components';

interface NavbarProps {
    left?: React.ReactNode;
    right?: React.ReactNode;
    title?: string;
    onClickRight?: () => void;
    onClickLeft?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ left, right, title, onClickRight, onClickLeft }) => {
    return (
        <View className="z-50 w-full flex fixed left-0 top-0 px-[16px] h-[44px] bg-white items-center border-b border-gray-200">
            {left && <View onClick={onClickLeft}>{left}</View>}
            <Text className="px-4 flex-1 font-bold text-center">{title}</Text>
            {right && <View onClick={onClickRight}>{right}</View>}
        </View>
    );
};

export default Navbar;
