import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import { getActivityList } from '@/api/activity';
import useUserStore from '@/store/user';
import ActivityCard, { type Activity } from '@/components/ActivityCard';
import BottomBar from '@/components/BottomBar';
import Layout from '@/components/Layout';
import { taroUpload } from '@/api/upload';
import { updateUser } from '@/api/user';

const PersonPage: React.FC = () => {
    const userId = '';
    const { userInfo, setUserInfo } = useUserStore();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [activeTab, setActiveTab] = useState<'post' | 'join' | 'collect'>('post');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [hasMore, setHasMore] = useState(true);

    const handleAvatarClick = async () => {
        try {
            const { tempFilePaths } = await Taro.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
            });

            if (tempFilePaths.length > 0) {
                Taro.showLoading({ title: '上传中...' });
                const result = await taroUpload(tempFilePaths[0]);
                if (result.code === 200) {
                    const newAvatarUrl = result.data.imageUrl;
                    // 更新用户信息
                    await updateUser({ id: userInfo!.id, avatar: newAvatarUrl });
                    // 更新store
                    setUserInfo({ ...userInfo!, avatar: newAvatarUrl });
                    Taro.showToast({ title: '头像更新成功', icon: 'success' });
                } else {
                    throw new Error(result.message);
                }
            }
        } catch (error) {
            console.error('更新头像失败:', error);
            Taro.showToast({ title: '更新失败，请重试', icon: 'none' });
        } finally {
            Taro.hideLoading();
        }
    };

    // 获取用户发布的活动数据
    const fetchUserActivities = useCallback(async () => {
        const user = userInfo?.id;
        if (!user || !hasMore) return;
        console.log('user', user, 'page', page);

        try {
            // 获取用户发布的活动
            const response = await getActivityList({
                authorId: user,
                page,
                pageSize,
            });

            const convertedActivities: Activity[] = response.items.map((item) => ({
                id: item.id.toString(),
                title: item.title,
                content: item.content,
                time: new Date(item.createdAt).toLocaleString('zh-CN'),
                location: item.location?.address || '',
                publisher: item.author.name,
                publisherId: item.author.id,
                avatar: item.author.avatar,
                reward: `${Math.floor(Math.random() * 200) + 50}积分`, // 暂时随机生成积分
                participants: Math.floor(Math.random() * 50), // 暂时随机生成参与人数
                maxParticipants: Math.floor(Math.random() * 100) + 50, // 暂时随机生成最大参与人数
                category: item.tags?.[0] || '其他',
                distance: Math.random() * 20, // 暂时随机生成距离
                coordinates: item.location
                    ? [item.location.longitude, item.location.latitude]
                    : [116.397428, 39.90923],
                image: item.image?.[0],
            }));

            setActivities((prev) => [...prev, ...convertedActivities]);
            setHasMore(page < response.totalPages);
            console.log(page < response.totalPages, hasMore);
        } catch (error) {
            console.error('获取用户活动失败:', error);
        }
    }, [userInfo, page, pageSize, hasMore]);

    useEffect(() => {
        if (userInfo?.id) {
            fetchUserActivities();
        }
    }, [userInfo, activeTab]);

    useReachBottom(() => {
        if (hasMore) {
            setPage((prev) => prev + 1);
        }
    });

    const renderEmpty = useCallback(() => {
        return (
            <View className="text-center py-[120px]">
                <Text className="text-[#a0a7b8] text-[28px]">还没有任何活动</Text>
            </View>
        );
    }, []);

    const renderCard = useCallback(
        (list: Activity[]) => {
            if (!list.length) {
                return renderEmpty();
            }

            return (
                <View className="columns-2 gap-x-2">
                    {list.map((activity) => (
                        <View
                            key={activity.id}
                            className="break-inside-avoid mb-2">
                            <ActivityCard activity={activity} />
                        </View>
                    ))}
                </View>
            );
        },
        [renderEmpty],
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'post':
                return renderCard(activities);
            case 'join':
            case 'collect':
            default:
                return renderEmpty();
        }
    };

    const stats = [
        { label: '关注', value: 17 },
        { label: '粉丝', value: 33 },
        { label: '获赞与收藏', value: 59 },
    ];

    return (
        <Layout>
            <View className="flex flex-col pb-[140px] flex-1 px-[24px]">
                <View className="pb-[24px]">
                    <View>
                        <View className="px-[28px] py-[26px] flex items-center gap-[24px]">
                            <View
                                className="w-[160px] h-[160px] rounded-full bg-[#f4f6fb] flex items-center justify-center overflow-hidden"
                                onClick={handleAvatarClick}>
                                {userInfo?.avatar ? (
                                    <Image
                                        src={userInfo.avatar}
                                        mode="aspectFill"
                                        className="w-full h-full rounded-full"
                                    />
                                ) : (
                                    <Text className="text-[#9aa6be] text-[40px]">🙂</Text>
                                )}
                            </View>

                            <View className="flex-1 gap-[24px] mt-[32px]">
                                <View className="ml-[48px]">
                                    <Text className="text-[#1f2433] text-[32px] font-bold">
                                        {userInfo?.name || 'WYZ'}
                                    </Text>
                                    <Text className="text-[#5b6474] text-[26px] mt-[6px]">
                                        {userInfo?.bio || '(๑´0`๑)ﾉﾞ'}
                                    </Text>
                                    <Text className="text-[26px] mt-[10px]">🙇🏻‍♀️</Text>
                                </View>
                                <View className="flex items-center justify-around  py-[18px]">
                                    {stats.map((item) => (
                                        <View
                                            key={item.label}
                                            className="text-center">
                                            <Text className="block text-[#2f3847] text-[30px] font-bold">
                                                {item.value}
                                            </Text>
                                            <Text className="text-[#9097a8] text-[24px]">
                                                {item.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                <View className="flex-1 pt-[40px] pb-[140px] border-t border-[#f2f4f8]">
                    <View className="flex items-center gap-[36px] text-[28px] text-[#9aa3b6]">
                        {[
                            { id: 'post', label: '发布' },
                            { id: 'join', label: '参与' },
                            { id: 'collect', label: '收藏' },
                        ].map((tab) => (
                            <View
                                key={tab.id}
                                className="relative pb-[12px]"
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}>
                                <Text className={activeTab === tab.id ? 'text-[#f5a623]' : ''}>
                                    {tab.label}
                                </Text>
                                {activeTab === tab.id && (
                                    <View className="absolute left-0 right-0 -bottom-[6px] h-[6px] rounded-full bg-[#f5a623]" />
                                )}
                            </View>
                        ))}
                    </View>

                    <View className="mt-[24px]">{renderTabContent()}</View>
                </View>
            </View>

            <BottomBar activeKey="profile" />
        </Layout>
    );
};

export default PersonPage;
