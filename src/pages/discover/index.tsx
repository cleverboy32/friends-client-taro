import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Map, { MAP_STYLES } from '../../components/Map';
import ActivityCard, { type Activity } from '@/components/ActivityCard';
import { getActivityList } from '@/api/activity';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { ActivityQueryParams } from '@/types/activity';
import type { AutoComplete } from '@/types/map';
import BottomBar from '@/components/BottomBar';
import Navbar from '@/components/Navbar';
import Layout from '@/components/Layout';

const DiscoverPage: React.FC = () => {
    const address = useRef<AutoComplete.Poi>(null);
    const [filter, setFilter] = useState<ActivityQueryParams>({
        type: 'OFFLINE',
        distance: '1000',
        timeRange: '7',
    });
    const page = useRef(1);

    const [activities, setActivities] = useState<Activity[]>([]);

    const [_loading, setLoading] = useState(false);
    const loadingRef = useRef(false);

    // 使用 useCallback 优化 filter 变化处理函数
    const handleFilterChange = useCallback(
        (key: keyof ActivityQueryParams, value: string | number) => {
            setFilter((prev) => ({ ...prev, [key]: value }));
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
                location: item.location?.address || '未知地点',
                publisher: item.author?.name,
                avatar: item.author?.avatar,
                reward: `${Math.floor(Math.random() * 200) + 50}积分`, // 暂时随机生成积分
                participants: Math.floor(Math.random() * 50), // 暂时随机生成参与人数
                maxParticipants: Math.floor(Math.random() * 100) + 50, // 暂时随机生成最大参与人数
                category: item.tags?.[0] || '其他',
                distance: Math.random() * 20, // 暂时随机生成距离
                coordinates: item.location
                    ? [item.location.longitude, item.location.latitude]
                    : [116.397428, 39.90923],
                image:
                    item.image?.[0] ||
                    `https://via.placeholder.com/120x80/4ade80/ffffff?text=${item.title.charAt(0)}`,
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
    }, [filter]);



    console.log('render');

    return (
        <Layout className="px-[8px] pt-[60px] pb-[140px] bg-white">
            <Navbar
                title="发现"
                right={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
            />

            {/* 活动列表区域 */}
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
