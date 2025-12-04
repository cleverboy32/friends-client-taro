export namespace AutoComplete {
    export interface Options {
        input: string | HTMLElement;
        city?: string;
        citylimit?: boolean;
        type?: string;
        datatype?: string;
    }

    export interface Result {
        poi: Poi;
        status: string;
        info: string;
        count: number;
    }

    export interface Poi {
        id: number;
        name: string;
        type: string;
        typecode: string;
        address: string;
        location: Location;
        adcode: string;
        adname: string;
        citycode: string;
        city: string;
        district: string;
        provincecode: string;
        provincename: string;
    }

    export interface Location {
        lng: number;
        lat: number;
    }
}

export namespace PlaceSearch {
    export interface Options {
        map?: AMap.Map;
        city?: string;
    }

    export interface PoiList {
        pois: Poi[];
        count: number;
    }

    export interface Poi {
        id: string;
        name: string;
        location: AutoComplete.Location;
        address: string;
    }
}
