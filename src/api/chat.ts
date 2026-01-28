import { get, post, put, del } from '@/utils/request';
import type {
    ChatQuery,
    ChatResponse,
    ChatUnreadResponse,
    SendChatParams
} from '@/types/chat';


export const getChatMessage = (params: ChatQuery) => {
    return post<ChatResponse>('/chat/messages', params);
};

export const getChatList = (userId: number) => {
    return post<ChatUnreadResponse>(`/chat/unread`, { userId });
};

export const sendChatMessage = (params: SendChatParams) => {
    return post<Message>('/chat/send', params);
};

