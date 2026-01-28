import { useState, useEffect } from 'react';
import { Text } from '@tarojs/components';

const words = ['饭搭子', '游戏搭子', '自习搭子', '旅行搭子'];

export default function Title() {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    return (
        <Text className="block text-[#627081] text-[28px] leading-[42px]">
            欢迎👏🏻, 你的【
            <Text className="text-[#1a9b4d] font-semibold text-[50px] border-b-[6px] border-[#d7f4de] px-[8px]">
                {words[currentWordIndex]}
            </Text>
            】正在等你 ~
        </Text>
    );
}
