import React, {
    useEffect,
    useRef,
    useImperativeHandle,
    useCallback,
    memo,
    useState,
    useMemo,
} from 'react';
import { Map as TaroMap, CoverView, CoverImage, View } from '@tarojs/components';
import type { AutoComplete } from '@/types/map';

interface Marker {
    id: string;
    position: [number, number]; // [lng, lat]
    title: string;
    content?: string;
    icon?: string; // 自定义图标URL
    iconSize?: [number, number]; // 图标大小 [width, height]
}

interface MapStyle {
    mapStyle?: string; // 地图样式，可以是内置样式或自定义样式URL
    backgroundColor?: string; // 地图背景色
    features?: string[]; // 显示的地图要素
}

interface MapProps {
    id?: string;
    width?: string;
    height?: string;
    center?: number[]; // [lng, lat]
    zoom?: number;
    markers?: Marker[];
    mapStyle?: MapStyle;
    mapConfig?: any; // Taro 地图配置
    onMarkerClick?: (marker: Marker) => void;
    autoCompleteOptions?: AutoComplete.Options;
    controlBar?: boolean;
    toolBar?: boolean;
    onSelectLocation?: (location: AutoComplete.Poi) => void;
    className?: string;
}

export interface MapRef {
    getMap: () => any | null;
    setCenter: (center: [number, number]) => void;
    addMarker: (marker: Marker) => void;
    clearMarkers: () => void;
}

const DEFAULT_CENTER: [number, number] = [116.397428, 39.90923]; // 北京天安门
const DEFAULT_ZOOM = 11;

// 内置地图样式
export const MAP_STYLES = {
    NORMAL: 'amap://styles/normal', // 标准样式
    DARK: 'amap://styles/dark', // 深色样式
    LIGHT: 'amap://styles/light', // 浅色样式
    WHITESMOKE: 'amap://styles/whitesmoke', // 白烟样式
    FRESH: 'amap://styles/fresh', // 清新样式
    GREY: 'amap://styles/grey', // 灰色样式
    GRAFFITI: 'amap://styles/graffiti', // 涂鸦样式
    MACARON: 'amap://styles/macaron', // 马卡龙样式
    BLUEBERRY: 'amap://styles/blueberry', // 蓝莓样式
    MIDNIGHT: 'amap://styles/midnight', // 午夜样式
    PINK: 'amap://styles/pink', // 粉色样式
    DAWN: 'amap://styles/dawn', // 黎明样式
    SUNSET: 'amap://styles/sunset', // 日落样式
    WARM: 'amap://styles/warm', // 温暖样式
};

const defaultMapConfig = {
    showLocation: true,
    showScale: true,
    subKey: '',
    layerStyle: 1, // 1=标准, 2=卫星, 3=标准-路况
    rotateEnable: true,
    skewEnable: true,
    enableZoom: true,
    enableScroll: true,
    showCompass: true,
    enable3D: false,
    enableOverlooking: false,
    enableSatellite: false,
    enableTraffic: false,
};

const Map = memo(
    React.forwardRef<MapRef, MapProps>(
        (
            {
                id = 'map-container',
                width = '100%',
                height = '400px',
                center = DEFAULT_CENTER,
                zoom = DEFAULT_ZOOM,
                markers = [],
                mapStyle = {},
                mapConfig = {},
                onMarkerClick,
                autoCompleteOptions,
                controlBar = true,
                toolBar = true,
                onSelectLocation,
                className = '',
            },
            ref,
        ) => {
            const mapInstance = useRef<any>(null);
            const [currentCenter, setCurrentCenter] = useState<[number, number]>(center);
            const [currentZoom, setCurrentZoom] = useState<number>(zoom);

            // 转换 markers 为 Taro Map 的 markers 格式
            const taroMarkers = useMemo(() => {
                return markers.map((marker) => ({
                    id: marker.id,
                    latitude: marker.position[1], // Taro 使用 [lat, lng]
                    longitude: marker.position[0],
                    title: marker.title,
                    iconPath: marker.icon || '/assets/images/marker.png', // 默认图标
                    width: marker.iconSize?.[0] || 25,
                    height: marker.iconSize?.[1] || 34,
                    callout: marker.content
                        ? {
                              content: marker.content,
                              display: 'ALWAYS',
                              fontSize: 12,
                              borderRadius: 4,
                              padding: 10,
                              bgColor: '#ffffff',
                              color: '#333333',
                          }
                        : undefined,
                }));
            }, [markers]);

            // 处理标记点击事件
            const handleMarkerTap = useCallback(
                (event: any) => {
                    const markerId = event.markerId;
                    const marker = markers.find((m) => m.id === markerId);
                    if (marker && onMarkerClick) {
                        onMarkerClick(marker);
                    }
                },
                [markers, onMarkerClick],
            );

            // 处理地图点击事件（用于选择位置）
            const handleTap = useCallback(
                (event: any) => {
                    if (onSelectLocation && event.detail) {
                        // 注意：Taro Map 的点击事件返回的坐标格式可能需要处理
                        const { latitude, longitude } = event.detail;
                        // 这里需要调用地图逆地址解析服务来获取具体位置信息
                        // 由于小程序环境的限制，这个功能可能需要通过后端API来实现
                        console.log('Map tapped at:', latitude, longitude);
                    }
                },
                [onSelectLocation],
            );

            // 处理区域改变事件
            const handleRegionChange = useCallback((event: any) => {
                const { latitude, longitude, scale } = event.detail;
                setCurrentCenter([longitude, latitude]);
                setCurrentZoom(scale);
            }, []);

            useImperativeHandle(
                ref,
                () => ({
                    getMap: () => mapInstance.current,
                    setCenter: (nextCenter: [number, number]) => {
                        setCurrentCenter(nextCenter);
                    },
                    addMarker: (marker: Marker) => {
                        // 在 Taro Map 中，markers 是单向数据流，需要通过修改 markers props 来添加新标记
                        console.log('添加标记点:', marker);
                        // 这个功能需要在父组件中通过修改 markers 数组来实现
                    },
                    clearMarkers: () => {
                        // 清除标记点也需要在父组件中通过清空 markers 数组来实现
                        console.log('清除所有标记点');
                    },
                }),
                [],
            );

            // 搜索位置功能（需要使用微信原生API或实现自己的搜索服务）
            useEffect(() => {
                if (autoCompleteOptions && autoCompleteOptions.input) {
                    // 这个功能在小程序环境中需要使用微信小程序的API
                    // 或者调用你们自己的地理搜索服务
                    console.log('搜索位置功能需要在小程序环境中使用原生API实现');
                }
            }, [autoCompleteOptions]);

            return (
                <View
                    style={{ width, height }}
                    className={className}>
                    <TaroMap
                        id={id}
                        style={{ width: '100%', height: '100%' }}
                        longitude={currentCenter[0]}
                        latitude={currentCenter[1]}
                        scale={currentZoom}
                        markers={taroMarkers}
                        showLocation={controlBar}
                        showScale={toolBar}
                        onMarkerTap={handleMarkerTap}
                        onTap={handleTap}
                        onRegionChange={handleRegionChange}
                        {...defaultMapConfig}
                        {...mapConfig}
                    />
                </View>
            );
        },
    ),
);

export default Map;
