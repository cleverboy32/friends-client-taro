import React, { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './Upload.css';

export interface UploadFile {
    id: string;
    url: string;
    name: string;
    size?: number;
    type?: string;
    tempFilePath?: string; // Taro临时文件路径
}

export interface UploadProps {
    maxCount?: number;
    maxSize?: number;
    accept?: string;
    multiple?: boolean;
    drag?: boolean;
    beforeUpload?: (file: { path: string; size: number }) => boolean | Promise<boolean>;
    onChange?: (files: UploadFile[]) => void;
    onRemove?: (file: UploadFile) => void;
    buttonText?: string;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
    showTip?: boolean;
}

const Upload: React.FC<UploadProps> = ({
    maxCount = 18,
    maxSize = 10,
    accept = 'image/*',
    multiple = true,
    beforeUpload,
    onChange,
    onRemove,
    buttonText = '添加图片',
    disabled = false,
    className = '',
    children,
    showTip = true,
}) => {
    const [files, setFiles] = useState<UploadFile[]>([]);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const handleChooseImage = useCallback(async () => {
        if (disabled) return;

        try {
            const count = maxCount - files.length;
            if (count <= 0) {
                Taro.showToast({
                    title: `最多只能上传 ${maxCount} 个文件`,
                    icon: 'none',
                });
                return;
            }

            const res = await Taro.chooseImage({
                count: multiple ? count : 1,
                sizeType: ['original', 'compressed'],
                sourceType: ['album', 'camera'],
            });

            const tempFiles = res.tempFiles || [];
            const newFiles: UploadFile[] = [];

            for (const tempFile of tempFiles) {
                let filePath = tempFile.path;
                let fileSize = tempFile.size;

                // 若超出大小限制，先尝试压缩
                if (maxSize && fileSize > maxSize * 1024 * 1024) {
                    try {
                        const compressed = await Taro.compressImage({
                            src: tempFile.path,
                            quality: 70, // 降低质量以缩小体积
                        });
                        const info = await Taro.getFileInfo({ filePath: compressed.tempFilePath });
                        filePath = compressed.tempFilePath;
                        // getFileInfo 类型里包含失败类型，这里做属性判断
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-expect-error size 存在于成功结果上
                        const nextSize = info.size;
                        if (typeof nextSize === 'number') {
                            fileSize = nextSize;
                        } else {
                            throw new Error('获取压缩后文件信息失败');
                        }
                    } catch (err) {
                        Taro.showToast({
                            title: '压缩失败，已跳过该文件',
                            icon: 'none',
                        });
                        continue;
                    }
                }

                // 压缩后仍然超出限制则跳过
                if (maxSize && fileSize > maxSize * 1024 * 1024) {
                    Taro.showToast({
                        title: `文件需小于 ${maxSize}MB`,
                        icon: 'none',
                    });
                    continue;
                }

                // beforeUpload验证（传入压缩后的信息）
                if (beforeUpload) {
                    const shouldUpload = await beforeUpload({ path: filePath, size: fileSize });
                    if (!shouldUpload) {
                        continue;
                    }
                }

                const uploadFile: UploadFile = {
                    id: generateId(),
                    url: filePath,
                    name: `image_${Date.now()}.jpg`,
                    size: fileSize,
                    type: 'image/jpeg',
                    tempFilePath: filePath,
                };

                newFiles.push(uploadFile);
            }

            if (newFiles.length === 0) return;

            // 先乐观更新，展示本地预览
            const optimisticFiles = [...files, ...newFiles];
            setFiles(optimisticFiles);
            onChange?.(optimisticFiles);

            // 上传到服务器
            const token = Taro.getStorageSync('x-token');
            await Promise.all(
                newFiles.map(async (nf) => {
                    try {
                        // 使用Taro.uploadFile上传
                        const uploadRes = await Taro.uploadFile({
                            url: 'https://www.meetu.online/api/upload',
                            filePath: nf.tempFilePath!,
                            name: 'file',
                            header: {
                                Authorization: token || '',
                            },
                        });

                        const data = JSON.parse(uploadRes.data);
                        const serverUrl = data?.data?.imageUrl || data?.imageUrl || '';

                        if (serverUrl) {
                            // 替换对应文件的url
                            setFiles((prev) => {
                                const next = prev.map((f) =>
                                    f.id === nf.id ? { ...f, url: serverUrl } : f,
                                );
                                onChange?.(next);
                                return next;
                            });
                        }
                    } catch (err) {
                        // 上传失败，移除该文件并提示
                        setFiles((prev) => {
                            const next = prev.filter((f) => f.id !== nf.id);
                            onChange?.(next);
                            return next;
                        });
                        Taro.showToast({
                            title: `上传失败：${nf.name}`,
                            icon: 'none',
                        });
                    }
                }),
            );
        } catch (err: any) {
            if (err.errMsg && !err.errMsg.includes('cancel')) {
                Taro.showToast({
                    title: '选择图片失败',
                    icon: 'none',
                });
            }
        }
    }, [files, maxCount, maxSize, multiple, beforeUpload, onChange, disabled]);

    const handleRemove = useCallback(
        (file: UploadFile) => {
            const updatedFiles = files.filter((f) => f.id !== file.id);
            setFiles(updatedFiles);
            onChange?.(updatedFiles);
            onRemove?.(file);
        },
        [files, onChange, onRemove],
    );

    const renderButton = useCallback(() => {
        return (
            <View className="flex flex-col items-center justify-center py-[64px]">
                <Text className="iconfont icon-tianjiatupian w-[96px] h-[96px] text-[#c8c8c8] mb-[16px]"></Text>
                <Text className="text-[#5c6470] text-[26px] mb-[8px]">点击上传图片</Text>
                <Text className="text-[22px] text-[#c8c8c8]">
                    支持 {accept} 格式，最大 {maxSize}MB
                </Text>
            </View>
        );
    }, [accept, maxSize]);

    const renderList = useCallback(() => {
        return (
            <View className="grid grid-cols-3 gap-[16px]">
                {files.map((file) => (
                    <View
                        key={file.id}
                        className="relative">
                        <View className="aspect-square bg-gray-100 rounded-[16px] overflow-hidden">
                            <Image
                                src={file.url}
                                mode="aspectFill"
                                className="w-full h-full"
                            />
                        </View>
                        <View
                            className="absolute -top-[8px] -right-[8px] w-[48px] h-[48px] bg-[#ff6f61] rounded-full flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(file);
                            }}>
                            <Text className="iconfont icon-close w-[24px] h-[24px] text-white"></Text>
                        </View>
                    </View>
                ))}

                {files.length < maxCount && (
                    <View
                        className="aspect-square border-2 border-dashed border-[#e5e7eb] rounded-[16px] flex flex-col items-center justify-center"
                        onClick={handleChooseImage}>
                        <Text className="iconfont icon-plus w-[48px] h-[48px] text-[#c8c8c8]"></Text>
                        <Text className="text-[22px] text-[#c8c8c8] mt-[8px]">{buttonText}</Text>
                    </View>
                )}
            </View>
        );
    }, [files, maxCount, buttonText, handleRemove, handleChooseImage]);

    return (
        <View className={`upload-component ${className}`}>
            {children ? (
                <View onClick={handleChooseImage}>{children}</View>
            ) : (
                <View
                    className={`
                    rounded-[24px] p-[32px] transition-colors upload-area
                    ${files.length > 0 ? 'has-files' : ''}
                    ${
                        files.length === 0
                            ? `border-2 border-dashed border-[#e5e7eb] bg-white/90`
                            : 'border-0'
                    }
                `}
                    onClick={handleChooseImage}>
                    {files.length === 0 ? renderButton() : renderList()}
                </View>
            )}

            {files.length > 0 && showTip && (
                <View className="pl-[16px] text-[22px] text-[#c8c8c8] mt-[16px]">
                    已上传 {files.length}/{maxCount} 个文件
                </View>
            )}
        </View>
    );
};

export default Upload;
