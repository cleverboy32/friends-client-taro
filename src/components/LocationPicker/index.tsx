import React, { useRef } from 'react';
import type { Location } from '@/types/activity';
import { Input, Button, View } from '@tarojs/components';
import Map, { type MapRef } from '../Map';
import type { AutoComplete } from '@/types/map';

interface LocationPickerProps {
    visible: boolean;
    value?: Location | null;
    onChange?: (location: Location) => void;
    onClose: () => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onChange, onClose, visible }) => {
    const mapRef = useRef<MapRef>(null);
    const poiRef = useRef<AutoComplete.Poi | null>(null);

    const handleSelectLocation = (poi: AutoComplete.Poi) => {
        poiRef.current = poi;
    };

    const handleConfirm = () => {
        if (poiRef.current) {
            const poi = poiRef.current;
            onChange?.({
                latitude: poi.location.lat,
                longitude: poi.location.lng,
                address: poi.name,
                city: poi.district,
            });
        }
        onClose();
    };

    return (
        <View
            className="h-[600px] w-[60vw]"
            visible={visible}
            onClose={onClose}>
            <View className="flex flex-col h-full relative">
                <Map
                    ref={mapRef}
                    mapConfig={{
                        zoom: 13,
                        viewMode: '2D',
                    }}
                    autoCompleteOptions={{
                        input: 'search-location',
                    }}
                    height="100%"
                    controlBar={false}
                    toolBar={false}
                    onSelectLocation={handleSelectLocation}
                />
                <View className="flex-1 absolute left-10  top-10 mb-2 w-[500px]">
                    <Input
                        id="search-location"
                        type="text"
                        placeholder="输入地址"
                    />
                </View>

                <View className="absolute bottom-0 left-0 right-0 p-4 bg-white">
                    <Button
                        onClick={handleConfirm}
                        className="w-full">
                        确定
                    </Button>
                </View>
            </View>
        </View>
    );
};

export default LocationPicker;
