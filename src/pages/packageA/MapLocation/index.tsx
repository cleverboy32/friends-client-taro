import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import {
    View,
    Text,
    Input,
    Button,
    ScrollView,
    Map,
    CoverView,
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
    const AMAP_KEY = process.env.TARO_APP_AMAP_KEY || '';
    // 高德微信小程序 SDK（amap-wx.js），需放在 src/static/libs/amap-wx.js
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const amapFile = process.env.TARO_ENV === 'weapp' ? require('../../../static/libs/amap-wx') : null;
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

    // 获取当前位置（失败则回退默认北京）
    useEffect(() => {
        Taro.getLocation({
            type: 'gcj02',
            success: (res) => {
                const location = {
                    latitude: res.latitude,
                    longitude: res.longitude,
                };
                setCurrentLocation(location);
                setMapCenter(location);
            },
            fail: () => {
                console.log('获取位置失败，使用默认位置');
            },
        });
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

        if (!AMAP_KEY) {
            Taro.showToast({
                title: '缺少高德Key',
                icon: 'none',
            });
            return;
        }

        if (!amapFile || !amapFile.AMapWX) {
            Taro.showToast({
                title: '高德SDK未加载',
                icon: 'none',
            });
            return;
        }

        setIsSearching(true);

        try {
            const myAmap = new amapFile.AMapWX({ key: AMAP_KEY });
            myAmap.getInputtips({
                keywords: searchValue,
                location: `${mapCenter.longitude},${mapCenter.latitude}`,
                success: (data: any) => {
                    const tips = data?.tips || [];
                    const results: SearchResult[] = tips
                        .map((item: any, index: number) => {
                            if (!item) return null;

                            // 兼容多种 location 结构：字符串 "lng,lat" 或 对象 { lng, lat }
                            let lng: number | null = null;
                            let lat: number | null = null;

                            if (typeof item.location === 'string' && item.location.includes(',')) {
                                const parts = item.location.split(',');
                                lng = Number(parts[0]);
                                lat = Number(parts[1]);
                            } else if (
                                typeof item.location === 'object' &&
                                item.location !== null
                            ) {
                                const locObj = item.location as any;
                                if (typeof locObj.lng === 'number' && typeof locObj.lat === 'number') {
                                    lng = locObj.lng;
                                    lat = locObj.lat;
                                }
                            }

                            if (!Number.isFinite(lng as number) || !Number.isFinite(lat as number)) {
                                return null;
                            }

                            const name = item.name || item.address || '';
                            if (!name) return null;
                            return {
                                id: item.id || String(index),
                                name,
                                address: `${item.district || ''}${item.address || ''}`,
                                latitude: lat as number,
                                longitude: lng as number,
                            };
                        })
                        .filter(Boolean) as SearchResult[];

                    setSearchResults(results);

                    if (results.length === 0) {
                        Taro.showToast({
                            title: '未找到结果',
                            icon: 'none',
                        });
                    }
                },
                fail: (err: any) => {
                    console.error('搜索失败:', err);
                    Taro.showToast({
                        title: '搜索失败，请重试',
                        icon: 'none',
                    });
                },
                complete: () => {
                    setIsSearching(false);
                },
            });
            return;
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
        setSearchResults([]);

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

    const handleMapError = (err: any) => {
        console.error('地图加载失败', err);
        Taro.showToast({
            title: '地图加载失败',
            icon: 'none',
        });
    };

    return (
        <Layout className="h-screen relative overflow-hidden">
            {/* 地图：固定在底层，铺满全屏 */}
            <View className="absolute inset-0 z-0">
                <Map
                    style={{ width: '100%', height: '100%' }}
                    latitude={mapCenter.latitude}
                    longitude={mapCenter.longitude}
                    scale={16}
                    markers={markers}
                    showLocation={true}
                    onTap={handleMapTap}
                    onError={handleMapError}>
                    {/* 中心点标记 */}
                    <CoverView className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    </CoverView>

                    {/* 重新定位按钮 */}
                    <CoverView className="absolute bottom-3 right-3">
                        <CoverView
                            className="bg-white rounded-full p-1.5 shadow-md"
                            onClick={handleRelocate}>
                            <Text className="text-[16px] iconfont icon-dingwei"></Text>
                        </CoverView>
                    </CoverView>
                </Map>
            </View>

            {/* 顶部返回栏：浮在地图上层 */}
            <View className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-white/95 border-b border-gray-200 backdrop-blur">
                <View
                    className="flex items-center"
                    onClick={handleBack}>
                    <ArrowLeftIcon className="w-4 h-4 mr-1.5" />
                    <Text className="text-base font-medium">选择地点</Text>
                </View>
            </View>

            {/* 搜索 + 搜索结果：作为一个整体气泡，相对定位在地图上层 */}
            <View className="absolute z-10 left-3 right-3 top-14 bottom-18 flex flex-col pointer-events-none">
                <View className="bg-white/95 rounded-xl shadow-xl px-3 py-2.5 border border-gray-100 pointer-events-auto">
                    {/* 搜索栏 */}
                    <View className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="请输入地点名称或地址"
                            value={searchValue}
                            onInput={(e) => setSearchValue(e.detail.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm"
                            confirmType="search"
                            onConfirm={handleSearch}
                        />
                        <Button
                            onClick={handleSearch}
                            loading={isSearching}
                            className="text-white px-3 py-1.5 rounded-md text-sm"
                            style={{ backgroundColor: '#b5caa0' }}>
                            搜索
                        </Button>
                    </View>

                    {/* 搜索结果列表 */}
                    {searchResults.length > 0 && (
                        <View className="mt-1 max-h-[45vh]">
                            <ScrollView
                                className="max-h-[45vh]"
                                scrollY>
                                <View>
                                    <Text className="text-xs text-gray-600 mb-2 block">
                                        搜索结果 ({searchResults.length})
                                    </Text>
                                    {searchResults.map((result) => (
                                        <View
                                            key={result.id}
                                            className={`px-2.5 py-1.5 mb-1.5 rounded-lg border ${
                                                selectedLocation?.id === result.id
                                                    ? 'border-theme bg-theme/5'
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                            onClick={() => handleSelectLocation(result)}>
                                            <Text className="font-medium text-gray-900 block text-sm">
                                                {result.name}
                                            </Text>
                                            <Text className="text-xs text-gray-600 mt-0.5">
                                                {result.address}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>

            {/* 底部确认按钮：悬浮在地图上 */}
            <View className="absolute left-0 right-0 bottom-[60px] z-10  border-t border-gray-200 px-3 py-2">
                <Button
                    onClick={handleConfirm}
                    disabled={!selectedLocation}
                    className={`w-full rounded-md text-sm font-medium py-2 ${
                        selectedLocation ? 'bg-theme text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    确认选择
                </Button>
            </View>
        </Layout>
    );
};

export default MapLocation;
