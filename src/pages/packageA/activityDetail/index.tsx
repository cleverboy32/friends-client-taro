import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getActivityDetail } from '@/api/activity';
import type { Activity } from '@/types/activity';
import Navbar from '@/components/Navbar';
import Layout from '@/components/Layout';
import { ClockIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import useChatStore from '@/store/chat';
import useUserStore from '@/store/user';

const ActivityDetail: React.FC = () => {
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const { addOrUpdateChatUser } = useChatStore();
    const { userInfo } = useUserStore();

    useEffect(() => {
        const pages = Taro.getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const activityId = currentPage.options?.id;

        if (!activityId) {
            Taro.showToast({
                title: '活动ID不存在',
                icon: 'none',
            });
            Taro.navigateBack();
            return;
        }

        fetchActivityDetail(Number(activityId));
    }, []);

    const fetchActivityDetail = async (id: number) => {
        try {
            setLoading(true);
            const data = await getActivityDetail(id);
            setActivity(data);
        } catch (error) {
            console.error('获取活动详情失败:', error);
            Taro.showToast({
                title: '获取活动详情失败',
                icon: 'none',
            });
            setTimeout(() => {
                Taro.navigateBack();
            }, 1500);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        Taro.navigateBack();
    };

    const handleGoToChat = () => {
        if (activity?.author && userInfo) {
            addOrUpdateChatUser({
                id: activity.author.id,
                name: activity.author.name,
                avatar: activity.author.avatar
            }, {
                id: userInfo.id,
                name: userInfo.name
            })
            Taro.navigateTo({
                url: '/pages/packageB/notifications/index',
            });
        }
    };

    if (loading) {
        return (
            <Layout>
                <Navbar title="活动详情" left={<ArrowLeftIcon className="w-5 h-5" />} onClickLeft={handleBack} />
                <View className="flex-1 flex items-center justify-center">
                    <Text className="text-gray-400">加载中...</Text>
                </View>
            </Layout>
        );
    }

    if (!activity) {
        return (
            <Layout>
                <Navbar title="活动详情" left={<ArrowLeftIcon className="w-5 h-5" />} onClickLeft={handleBack} />
                <View className="flex-1 flex items-center justify-center">
                    <Text className="text-gray-400">活动不存在</Text>
                </View>
            </Layout>
        );
    }

    return (
        <Layout className="bg-white px-[8px] pt-[60px]">
            <Navbar title="活动详情" left={<ArrowLeftIcon className="w-5 h-5" />} onClickLeft={handleBack} />
            <ScrollView className="flex-1" scrollY>
                {/* 图片区域 */}
                {activity.image && activity.image.length > 0 && (
                    <View className="w-full max-h-[80%] relative">
                        <Image
                            src={activity.image[0]}
                            mode="widthFix"
                            className="w-full h-full"
                        />
                    </View>
                )}

                {/* 内容区域 */}
                <View className="px-[16px] py-[20px]">
                    {/* 标题 */}
                    <Text className="text-[24px] font-bold text-gray-800 mb-[12px] block">
                        {activity.title}
                    </Text>

                    {/* 活动内容 */}
                    <View className="mb-[20px]">
                        <Text className="text-[16px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {activity.content}
                        </Text>
                    </View>

                     {/* 发布者信息 */}
                     <View className="flex items-center flex-wrap gap-[12px] mb-[16px] pb-[16px] border-b border-gray-100">
                        <Image
                            src={activity.author?.avatar || 'https://via.placeholder.com/40'}
                            mode="aspectFill"
                            className="w-[40px] h-[40px] rounded-full"
                        />
                        <View className="flex-1">
                            <Text className="text-[16px] font-medium text-gray-800">
                                {activity.author?.name || '未知用户'}
                            </Text>
                        </View>
                        <Text
                            className="iconfont icon-dzxiaoxi text-[24px] text-gray-500"
                            onClick={handleGoToChat}
                        />
                    </View>

                    {/* 活动信息卡片 */}
                    <View className="bg-gray-50 rounded-lg p-[16px] mb-[20px]">
                        {activity.location && (
                            <View className="flex items-start gap-[12px] mb-[12px]">
                                <MapPinIcon className="w-[20px] h-[20px] text-primary flex-shrink-0 mt-[2px]" />
                                <View className="flex-1">
                                    <Text className="text-[14px] text-gray-500 mb-[4px] block">活动地点</Text>
                                    <Text className="text-[16px] text-gray-800">{activity.location.address || `${activity.location.city}`}</Text>
                                </View>
                            </View>
                        )}

                        <View className="flex items-start gap-[12px] mb-[12px]">
                            <ClockIcon className="w-[20px] h-[20px] text-primary flex-shrink-0 mt-[2px]" />
                            <View className="flex-1">
                                <Text className="text-[14px] text-gray-500 mb-[4px] block">发布时间</Text>
                                <Text className="text-[16px] text-gray-800">
                                    {new Date(activity.createdAt).toLocaleString('zh-CN')}
                                </Text>
                            </View>
                        </View>

                        {activity.needPartner && (
                            <View className="flex items-start gap-[12px]">
                                <UserGroupIcon className="w-[20px] h-[20px] text-primary flex-shrink-0 mt-[2px]" />
                                <View className="flex-1">
                                    <Text className="text-[14px] text-gray-500 mb-[4px] block">需要伙伴</Text>
                                    <Text className="text-[16px] text-gray-800">是</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* 标签 */}
                    {activity.tags && activity.tags.length > 0 && (
                        <View className="mb-[20px]">
                            <Text className="text-[14px] text-gray-500 mb-[8px] block">标签</Text>
                            <View className="flex flex-wrap gap-[8px]">
                                {activity.tags.map((tag, index) => (
                                    <View
                                        key={index}
                                        className="px-[12px] py-[4px] rounded-full bg-light-bg-theme">
                                        <Text className="text-[12px] text-gray-700">{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </Layout>
    );
};

export default ActivityDetail;
