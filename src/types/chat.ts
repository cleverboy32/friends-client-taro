export interface SendChatParams {
    fromId: number;
    toId: number;
    content: string;
}

export interface ChatQuery {
    chatId: string;
    fromId: number;
    toId: number;
    page: number;
    pageSize: number;
}

export interface ChatUser {
    id: number;
    name: string;
    avatar?: string;
}

export interface Message {
    id?: string;
    chatId: string;
    fromId: number;
    fromUser?: ChatUser;
    toId: number;
    toUser?: ChatUser;
    content: string;
    createdAt: Date;
    hasRead: boolean;
}

export interface ChatResponse {
    chat: Message[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    totalPage?: number;
}

export interface ChatUnreadResponse {
    list: {
        fromId: number;
        fromUser: ChatUser;
        toId: number;
        toUser: ChatUser;
        chatId: string;
        unRead: number;
    }[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    totalPage?: number;
}
