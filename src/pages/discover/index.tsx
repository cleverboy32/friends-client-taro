import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ActivityCard, { type Activity } from '@/components/ActivityCard';
import { getActivityList } from '@/api/activity';
import type { ActivityQueryParams } from '@/types/activity';
import type { AutoComplete } from '@/types/map';
import BottomBar from '@/components/BottomBar';
import Layout from '@/components/Layout';

const DiscoverPage: React.FC = () => {
    const address = useRef<AutoComplete.Poi>(null);
    const [filter, setFilter] = useState<ActivityQueryParams>({
        type: '',
        distance: '1000',
        timeRange: '7',
    });
    const page = useRef(1);

    const [activities, setActivities] = useState<Activity[]>([]);

    const [_loading, setLoading] = useState(false);
    const loadingRef = useRef(false);

    // 使用 useCallback 优化 filter 变化处理函数
    const handleFilterChange = useCallback(
        (key: keyof ActivityQueryParams, value: string | number | boolean | undefined) => {
            setFilter((prev) => {
                const newValue = prev[key] === value ? undefined : value;
                return { ...prev, [key]: newValue };
            });
            page.current = 1; // 重置页码
        },
        [],
    );

    const fetchActivities = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
            const response = await getActivityList({
                page: page.current,
                pageSize: 20,
                ...filter,
                lng: address.current?.location?.lng,
                lat: address.current?.location?.lat,
            });

            // 转换API数据格式为ActivityCard组件期望的格式
            const convertedActivities: Activity[] = response.items.map((item) => ({
                id: item.id.toString(),
                title: item.title,
                content: item.content,
                time: new Date(item.createdAt).toLocaleString('zh-CN'),
                location: item.location?.address || '',
                publisher: item.author?.name,
                publisherId: item.author?.id,
                avatar: item.author?.avatar,
                reward: `${Math.floor(Math.random() * 200) + 50}积分`, // 暂时随机生成积分
                participants: Math.floor(Math.random() * 50), // 暂时随机生成参与人数
                maxParticipants: Math.floor(Math.random() * 100) + 50, // 暂时随机生成最大参与人数
                category: item.tags?.[0] || '其他',
                distance: Math.random() * 20, // 暂时随机生成距离
                coordinates: item.location
                    ? [item.location.longitude, item.location.latitude]
                    : [116.397428, 39.90923],
                image: item.image?.[0]
            }));

            if (page.current === 1) {
                setActivities(convertedActivities);
            } else {
                setActivities((prev) => [...prev, ...convertedActivities]);
            }
            page.current = response.page + 1;
        } catch (error) {
            console.error('获取活动列表失败:', error);
            if (page.current === 1) {
                setActivities([]);
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [filter, page]);

    // 获取活动数据
    useEffect(() => {
        fetchActivities();
    }, [filter, fetchActivities]);

    Taro.usePullDownRefresh(async () => {
        page.current = 1; // 重置页码
        await fetchActivities();
        Taro.stopPullDownRefresh(); // 停止下拉刷新动画
    });

    return (
        <Layout className=" bg-white overflow-hidden h-[100vh]">
            <View className="px-4 pb-4">
                <View className="relative mb-4">
                    <Input
                        className="w-full box-border h-[80px] bg-gray-100 rounded-full pl-[40px] pr-4 py-2 text-sm"
                        placeholder="搜索活动"
                        onConfirm={(e) => handleFilterChange('keyword', e.detail.value)}
                    />
                    <View className="absolute top-1/2 left-3 transform -translate-y-1/2">
                        <Text className="iconfont icon-sousuo text-gray-400"></Text>
                    </View>
                </View>

                {/* 筛选区域 */}
                <View className="flex flex-col gap-4">
                    <View className="flex items-center">
                        <View className="flex gap-2">
                            <Text
                                className={`px-3 py-1 text-sm rounded-full ${
                                    filter.type === 'OFFLINE'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100'
                                }`}
                                onClick={() => handleFilterChange('type', 'OFFLINE')}>
                                线下
                            </Text>
                            <Text
                                className={`px-3 py-1 text-sm rounded-full ${
                                    filter.type === 'ONLINE' ? 'bg-primary text-white' : 'bg-gray-100'
                                }`}
                                onClick={() => handleFilterChange('type', 'ONLINE')}>
                                线上
                            </Text>
                        </View>
                    </View>
                    {/* <View className="flex items-center">
                        <Text className="text-sm font-medium mr-4">时间:</Text>
                        <View className="flex gap-2">
                            <Text
                                className={`px-3 py-1 text-sm rounded-full ${
                                    filter.timeRange === '1' ? 'bg-primary text-white' : 'bg-gray-100'
                                }`}
                                onClick={() => handleFilterChange('timeRange', '1')}>
                                近24小时
                            </Text>
                            <Text
                                className={`px-3 py-1 text-sm rounded-full ${
                                    filter.timeRange === '3' ? 'bg-primary text-white' : 'bg-gray-100'
                                }`}
                                onClick={() => handleFilterChange('timeRange', '3')}>
                                近3天
                            </Text>
                            <Text
                                className={`px-3 py-1 text-sm rounded-full ${
                                    filter.timeRange === '7' ? 'bg-primary text-white' : 'bg-gray-100'
                                }`}
                                onClick={() => handleFilterChange('timeRange', '7')}>
                                近7天
                            </Text>
                        </View>
                    </View> */}
                    {/* <View className="flex items-center justify-between">
                        <Text className="text-sm font-medium">需要伙伴:</Text>
                        <Switch
                            checked={filter.needPartner}
                            onChange={(e) => handleFilterChange('needPartner', e.detail.value)}
                        />
                    </View> */}
                </View>
            </View>
            <View className="mt-[20px] flex-1 overflow-y-auto">
                {/* 活动卡片瀑布流 */}
                <View className="columns-2 gap-x-2">
                    {activities.map((activity) => (
                        <View
                            key={activity.id}
                            className="break-inside-avoid mb-2">
                            <ActivityCard activity={activity} />
                        </View>
                    ))}
                </View>

                {activities.length === 0 && (
                    <View className="text-center py-12">
                        <Text className="text-gray-400 text-lg">暂无相关的活动</Text>
                    </View>
                )}
            </View>
            <BottomBar activeKey="discover" />
        </Layout>
    );
};

export default React.memo(DiscoverPage);
