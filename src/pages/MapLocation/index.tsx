import React, { useState, useEffect } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import {
    View,
    Text,
    Input,
    Button,
    ScrollView,
    Map,
    CoverView,
    CoverImage,
} from '@tarojs/components';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';

interface SearchResult {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
}

const MapLocation: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
    const [currentLocation, setCurrentLocation] = useState({
        latitude: 39.9042, // 北京天安门默认坐标
        longitude: 116.4074,
    });
    const [mapCenter, setMapCenter] = useState({
        latitude: 39.9042,
        longitude: 116.4074,
    });
    const [markers, setMarkers] = useState<any[]>([]);

    // 获取当前位置
    useEffect(() => {
        // Taro.getLocation({
        //     type: 'gcj02',
        //     success: (res) => {
        //         const location = {
        //             latitude: res.latitude,
        //             longitude: res.longitude,
        //         };
        //         setCurrentLocation(location);
        //         setMapCenter(location);
        //     },
        //     fail: () => {
        //         console.log('获取位置失败，使用默认位置');
        //     },
        // });
    }, []);

    // 搜索地点
    const handleSearch = async () => {
        if (!searchValue.trim()) {
            Taro.showToast({
                title: '请输入搜索关键词',
                icon: 'none',
            });
            return;
        }

        setIsSearching(true);

        try {
            // 使用微信小程序的地理位置搜索API
            const qqMap = (Taro as any).qqMap || {};

            // 模拟搜索结果（实际项目中需要配置腾讯地图key）
            const mockResults = [
                {
                    id: '1',
                    name: '朝阳公园',
                    address: '北京市朝阳区朝阳公园南路1号',
                    latitude: 39.9335,
                    longitude: 116.4765,
                },
                {
                    id: '2',
                    name: '奥林匹克公园',
                    address: '北京市朝阳区北四环中路',
                    latitude: 39.9927,
                    longitude: 116.3973,
                },
                {
                    id: '3',
                    name: '三里屯',
                    address: '北京市朝阳区三里屯路',
                    latitude: 39.9378,
                    longitude: 116.4474,
                },
                {
                    id: '4',
                    name: '天安门广场',
                    address: '北京市东城区天安门广场',
                    latitude: 39.9042,
                    longitude: 116.4074,
                },
                {
                    id: '5',
                    name: '故宫博物院',
                    address: '北京市东城区景山前街4号',
                    latitude: 39.9163,
                    longitude: 116.3972,
                },
            ];

            // 根据搜索词过滤结果
            const filteredResults = mockResults.filter(
                (result) =>
                    result.name.includes(searchValue) || result.address.includes(searchValue),
            );

            setSearchResults(filteredResults);

            if (filteredResults.length > 0) {
                // 移动地图到第一个结果
                setMapCenter({
                    latitude: filteredResults[0].latitude,
                    longitude: filteredResults[0].longitude,
                });
            }
        } catch (error) {
            console.error('搜索地点失败:', error);
            Taro.showToast({
                title: '搜索失败，请重试',
                icon: 'none',
            });
        } finally {
            setIsSearching(false);
        }
    };

    // 选择地点
    const handleSelectLocation = (location: SearchResult) => {
        setSelectedLocation(location);
        setMapCenter({
            latitude: location.latitude,
            longitude: location.longitude,
        });

        // 更新地图标记
        setMarkers([
            {
                id: location.id,
                latitude: location.latitude,
                longitude: location.longitude,
                title: location.name,
                iconPath: '../../static/img/marker.png',
                width: 30,
                height: 40,
                callout: {
                    content: location.name,
                    display: 'ALWAYS',
                    fontSize: 12,
                    borderRadius: 4,
                    padding: 8,
                    bgColor: '#ffffff',
                    color: '#333333',
                },
            },
        ]);
    };

    // 地图点击事件
    const handleMapTap = (e: any) => {
        const { latitude, longitude } = e.detail;

        // 创建新的位置信息
        const newLocation: SearchResult = {
            id: 'custom_' + Date.now(),
            name: `选择位置 (${longitude.toFixed(4)}, ${latitude.toFixed(4)})`,
            address: '自定义位置',
            latitude,
            longitude,
        };

        setSelectedLocation(newLocation);
        setMapCenter({ latitude, longitude });
        setMarkers([
            {
                id: newLocation.id,
                latitude,
                longitude,
                title: newLocation.name,
                iconPath: '../../static/img/marker.png',
                width: 30,
                height: 40,
                callout: {
                    content: '自定义位置',
                    display: 'ALWAYS',
                    fontSize: 12,
                    borderRadius: 4,
                    padding: 8,
                    bgColor: '#ffffff',
                    color: '#333333',
                },
            },
        ]);
    };

    // 确认选择
    const handleConfirm = () => {
        if (!selectedLocation) {
            Taro.showToast({
                title: '请先选择一个地点',
                icon: 'none',
            });
            return;
        }

        // 将选中的位置信息保存到本地存储
        const location = {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            address: selectedLocation.name,
            city: selectedLocation.address.split('市')[0] + '市',
        };

        // 使用本地存储传递给上一个页面
        Taro.setStorageSync('selected_location', JSON.stringify(location));

        Taro.navigateBack();
    };

    // 返回
    const handleBack = () => {
        Taro.navigateBack();
    };

    // 重新定位到当前位置
    const handleRelocate = () => {
        setMapCenter(currentLocation);
        Taro.showToast({
            title: '已回到当前位置',
            icon: 'none',
        });
    };

    return (
        <Layout className="h-screen flex flex-col">
            <View className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <View
                    className="flex items-center"
                    onClick={handleBack}>
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    <Text className="text-lg font-medium">选择地点</Text>
                </View>
            </View>

            <View className="flex-1 flex flex-col">
                {/* 搜索栏 */}
                <View className="bg-white p-4 border-b border-gray-200">
                    <View className="flex items-center gap-3">
                        <Input
                            type="text"
                            placeholder="请输入地点名称或地址"
                            value={searchValue}
                            onInput={(e) => setSearchValue(e.detail.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            confirmType="search"
                            onConfirm={handleSearch}
                        />
                        <Button
                            onClick={handleSearch}
                            loading={isSearching}
                            className="bg-theme text-white px-4 py-2 rounded-lg">
                            搜索
                        </Button>
                    </View>
                </View>

                {/* 地图区域 */}
                <View className="flex-1 relative">
                    <Map
                        style={{ width: '100%', height: '100%' }}
                        latitude={mapCenter.latitude}
                        longitude={mapCenter.longitude}
                        scale={16}
                        markers={markers}
                        showLocation={true}
                        onTap={handleMapTap}>
                        {/* 中心点标记 */}
                        <CoverView className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <CoverImage
                                src="../../static/img/marker.png"
                                style={{ width: 30, height: 40 }}
                            />
                        </CoverView>

                        {/* 重新定位按钮 */}
                        <CoverView className="absolute bottom-4 right-4">
                            <CoverView
                                className="bg-white rounded-full p-2 shadow-lg"
                                onClick={handleRelocate}>
                                <Text className="text-[20px] iconfont icon-dingwei"></Text>
                            </CoverView>
                        </CoverView>
                    </Map>

                    {/* 当前选中的位置信息 */}
                    {selectedLocation && (
                        <View className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                            <Text className="font-medium text-gray-900">
                                {selectedLocation.name}
                            </Text>
                            <Text className="text-sm text-gray-600 mt-1">
                                {selectedLocation.address}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 搜索结果 */}
                {searchResults.length > 0 && (
                    <View className="h-1/3 bg-white border-t border-gray-200">
                        <ScrollView className="h-full">
                            <View className="p-4">
                                <Text className="text-sm text-gray-600 mb-3">
                                    搜索结果 ({searchResults.length})
                                </Text>
                                {searchResults.map((result) => (
                                    <View
                                        key={result.id}
                                        className={`p-3 mb-2 rounded-lg border ${
                                            selectedLocation?.id === result.id
                                                ? 'border-theme bg-theme/5'
                                                : 'border-gray-200 bg-white'
                                        }`}
                                        onClick={() => handleSelectLocation(result)}>
                                        <Text className="font-medium text-gray-900 block">
                                            {result.name}
                                        </Text>
                                        <Text className="text-sm text-gray-600 mt-1">
                                            {result.address}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}
            </View>

            {/* 底部确认按钮 */}
            <View className="bg-white border-t border-gray-200">
                <Button
                    onClick={handleConfirm}
                    disabled={!selectedLocation}
                    className={`w-full rounded-lg font-medium ${
                        selectedLocation ? 'bg-theme text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    确认选择
                </Button>
            </View>
        </Layout>
    );
};

export default MapLocation;
