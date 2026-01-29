import React, { useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useChatStore from '@/store/chat';
import useUserStore from '@/store/user';

interface Activity {
    id: string;
    title: string;
    content: string;
    time: string;
    location: string;
    publisher: string;
    publisherId: number;
    reward: string;
    participants: number;
    maxParticipants: number;
    category: string;
    distance: number;
    coordinates: [number, number];
    image: string;
    avatar?: string;
    jionPeople?: number;
}

interface ActivityCardProps {
    activity: Activity;
    onClick?: (activityId: string) => void;
    className?: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick, className = '' }) => {
    const { addOrUpdateChatUser } = useChatStore();
    const { userInfo } = useUserStore();
    
    const handleClick = () => {
        if (onClick) {
            console.log('activity', activity);
            onClick(activity.id);
        }
        Taro.navigateTo({
            url: `/pages/packageA/activityDetail/index?id=${activity.id}`,
        });
    };

    const handleGoToChat = () => {
        if (activity.publisher && userInfo) {
            addOrUpdateChatUser({
                id: activity.publisherId,
                name: activity.publisher,
                avatar: activity.avatar
            }, {
                id: userInfo.id,
                name: userInfo.name,
            })
            Taro.navigateTo({
                url: '/pages/packageB/notifications/index',
            });
        }
    };

    return (
        <View
            onClick={handleClick}
            className={`relative cursor-pointer box-border px-[8px] overflow-hidden ${className}`}>
            {activity.image ? (
                <Image
                    src={activity.image}
                    mode="widthFix"
                    className="w-full h-auto rounded-lg border"
                    style={{ borderColor: 'rgba(224, 231, 212, 0.6)' }}
                />
            ) : (
                <View
                    className="flex items-center justify-center rounded-lg border min-h-[100px] p-2"
                    style={{ borderColor: 'rgba(224, 231, 212, 0.6)' }}>
                    <View className="text-lg">
                        <Text className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#FF4D4F,#FAAD14,#52C41A,#13C2C2,#1677FF,#722ED1,#EB2F96)]">
                            {activity.title}
                        </Text>
                        <Text className="text-[28px] text-gray-500 mt-[10px] line-clamp-2">
                            {activity.content}
                        </Text>
                    </View>
                </View>
            )}

            <View className="p-[12px] ">
                <Text className="font-semibold text-gray-800 mb-[2px] line-clamp-1">
                    {activity.title}
                </Text>
                <Text className="text-xs text-gray-500 mb-[8px]">{activity.location}</Text>
                <View className="flex items-center justify-between">
                    <View className="flex items-center gap-2">
                        <Image
                            src={activity.avatar || ''}
                            mode="aspectFill"
                            className="w-[48px] h-[48px] rounded-full object-cover"
                        />
                        <Text className="text-sm font-medium text-gray-700">
                            {activity.publisher}
                        </Text>
                    </View>

                    <View className="flex items-center gap-2 text-gray-500">
                        <Text className="iconfont icon-team w-[18px] h-[18px]"></Text>
                        { userInfo?.id !== activity.publisherId && (
                            <Text
                                className="iconfont icon-dzxiaoxi text-[24px] text-gray-500"
                                onClick={handleGoToChat}
                            />)
                        }
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ActivityCard;
export type { Activity, ActivityCardProps };
