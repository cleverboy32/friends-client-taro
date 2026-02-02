import Taro from '@tarojs/taro';

const WEBSOCKET_URL = 'wss://www.meetu.online/ws'; // 请替换为您的实际 WebSocket URL

let ws: Taro.SocketTask | null = null;
let messageHandlers: ((message: string) => void)[] = [];
let reconnectTimer: number | null = null;
const RECONNECT_INTERVAL = 5000; // 5秒后重连
let isListenersAttached = false;

async function connectWebSocket(): Promise<void> {
    // readyState: 0-CONNECTING, 1-OPEN, 2-CLOSING, 3-CLOSED
    if (ws && ws.readyState === 1 /* OPEN */) {
        console.log('WebSocket already connected.');
        return;
    }

    if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    }

    console.log('Attempting to connect WebSocket...');

    const token = Taro.getStorageSync('x-token');
    ws = await Taro.connectSocket({
        url: WEBSOCKET_URL,
        header: {
            Authorization: token,
        },
        success: () => {
            console.log('WebSocket connection initiated successfully.');
        },
        fail: (error) => {
            console.error('WebSocket connection initiation failed:', error);
            // scheduleReconnect();
        },
    });

    if (!isListenersAttached) {
        Taro.onSocketOpen(() => {
            console.log('WebSocket Opened');
            // 连接成功后可以发送一些初始化消息，例如认证信息
            // sendMessage(JSON.stringify({ type: 'auth', token: 'your_token' }));
        });

        Taro.onSocketMessage((message) => {
            console.log('WebSocket Received:', message.data);
            messageHandlers.forEach(handler => handler(message.data as string));
        });

        Taro.onSocketClose((closeEvent) => {
            console.log('WebSocket Closed:', closeEvent);
            ws = null;
            scheduleReconnect();
        });

        Taro.onSocketError((error) => {
            console.error('WebSocket Error:', error);
            ws = null;
            scheduleReconnect();
        });
        isListenersAttached = true;
    }
}

function scheduleReconnect(): void {
    if (reconnectTimer) {
        return;
    }
    reconnectTimer = setTimeout(() => {
        console.log('Reconnecting WebSocket...');
        connectWebSocket();
    }, RECONNECT_INTERVAL) as unknown as number; // Node.js setTimeout returns NodeJS.Timeout, Browser returns number
}

export function sendMessage(message: string, successCallback?: () => void ): void {
    // readyState: 0-CONNECTING, 1-OPEN, 2-CLOSING, 3-CLOSED
    if (ws && ws.readyState === 1 /* OPEN */) {
        ws.send({
            data: message,
            success: () => {
                successCallback?.();
                console.log('WebSocket Sent:', message);
            },
            fail: (error) => {
                console.error('WebSocket Send Failed:', error);
            },
        });
    } else {
        console.warn('WebSocket is not connected. Message not sent:', message);
        // 如果未连接，尝试重新连接并排队消息，或者直接提示用户
        connectWebSocket(); // 尝试重新连接
    }
}

export function onReceiveMessage(handler: (message: string) => void): () => void {
    messageHandlers.push(handler);
    return () => {
        // 返回一个取消订阅的函数
        messageHandlers = messageHandlers.filter(h => h !== handler);
    };
}

// 暴露连接函数，以便在需要时手动调用（例如，在用户登录后）
export { connectWebSocket };