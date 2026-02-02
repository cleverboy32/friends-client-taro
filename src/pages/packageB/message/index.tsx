import useChatStore from '@/store/chat';
import { View, Text, ScrollView, Input, Button, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow, useDidHide } from '@tarojs/taro';
import { useEffect, useState, useMemo, useRef } from 'react';
import Layout from '@/components/Layout';
import { ChatUser } from '@/types/chat';
import useUserStore from '@/store/user';
import { formatTime, parseDate } from '@/utils/date';


const MessagePage = () => {
    const { chatList, chatMessages, sendMessage, getChatMessage, clearUnread } = useChatStore();
    const { userInfo } = useUserStore();
    const [inputValue, setInputValue] = useState('');
    const [toUser, setToUser ] = useState<ChatUser | undefined>();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [scrollIntoView, setScrollIntoView] = useState('');
    const scrollViewRef = useRef<HTMLDivElement | null>(null);


    const chatId = useMemo(() => {
        if (!toUser?.id) {
            return '';
        } 
        if (!userInfo?.id) {
            return '';
        }

        return [userInfo.id, toUser.id].sort((a, b) => a - b).join('-')
    }, [toUser, userInfo]);

    const messages = useMemo(() => {
        if (chatId && chatMessages[chatId]?.length) {
            return chatMessages[chatId];
        }

        return [];
    }, [chatMessages, chatId])

    const scrollToBottom = () => {
        setScrollIntoView(''); // 先清空，确保状态能触发更新
        Taro.nextTick(() => {
            setScrollIntoView('bottom-node'); // 'bottom-node' 是列表最下方一个空 View 的 ID
        });
      };

    useEffect(() => {
        //  init history chat message
        if (chatId) {
            getChatMessage({
                chatId,
                toId: toUser!.id,
                fromId: userInfo!.id,
                page,
                pageSize: 50
            });
        }
    }, [chatId, page, userInfo]);

    useEffect(() => {
        if (chatId) {
            clearUnread(chatId);
        }
    }, [chatId]);

    

    useEffect(() => {
        scrollToBottom();
    }, [messages, keyboardHeight]);

    useEffect(() => {
        const { toId } = router.params;
        const chat = chatList.find((chat) => Number(toId) === chat.chatUser.id);

        if (!chat) {
            return;
        }
        const user = chat.chatUser;
        setToUser(user);
    }, [router.params, chatList]);
    
    const handleSendMessage = () => {
        if (inputValue.trim() && userInfo && toUser?.id) {
            sendMessage({
                toId: toUser.id,
                content: inputValue.trim(),
            }, userInfo);
            setInputValue('');
        }
    };

    useDidShow(() => {
        Taro.onKeyboardHeightChange(res => {
            setKeyboardHeight(res.height);
        });
    });

    useDidHide(() => {
        Taro.offKeyboardHeightChange();
    });

    const handleBack = () => {
        Taro.navigateBack();
    };
    const defaultAvatar = 'https://via.placeholder.com/40';

    let previousMessageCreatedAt: Date | null = null;

    return (
        <Layout className="px-[8px] bg-white h-[100vh] overflow-hidden" showBottomSafeArea>
            {/* <Navbar title={toUser?.name} left={<ArrowLeftIcon className="w-5 h-5" />} onClickLeft={handleBack} /> */}
            <ScrollView
                className="flex-1 overflow-y-auto box-border"
                scrollY
                scrollWithAnimation
                scrollIntoView={scrollIntoView}
            >
                {messages.map((message, index) => {
                    const currentMessageCreatedAt = parseDate(message.createdAt);
                    const showTime = 
                        !previousMessageCreatedAt || // Always show time for the first message
                        (currentMessageCreatedAt && previousMessageCreatedAt && 
                         (currentMessageCreatedAt.getTime() - previousMessageCreatedAt.getTime()) / (1000 * 60) > 1);

                    previousMessageCreatedAt = currentMessageCreatedAt;

                    return (
                        <View key={message.id}>
                            {showTime && currentMessageCreatedAt && (
                                <View className="text-center text-gray-500 text-xs my-2">
                                    <Text>{formatTime(currentMessageCreatedAt)}</Text>
                                </View>
                            )}
                            <View
                                id={`msg-${message.id}`}
                                className={`mb-5 flex ${message.fromId === userInfo?.id ? 'justify-end' : 'justify-start'} items-end`}
                            >
                                {message.fromId !== userInfo?.id && (
                                    <Image src={toUser?.avatar || defaultAvatar} className="w-10 h-10 rounded-full mr-3" />
                                )}
                                <Text
                                    className={`px-4 py-2 rounded-xl max-w-[70%] break-words ${message.fromId === userInfo?.id ? 'bg-green-500 text-white order-2' : 'bg-white order-1'}`}
                                >
                                    {message.content}
                                </Text>
                                {message.fromId === userInfo?.id && (
                                    <Image src={userInfo?.avatar || defaultAvatar} className="w-10 h-10 rounded-full ml-3 order-3" />
                                )}
                            </View>
                        </View>
                    );
                })}
                <View id="bottom-node" className="h-[20px]"></View>
            </ScrollView>
            <View className="flex p-2.5 bg-white border-t border-gray-300 z-10" style={{ paddingBottom: `${keyboardHeight}px` }} >
                <Input
                    adjust-position={false}
                    className="flex-1 h-10 px-2.5 border border-gray-300 rounded-md"
                    value={inputValue}
                    onInput={(e) => setInputValue(e.detail.value)}
                    placeholder="输入消息"
                    confirmType="send"
                    onConfirm={handleSendMessage}
                />
                <Button
                    className="w-20 h-10 ml-2.5 bg-green-600 text-white border-none rounded-md"
                    onClick={handleSendMessage}
                >
                    发送
                </Button>
            </View>
        </Layout>
    );
};

export default MessagePage;
