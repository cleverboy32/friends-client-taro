export interface Activity {
    id: number;
    type: 'ONLINE' | 'OFFLINE';
    title: string;
    content: string;
    image: string[];
    createdAt: string;
    needPartner: boolean;
    authorId: number;
    author: {
        id: number;
        name: string;
        avatar?: string;
    };
    tags: string[];
    location?: {
        id: number;
        latitude: number;
        longitude: number;
        address?: string;
        city: string;
    };
    locationId?: number;
}

export interface CreateActivityParams {
    type: 'ONLINE' | 'OFFLINE';
    title: string;
    content: string;
    image: string[];
    needPartner: boolean;
    location: {
        id?: number;
        latitude: number;
        longitude: number;
        address?: string;
        city: string;
    };
    tagIds?: number[];
}

export interface UpdateActivityParams extends Partial<CreateActivityParams> {
    id: number;
}

export interface ActivityQueryParams {
    page?: number;
    pageSize?: number;
    type?: 'ONLINE' | 'OFFLINE';
    authorId?: number;
    lng?: number;
    lat?: number;
    tagId?: number;
    distance?: string;
    timeRange?: string;
    needPartner?: boolean;
}

export interface Tag {
    id: number;
    name: string;
    createdAt: string;
}

export interface Location {
    id?: number;
    latitude: number;
    longitude: number;
    address?: string;
    city: string;
}

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    authorId: number;
    activityId: number;
    author?: {
        id: number;
        name: string;
        avatar?: string;
    };
}
