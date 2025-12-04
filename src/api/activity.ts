import { get, post, put, del } from '@/utils/request';
import type {
    Activity,
    CreateActivityParams,
    UpdateActivityParams,
    ActivityQueryParams,
} from '@/types/activity';

// 创建活动
export const createActivity = (data: CreateActivityParams) => {
    return post<Activity>('/activity/post', data);
};

// 获取活动列表
export const getActivityList = (params: ActivityQueryParams = {}) => {
    return post<{
        items: Activity[];
        total: number;
        page: number;
        totalPage: number;
    }>('/activity/list', params);
};

// 获取活动详情
export const getActivityDetail = (activityId: number) => {
    return post<Activity>(`/activity/detail`, { id: activityId });
};

// 更新活动信息
export const updateActivity = (_activityId: number, data: UpdateActivityParams) => {
    return put<Activity>(`/activity/update`, data);
};

// 删除活动
export const deleteActivity = (activityId: number) => {
    return del(`/activity/${activityId}`);
};

// 获取我创建的活动
export const getMyCreatedActivities = (params: ActivityQueryParams = {}) => {
    return get<{
        list: Activity[];
        total: number;
        page: number;
        pageSize: number;
    }>('/activity/created', params);
};

// 获取我参加的活动
export const getMyJoinedActivities = (params: ActivityQueryParams = {}) => {
    return get<{
        list: Activity[];
        total: number;
        page: number;
        pageSize: number;
    }>('/activity/joined', params);
};
