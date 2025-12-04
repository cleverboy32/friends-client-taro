import React, { useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/solid';

interface Activity {
    id: string;
    title: string;
    content: string;
    time: string;
    location: string;
    publisher: string;
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
    const [height, setHeight] = React.useState(200);

    const handleClick = () => {
        if (onClick) {
            onClick(activity.id);
        }
    };

    useEffect(() => {
        if (!activity.image) {
            return;
        }
        const img = new Image();
        img.src = activity.image;
        img.onload = () => {
            console.log('image loaded');
            const ratio = img.width / img.height;
            if (ratio > 1) {
                setHeight(200 / ratio);
            } else {
                setHeight(200);
            }
        };
    });

    return (
        <View
            onClick={handleClick}
            className={`relative cursor-pointer w-[50%] box-border px-[8px] overflow-hidden ${className}`}>
            {/* <View className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium inline-block">
                {activity.reward}
            </View> */}
            <View
                className={`relative bg-white rounded-lg border border-light-bg-theme/60 ${
                    activity.image ? 'bg-center bg-no-repeat bg-cover' : ''
                }`}
                style={
                    activity.image
                        ? { backgroundImage: `url(${activity.image})`, height: `${height}px` }
                        : undefined
                }>
                <View className=" flex items-center justify-center">
                    {!activity.image && (
                        <View className="text-[18px] ">
                            <Text className="bg-clip-text text-transparent bg-[linear-gradient(90deg,#FF4D4F,#FAAD14,#52C41A,#13C2C2,#1677FF,#722ED1,#EB2F96)]">
                                {activity.title}
                            </Text>
                            <Text className="text-sm text-gray-500 mt-[10px]">
                                {activity.content}
                            </Text>
                        </View>
                    )}
                </View>

                {/* <View className="space-y-2 text-sm text-gray-200 p-[12px] bg-black/15">
                    <View className="flex items-center gap-2">
                        <ClockIcon className="w-[20px] h-[20px] text-primary" />
                        <Text>{activity.time}</Text>
                    </View>
                    <View className="flex items-center gap-2">
                        <MapPinIcon className="w-[20px] h-[20px] text-primary" />
                        <Text>{activity.location}</Text>
                    </View>
                </View> */}
            </View>

            <View className="p-[12px] ">
                <Text className="font-semibold text-gray-800 mb-[2px] line-clamp-1">
                    {activity.title}
                </Text>
                <Text className="text-sm text-gray-500 truncate mb-[8px]">{activity.location}</Text>
                <View className="flex items-center justify-between">
                    <View className="flex items-center gap-2">
                        <Image
                            src={activity.avatar}
                            mode="aspectFill"
                            className="w-[24px] h-[24px] rounded-full object-cover"
                        />
                        <Text className="text-sm font-medium text-gray-700">
                            {activity.publisher}
                        </Text>
                    </View>

                    <View className="flex items-center gap-2 text-gray-500">
                        <UserGroupIcon className="w-[18px] h-[18px] " />
                        <Text className="text-sm font-medium ">{activity.jionPeople ?? 0}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ActivityCard;
export type { Activity, ActivityCardProps };
