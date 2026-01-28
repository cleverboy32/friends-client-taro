import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { getChatList as getChatListApi, getChatMessage as getChatMessageApi } from '@/api/chat';
import type { Message, ChatQuery, ChatUnreadResponse } from '@/types/chat';
import { sendMessage as sendWsMessage } from '@/utils/websocket';
import { UserInfo } from '@/types/user';


interface ChatState {
    chatList: ChatUnreadResponse['list'];
    chatMessages: Record<string, Message[]>;
    isLoading: boolean;
    addOrUpdateChatUser: (user: { id: number; name: string; avatar?: string }, fromUser: Pick<UserInfo, 'id' | 'name'>) => void;
    getChatList: (userId: number) => Promise<void>;
    getChatMessage: (params: ChatQuery) => Promise<void>;
    sendMessage: (params: { toId: number, content: string }, fromUser: Pick<UserInfo, 'id' | 'name' | 'avatar'>) => void;
    addMessage: (message: Message) => void;
}

const taroStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            const res = await Taro.getStorage({ key: name });
            return res.data;
        } catch (error) {
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await Taro.setStorage({ key: name, data: value });
    },
    removeItem: async (name: string): Promise<void> => {
        await Taro.removeStorage({ key: name });
    },
};

const useChatStore = create<ChatState>()(persist((set, get) => ({
    chatList: [],
    chatMessages: {},
    isLoading: false,

    addOrUpdateChatUser: (user, fromUser) => {
        set(state => {
            const existingUser = state.chatList.find(u => u.toId === user.id);
            if (existingUser) {
                // Move existing user to the top
                const otherUsers = state.chatList.filter(u => u.toId !== user.id);
                return { chatList: [existingUser, ...otherUsers] };
            } else {
                // Add new user to the top
                const newUser = {
                    toId: user.id,
                    toUser: {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                    },
                    fromId: fromUser.id,
                    fromUser: {
                        id: fromUser.id,
                        name: fromUser.name,
                    },
                    chatId: [user.id, fromUser.id].sort((a,b) => a-b).join('-'),
                    unRead: 0,
                };

                return { chatList: [newUser, ...state.chatList] };
            }
        });
    },

    getChatList: async (userId: number) => {
        try {
            set({ isLoading: true });
            const response = await getChatListApi(userId);
            const chatUsers = response.list
            set(state => {
                const newChats = chatUsers.filter((item) => state.chatList.findIndex(oldChat => oldChat.chatId === item.chatId) === -1);

                return [...newChats, ...state.chatList];
            });
        } catch (error) {
            console.error('Failed to fetch chat list:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    getChatMessage: async (params: ChatQuery) => {
        try {
            set({ isLoading: true });
            const response = await getChatMessageApi(params);
            set((state) => {
                const existingMessages = state.chatMessages[params.chatId] || [];
                const existingMessageIds = new Set(existingMessages.map(msg => msg.id));

                // Filter out any potential duplicates
                const uniqueNewMessages = response.chat.filter(msg => !existingMessageIds.has(msg.id));

                // Prepend new messages to the existing list to handle loading older messages
                const updatedMessages = [...uniqueNewMessages, ...existingMessages];

                return {
                    chatMessages: {
                        ...state.chatMessages,
                        [params.chatId]: updatedMessages,
                    },
                };
            });
        } catch (error) {
            console.error('Failed to fetch chat messages:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    sendMessage: (params, fromUser) => {
        if (!fromUser) {
            console.error("User is not logged in, cannot send message.");
            return;
        }

        const { toId, content } = params;
        const fromId = fromUser.id;

        const chatId = [fromId, toId].sort((a,b) => a-b).join('-');

        const message: Message = {
            id: Date.now().toString(),
            chatId,
            fromId,
            toId,
            content,
            createdAt: new Date(),
            hasRead: false,
            fromUser: { id: fromId, name: fromUser.name, avatar: fromUser.avatar },
            toUser: get().chatList.find(c => c.toId === toId)?.toUser || { id: toId, name: 'Unknown' },
        };

        const wsPayload = message;
        sendWsMessage(JSON.stringify(wsPayload), () => {
            get().addMessage(message);
        });
    },

    addMessage: (message) => {
        set(state => {
            const { chatId } = message;
            const existingMessages = state.chatMessages[chatId] || [];
            const updatedMessages = [...existingMessages, message];
            return {
                chatMessages: {
                    ...state.chatMessages,
                    [chatId]: updatedMessages,
                },
            };
        });
    }
}),
    {
        name: 'chat-storage',
        storage: createJSONStorage(() => taroStorage),
        partialize: (state) => ({ chatList: state.chatList, chatMessages: state.chatMessages }),
    }
));

export default useChatStore;

