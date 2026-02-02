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
    addOrUpdateChatUser: (user: { id: number; name: string; avatar?: string }, currentUserId: number) => void;
    getChatList: (userId: number) => Promise<void>;
    getChatMessage: (params: ChatQuery) => Promise<void>;
    sendMessage: (params: { toId: number, content: string }, fromUser: Pick<UserInfo, 'id' | 'name' | 'avatar'>) => void;
    addMessage: (message: Message, fromSocket: boolean) => void;
    clearUnread: (chatId: string) => void;
    deleteChat: (chatUserId: number) => void;
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

    addOrUpdateChatUser: (user, currentUserId) => {
        set(state => {
            const existingUser = state.chatList.find(item =>  item.chatUser.id === user.id);
            if (existingUser) {
                // Move existing user to the top
                const otherUsers = state.chatList.filter(item => item.chatUser.id !== user.id);
                return { chatList: [existingUser, ...otherUsers] };
            } else {
                // Add new user to the top
                const newUser = {
                    chatUser: {
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                    },
                    chatId: [user.id, currentUserId].sort((a,b) => a-b).join('-'),
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
            const unreadChat = response.list
            set(state => {

                // 过滤存储的脏数据
                const oldList = state.chatList.filter((item) => {
                    return item.chatId && item.chatUser?.id && item.chatUser?.name;
                });

                const oldChats = oldList.filter((oldChat) => unreadChat.findIndex(chat => chat.chatId === oldChat.chatId) === -1);
                return {
                    chatList: [...unreadChat, ...oldChats]
                }
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
                        [params.chatId]: updatedMessages.filter((item) => !!item.id),
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
        console.log(get().chatList)

        // 我发给对方
        const message: Message = {
            id: Date.now().toString(),
            chatId,
            fromId,
            toId,
            content,
            createdAt: new Date(),
            hasRead: false,
            fromUser: { id: fromId, name: fromUser.name, avatar: fromUser.avatar },
            toUser: get().chatList.find(c => c.chatId === chatId)?.chatUser
        };

        const wsPayload = message;
        sendWsMessage(JSON.stringify(wsPayload), () => {
            get().addMessage(message, false);
        });
    },

    syncMessageId: (msg: { replaceId: string, saveId: string, chatId: string }) => {
        set(state => {
            const { replaceId, saveId, chatId } = msg;
            const messages = state.chatMessages[msg.chatId];

            const list = messages.map((item) => {
                if (item.id === replaceId) {
                    item.id =  saveId;
                }
                return item;
            })
            return {
                chatMessages: {
                    ...state.chatMessages,
                    [chatId]: list,
                },
            }
        })
    },

    addMessage: (message, fromSocket) => {
        set(state => {
            // 消息可能是我给对方的，也可能是对方给我的
            const { chatId } = message;
            const existingMessages = state.chatMessages[chatId] || [];
            const updatedMessages = [...existingMessages, message];

            let newChat;

            if (!state.chatList.find((chat) => chat.chatId === chatId)) {
                // 还要添加到会话列表
                newChat = {
                    chatUser: fromSocket ? message.fromUser : message.toUser,
                    chatId,
                    unRead: 1,
                }
            }

            return {
                chatMessages: {
                    ...state.chatMessages,
                    [chatId]: updatedMessages,
                },
                chatList: newChat ? [newChat, ...state.chatList] : state.chatList
            };
        });
    },

    clearUnread: (chatId: string) => {
        let chatUser
        set(state => ({
            chatList: state.chatList.map(chat => {
                if (chat.chatId === chatId) {
                    chatUser = chat.chatUser
                }
                return chat.chatId === chatId ? { ...chat, unRead: 0 } : chat
            }),
        }));

        sendWsMessage(JSON.stringify({ type: 'readMessage', chatId, fromId: chatUser.id }));
    },
    deleteChat: (chatUserId: number) => {
        set(state => {
            const chatToDelete = state.chatList.find(chat => chat.chatUser.id === chatUserId);
            if (!chatToDelete) {
                return state; // No chat found, return current state
            }
            const newChatList = state.chatList.filter(chat => chat.chatUser.id !== chatUserId);
            const newChatMessages = { ...state.chatMessages };
            delete newChatMessages[chatToDelete.chatId];

            return {
                chatList: newChatList,
                chatMessages: newChatMessages,
            };
        });
    }
}),
    {
        name: 'chat-storage',
        storage: createJSONStorage(() => taroStorage),
        partialize: (state) => ({ chatList: state.chatList }),
    }
));

export default useChatStore;

