import React, { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text, Button, Input, Textarea, Switch, RadioGroup, Label, Radio } from '@tarojs/components';
import Upload from '@/components/Upload';
import type { UploadFile } from '@/components/Upload';
import { createActivity } from '@/api/activity';
import type { CreateActivityParams, Location } from '@/types/activity';
import useUserStore from '@/store/user';
import Layout from '@/components/Layout';

interface ActivityForm {
    title: string;
    content: string;
    type: 'ONLINE' | 'OFFLINE';
    needPartner: boolean;
    images: UploadFile[];
    location: Location | null;
    tags: string[];
}

const PostActivity: React.FC = () => {
    const [isPublishing, setIsPublishing] = useState(false);
    const { userInfo } = useUserStore();

    console.log(userInfo);

    // 统一的表单数据对象
    const [form, setForm] = useState<ActivityForm>({
        title: '',
        content: '',
        type: 'OFFLINE',
        needPartner: true,
        images: [],
        location: null,
        tags: [],
    });

    // 更新表单字段的通用函数
    const updateForm = (updates: Partial<ActivityForm>) => {
        setForm((prev) => ({ ...prev, ...updates }));
    };

    // 处理文件上传（Upload 组件内部已完成上传，这里接收最新文件列表）
    const handleFileChange = (files: UploadFile[]) => {
        updateForm({ images: files });
        console.log('文件已更新:', files);
    };

    // 处理文件删除（确保表单状态同步）
    const handleFileRemove = (file: UploadFile) => {
        setForm((prev) => ({ ...prev, images: prev.images.filter((f) => f.id !== file.id) }));
        console.log('文件已删除:', file);
    };

    // 清空所有文件
    const handleClearAll = () => {
        updateForm({ images: [] });
    };

    // 文件上传前验证
    const beforeUpload = (file: { path: string; size: number }): boolean => {
        // Taro的chooseImage已经过滤了图片类型，这里主要检查大小
        // 检查文件大小（10MB）
        if (file.size > 10 * 1024 * 1024) {
            Taro.showToast({
                title: '文件大小不能超过10MB',
                icon: 'none',
            });
            return false;
        }

        return true;
    };

    // 发布内容
    const handlePublish = async () => {
        // 表单验证
        if (form.images.length === 0) {
            Taro.showToast({
                title: '请至少上传一张图片',
                icon: 'none',
            });
            return;
        }

        if (!form.title.trim()) {
            Taro.showToast({
                title: '请填写标题',
                icon: 'none',
            });
            return;
        }

        if (!form.content.trim()) {
            Taro.showToast({
                title: '请填写活动内容',
                icon: 'none',
            });
            return;
        }

        if (form.type === 'OFFLINE' && !form.location) {
            Taro.showToast({
                title: '请选择活动地点',
                icon: 'none',
            });
            return;
        }

        setIsPublishing(true);

        try {
            // 准备发布数据
            const activityData: CreateActivityParams = {
                type: form.type,
                title: form.title.trim(),
                content: form.content.trim(),
                image: form.images.map((file) => file.url || file.name),
                needPartner: form.needPartner,
                location: form.location,
                tagIds: [], // 这里可以根据选择的标签转换为 ID 数组
            };

            // 调用 API 创建活动
            const response = await createActivity(activityData);

            if (response) {
                Taro.showToast({
                    title: '活动发布成功！',
                    icon: 'success',
                });
                Taro.redirectTo({
                    url: '/pages/person/index',
                });
            }
        } catch (error: any) {
            console.error('发布活动失败:', error);
            const errorMessage = error?.response?.data?.message || '发布失败，请稍后重试';
            Taro.showToast({
                title: errorMessage,
                icon: 'none',
            });
        } finally {
            setIsPublishing(false);
        }
    };

    const handleLocationSelect = () => {
        // 跳转到地图选择页面
        Taro.navigateTo({
            url: '/pages/packageA/MapLocation/index'
        });
    };

    // 监听页面显示，检查是否有新选择的位置
    useDidShow(() => {
        try {
            const selectedLocation = Taro.getStorageSync('selected_location');
            if (selectedLocation) {
                const location = JSON.parse(selectedLocation);
                updateForm({ location });
                // 清除已使用的位置信息
                Taro.removeStorageSync('selected_location');
            }
        } catch (error) {
            console.error('获取选择的位置失败:', error);
        }
    });

    return (
        <Layout className="p-[32px]" showBottomSafeArea>
            <View className="flex flex-col px-[16px] pb-[160px] flex-1">
                <View className=" rounded-lg  mb-[16px]">
                    <View className="flex items-center justify-between mb-4">
                        <Text className="text-lg font-medium"></Text>
                        {form.images.length > 0 && (
                            <Button
                                className="text-primary text-sm hover:text-dark-primary cursor-pointer"
                                onClick={handleClearAll}>
                                清空
                            </Button>
                        )}
                    </View>

                    <Upload
                        onChange={handleFileChange}
                        onRemove={handleFileRemove}
                        beforeUpload={beforeUpload}
                        maxCount={18}
                        maxSize={2}
                        accept="image/*"
                        buttonText="添加图片"
                    />
                </View>

                <View className="rounded-[24px] bg-white/80 p-[24px]">
                    <View>
                        <View className="flex items-center mb-[8px]">
                            <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                            <Text className="text-[#5c6470] text-[26px]">活动标题</Text>
                        </View>
                        <Input
                            type="text"
                            placeholder="填写活动标题"
                            value={form.title}
                            onInput={(e) => updateForm({ title: e.detail.value })}
                            maxlength={50}
                            className="rounded-[20px] border-2 border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c8]"
                        />
                        <View className="text-right text-[22px] text-[#c8c8c8] mt-[10px]">
                            {form.title.length}/50
                        </View>
                    </View>
                    <View>
                        <View className="flex items-center mb-[8px]">
                            <Text className="text-[#ff6f61] mr-[4px]">*</Text>
                            <Text className="text-[#5c6470] text-[26px]">活动内容</Text>
                        </View>
                        <Textarea
                            placeholder="输入活动详细内容，让更多人了解你的活动"
                            value={form.content}
                            onInput={(e) => updateForm({ content: e.detail.value })}
                            className="rounded-[20px] h-[150px] border-2 border-[#f0dccc] bg-white/90 px-[24px] py-[18px] text-[#4b5563] text-[26px] placeholder:text-[#c8c8c8] resize-none"
                            maxlength={200}
                        />
                        <View className="text-right text-[22px] text-[#c8c8c8] mt-[10px]">
                            {form.content.length}/200
                        </View>
                    </View>
                </View>

                {/* 更多设置 */}
                <View className=" rounded-lg px-4 mb-[16px]">
                    <View className="flex items-center justify-between mb-4">
                        <Text className="text-lg font-medium">活动设置</Text>
                    </View>

                    <View className="space-y-4">
                        <View className="flex items-center justify-between mb-[24px]">
                            <Text className="text-[#5c6470] text-[26px]">活动类型</Text>
                            <RadioGroup
                                onChange={(e) => {
                                    const value = e.detail.value as 'ONLINE' | 'OFFLINE';
                                    const updates: Partial<ActivityForm> = { type: value };
                                    if (value === 'ONLINE') {
                                        updates.location = null;
                                    }
                                    updateForm(updates);
                                }}>
                                <View className="flex items-center gap-[32px]">
                                    {[
                                        { label: '线下', value: 'OFFLINE' },
                                        { label: '线上', value: 'ONLINE' },
                                    ].map((item) => {
                                        return (
                                            <Label
                                                key={item.value}
                                                className="flex items-center">
                                                <Radio
                                                    value={item.value}
                                                    checked={form.type === item.value}
                                                    color="#b5caa0"
                                                    className="mr-[8px]"
                                                />
                                                <Text className="text-[#5c6470] text-[26px]">
                                                    {item.label}
                                                </Text>
                                            </Label>
                                        );
                                    })}
                                </View>
                            </RadioGroup>
                        </View>

                        {form.type === 'OFFLINE' && (
                            <View className="rounded-[24px] bg-white/80">
                                <View className="flex items-center justify-between ">
                                    <Text className="text-[#5c6470] text-[26px]">活动地点</Text>
                                    <View
                                        className="text-[#f29b38] text-[28px]"
                                        onClick={handleLocationSelect}>
                                        {form.location ? (
                                            <View className="flex items-center">
                                                <Text className="text-[#2c3e50] text-[26px] mr-2">{form.location.address}</Text>
                                                <Text className="text-[#f29b38] text-[24px]">更改</Text>
                                            </View>
                                        ) : (
                                            <View className=" text-[40px] iconfont icon-dza-dingweiweizhi"></View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        <View className="flex items-center justify-between">
                            <Text className="text-[#5c6470] text-[26px]">寻找合作伙伴</Text>
                            <Switch
                                checked={form.needPartner}
                                color="#b5caa0"
                                onChange={(e) => {
                                    const value = e.detail.value;
                                    updateForm({ needPartner: value });
                                }}
                            />
                        </View>

                        {form.tags.length > 0 && (
                            <View>
                                <Text className="text-gray-700 text-sm mb-2 block">已选标签:</Text>
                                <View className="flex flex-wrap gap-2">
                                    {form.tags.map((tag, index) => (
                                        <Text
                                            key={index}
                                            className="px-2 py-1 bg-theme text-white text-sm rounded-full">
                                            #{tag}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* 发布按钮 */}
                <Button
                    onClick={handlePublish}
                    disabled={
                        isPublishing ||
                        form.images.length === 0 ||
                        !form.title.trim() ||
                        !form.content.trim() ||
                        (form.type === 'OFFLINE' && !form.location)
                    }
                    className={`w-full rounded-lg font-medium transition-colors mt-[24px] ${
                        !isPublishing &&
                        form.images.length > 0 &&
                        form.title.trim() &&
                        form.content.trim() &&
                        (form.type === 'ONLINE' || form.location)
                            ? 'bg-theme text-white '
                            : 'bg-gray-200 text-gray-500 '
                    }`}>
                    {isPublishing ? '发布中...' : '发布活动'}
                </Button>
            </View>
        </Layout>
    );
};

export default PostActivity;
