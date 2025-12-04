/**
 * 位置选择工具函数
 */

const LOCATION_STORAGE_KEY = 'selected_location';

export interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    city?: string;
}

/**
 * 保存选中的位置到本地存储
 */
export const saveSelectedLocation = (location: LocationData) => {
    try {
        Taro.setStorageSync(LOCATION_STORAGE_KEY, JSON.stringify(location));
    } catch (error) {
        console.error('保存位置失败:', error);
    }
};

/**
 * 从本地存储获取选中的位置
 */
export const getSelectedLocation = (): LocationData | null => {
    try {
        const data = Taro.getStorageSync(LOCATION_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('获取位置失败:', error);
        return null;
    }
};

/**
 * 清除选中的位置
 */
export const clearSelectedLocation = () => {
    try {
        Taro.removeStorageSync(LOCATION_STORAGE_KEY);
    } catch (error) {
        console.error('清除位置失败:', error);
    }
};

/**
 * 使用腾讯地图API搜索地点
 * 需要在小程序后台配置腾讯地图key
 */
export const searchLocation = async (keyword: string, city: string = '北京'): Promise<LocationData[]> => {
    try {
        // 这里应该调用腾讯地图API，但需要先在小程序后台配置key
        // 模拟返回搜索结果
        const mockResults: LocationData[] = [
            {
                latitude: 39.9335,
                longitude: 116.4765,
                address: '朝阳公园',
                city: '北京市'
            },
            {
                latitude: 39.9927,
                longitude: 116.3973,
                address: '奥林匹克公园',
                city: '北京市'
            }
        ];

        return mockResults.filter(result => result.address.includes(keyword));
    } catch (error) {
        console.error('搜索地点失败:', error);
        return [];
    }
};