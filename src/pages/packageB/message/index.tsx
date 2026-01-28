import useChatStore from '@/store/chat';
import { View, Text, ScrollView, Input, Button, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow, useDidHide } from '@tarojs/taro';
import { useEffect, useState, useMemo, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import { ChatUser } from '@/types/chat';
import useUserStore from '@/store/user';


const MessagePage = () => {
    const { chatList, chatMessages, sendMessage, getChatMessage } = useChatStore();
    const { userInfo } = useUserStore();
    const [inputValue, setInputValue] = useState('');
    const [toUser, setToUser ] = useState<ChatUser | undefined>();
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [scrollIntoView, setScrollIntoView] = useState('');


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
        if (messages.length > 0) {
            Taro.nextTick(() => {
                console.log(`msg-${messages[messages.length - 1].id}`)
                setScrollIntoView(`msg-${messages[messages.length - 1].id}`);
            });
        }
    }, [messages]);

    useEffect(() => {
        const { toId } = router.params;
        const user = chatList.find((chat) => Number(toId) === chat.toUser?.id)?.toUser;
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

    return (
        <Layout className="px-[8px] bg-white h-[100vh] overflow-hidden">
            {/* <Navbar title={toUser?.name} left={<ArrowLeftIcon className="w-5 h-5" />} onClickLeft={handleBack} /> */}
            <ScrollView
                className="flex-1 overflow-y-auto box-border"
                scrollY
                scrollWithAnimation
                scrollIntoView={scrollIntoView}
                style={{ paddingBottom: `${keyboardHeight + 60}px` }} // 60px is approx height of the input bar
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
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
                ))}
            </ScrollView>
            <View className="flex p-2.5 bg-white border-t border-gray-300 z-10">
                <Input
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
