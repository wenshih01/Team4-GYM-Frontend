import SockJS from 'sockjs-client';
export class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(onMessageReceived) {
        try {
            // 使用 SockJS
            const socket = new SockJS('http://localhost:8082/ws');

            socket.onopen = () => {
                console.log('WebSocket Connected!');
                this.connected = true;
                this.reconnectAttempts = 0;

                // 發送連接成功消息
                this.send({
                    type: 'CONNECT',
                    userId: localStorage.getItem('userId') // 從 localStorage 獲取用戶 ID
                });
            };

            socket.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    onMessageReceived(notification);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            socket.onclose = () => {
                console.log('WebSocket Connection Closed');
                this.connected = false;
                this.reconnect(onMessageReceived);
            };

            socket.onerror = (error) => {
                console.error('WebSocket Error:', error);
            };

            this.socket = socket;

        } catch (error) {
            console.error('Error creating WebSocket:', error);
            this.reconnect(onMessageReceived);
        }
    }

    send(message) {
        if (this.socket && this.connected) {
            this.socket.send(JSON.stringify(message));
        }
    }

    reconnect(onMessageReceived) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect(onMessageReceived);
            }, 3000);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.connected = false;
        }
    }
}