import { PropsWithChildren, useEffect } from 'react';
import { useLaunch } from '@tarojs/taro';
import useUserStore from '@/store/user';
import useChatStore from '@/store/chat';
import { connectWebSocket, onReceiveMessage } from '@/utils/websocket';
import './app.scss';
import Taro from '@tarojs/taro';

function App({ children }: PropsWithChildren<any>) {
    const { getUserInfo } = useUserStore();
    const { getChatList, addMessage } = useChatStore();

    useLaunch(async () => {
        try {
            const user = await getUserInfo();
            if (user && user.id) {
                // 1. 初始化用户的 chatlist 数据
                await getChatList(user.id);

                // 2. 建立与服务器的 websocket 链接
                await connectWebSocket();
            } else {
                Taro.redirectTo({
                    url: '/pages/login/index', // Redirect to login if no user info
                });
            }
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    });

    useEffect(() => {
        // 监听 WebSocket 消息
        const unsubscribe = onReceiveMessage((message) => {
            try {
                const parsedMessage = JSON.parse(message);
                console.log(parsedMessage);

                // 根据消息类型更新 store
                if (parsedMessage.chatId) {
                    addMessage(parsedMessage);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        });

        // 在组件卸载时取消订阅
        return () => {
            unsubscribe();
        };
    }, [addMessage]);

    // children 是将要会渲染的页面
    return children;
}

export default App;
