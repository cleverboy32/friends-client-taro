import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';

type SafeAreaResult = NonNullable<ReturnType<typeof Taro.getWindowInfo>['safeArea']>;

interface LayoutProps extends PropsWithChildren {
    className?: string;
    showTopSafeArea?: boolean;
    showBottomSafeArea?: boolean;
}

interface SafeInsets {
    top: number;
    bottom: number;
}

const computeInsets = (
    safeArea?: SafeAreaResult | null,
    statusBarHeight?: number,
    screenHeight?: number,
): SafeInsets => {
    const top = safeArea?.top ?? statusBarHeight ?? 0;
    if (safeArea && typeof screenHeight === 'number') {
        return {
            top,
            bottom: Math.max(screenHeight - safeArea.bottom + 12, 0),
        };
    }
    return { top, bottom: 0 };
};

const getSafeInsets = (): SafeInsets => {
    try {
        if (typeof Taro.getWindowInfo === 'function') {
            const { safeArea, statusBarHeight, screenHeight } = Taro.getWindowInfo();
            console.log('safeArea', safeArea, screenHeight);
            return computeInsets(safeArea, statusBarHeight, screenHeight);
        }

        const info = Taro.getSystemInfoSync();
        console.log('info', info);
        return computeInsets(info.safeArea, info.statusBarHeight, info.screenHeight);
    } catch (error) {
        console.warn('获取安全区域失败', error);
        return { top: 0, bottom: 0 };
    }
};

const Layout = ({
    children,
    className = '',
    showTopSafeArea = true,
    showBottomSafeArea = true,
}: LayoutProps) => {
    const [safeInsets, setSafeInsets] = useState<SafeInsets>(() => getSafeInsets());

    useEffect(() => {
        setSafeInsets(getSafeInsets());
    }, []);

    const containerStyle = useMemo(() => {
        return {
            paddingBottom: showBottomSafeArea ? `${safeInsets.bottom}px` : undefined,
        };
    }, [safeInsets, showTopSafeArea, showBottomSafeArea]);

    return (
        <View
            className={`min-h-screen flex flex-col box-border ${className}`}
            style={containerStyle}>
            {children}
        </View>
    );
};

export default Layout;
