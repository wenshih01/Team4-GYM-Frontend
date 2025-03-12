<template>
    <div class="notification-container">
        <!-- 通知圖標和未讀數量 -->
        <v-badge :content="unreadCount" :model-value="unreadCount > 0" color="error" class="notification-badge"
            location="top end">
            <v-btn icon class="notification-btn" @click="toggleNotifications">
                <i class="fa-solid fa-bell"></i>
            </v-btn>
        </v-badge>

        <!-- 通知下拉面板 -->
        <v-menu v-model="showNotifications" :close-on-content-click="false" location="end" :offset="[0, 60]"
            position="fixed" class="notification-menu">
            <v-card class="notification-panel">
                <v-card-title class="notification-header">
                    <span>通知</span>
                    <v-btn v-if="unreadCount > 0" variant="text" size="small" @click="markAllAsRead"
                        class="mark-read-btn">
                        全部標為已讀
                    </v-btn>
                </v-card-title>

                <v-card-text class="notification-list">
                    <template v-if="notifications.length > 0">
                        <div v-for="notification in notifications" :key="notification.id" class="notification-item"
                            :class="{ 'unread': !notification.isRead }" @click="handleNotificationClick(notification)">
                            <div class="notification-avatar">
                                <img v-if="notification.senderAvatar" :src="notification.senderAvatar"
                                    :alt="notification.senderUsername" @error="handleAvatarError" />
                                <i v-else class="fa-solid fa-user avatar-fallback"></i>
                            </div>
                            <div class="notification-content">
                                <div class="notification-text">{{ notification.content }}</div>
                                <div class="notification-time">
                                    {{ formatTimeAgo(notification.createdAt) }}
                                </div>
                            </div>
                        </div>
                    </template>
                    <div v-else class="no-notifications">
                        目前沒有通知
                    </div>
                </v-card-text>

                <v-card-actions v-if="notifications.length > 0">
                    <v-btn block variant="text" :loading="loading" :disabled="noMoreData" @click="loadMore"
                        class="load-more-btn">
                        {{ noMoreData ? '沒有更多通知' : '載入更多' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { WebSocketService } from '@/services/NotificationService';
import apiClient from '../api/apiClient';
import axios from '@/api/apiClient';
const emit = defineEmits(['show-post']);
const router = useRouter();
const notifications = ref([]);
const unreadCount = ref(0);
const showNotifications = ref(false);
const loading = ref(false);
const currentPage = ref(0);
const noMoreData = ref(false);
const currentUser = ref(null);
let webSocketService;

const props = defineProps({
    onShowPost: {
        type: Function,
        required: true
    }
});

// 獲取通知列表
const fetchNotifications = async (page = 0) => {
    try {
        loading.value = true;
        const response = await axios.get('/notifications', {
            params: { page, size: 20 },
            withCredentials: true  // 確保發送 cookie
        });

        if (page === 0) {
            notifications.value = response.data.content;
        } else {
            notifications.value.push(...response.data.content);
        }

        noMoreData.value = response.data.content.length < 20;
        currentPage.value = page;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        if (error.response?.status === 401) {
            // 未登入處理
            notifications.value = [];
        }
    } finally {
        loading.value = false;
    }
};

// 獲取未讀數量
const fetchUnreadCount = async () => {
    try {
        const response = await apiClient.get('/notifications/unread-count');
        unreadCount.value = response.data;
    } catch (error) {
        if (error.response?.status !== 401) {  // 如果不是未授權錯誤才顯示
            console.error('Error fetching unread count:', error);
        }
        unreadCount.value = 0;
    }
};

// 切換通知面板
const toggleNotifications = () => {
    showNotifications.value = !showNotifications.value;
    if (showNotifications.value) {
        fetchNotifications();
    }
};

// 處理通知點擊
const handleNotificationClick = async (notification) => {
    try {
        if (!notification.isRead) {
            await axios.put(`/notifications/${notification.id}/read`);
            notification.isRead = true;
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }

        // 根據通知類型顯示貼文
        if (notification.type === 'like_post' || notification.type === 'comment_post') {
            emit('show-post', notification.postId);
        }

        showNotifications.value = false;
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};


// 標記全部已讀
const markAllAsRead = async () => {
    try {
        await axios.put('/notifications/mark-all-read');
        notifications.value.forEach(n => n.isRead = true);
        unreadCount.value = 0;
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
};

// 加載更多
const loadMore = () => {
    if (!loading.value && !noMoreData.value) {
        fetchNotifications(currentPage.value + 1);
    }
};

// 格式化時間
const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小時前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;

    return date.toLocaleDateString('zh-TW');
};

// 處理頭像載入錯誤
const handleAvatarError = (event) => {
    event.target.style.display = 'none';
    event.target.nextElementSibling.style.display = 'flex';
};

// 處理新通知
const handleNewNotification = (notification) => {
    notifications.value.unshift(notification);
    unreadCount.value++;

    // 如果瀏覽器支援通知且用戶已授權，顯示桌面通知
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.content);
    }
};

const connectWebSocket = async () => {
    try {
        if (!currentUser.value?.id) {
            console.warn('無法連接WebSocket：未找到用戶ID');
            return;
        }

        webSocketService = new WebSocketService();
        webSocketService.connect(currentUser.value.id, handleNewNotification);
    } catch (error) {
        console.error('WebSocket 連接失敗:', error);
    }
};


onMounted(async () => {
    try {
        // 先檢查登入狀態並獲取用戶信息
        const response = await axios.get('/check', { withCredentials: true });
        if (response.data?.isLoggedIn) {
            currentUser.value = response.data.user;
            await connectWebSocket();
            await fetchUnreadCount();
        }

        // 請求通知權限
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    } catch (error) {
        console.error('初始化失敗:', error);
    }
});

onUnmounted(() => {
    // 斷開 WebSocket 連接
    if (webSocketService) {
        webSocketService.disconnect();
    }
});
</script>

<style scoped>
.notification-container {
    position: relative;
}

.notification-badge {
    margin: 0;
}

.notification-btn {
    color: #838282 !important;
    transition: color 0.3s;
    background: none !important;
}

.notification-btn:hover {
    color: #ff961e !important;
}

.notification-panel {
    width: 275px;
    height: 80%;
    margin: 0;
    background-color: #2e2e2e !important;
    color: white;
    border-radius: 20px;
    overflow: hidden;
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background-color: #2e2e2e;
}

.mark-read-btn {
    color: #ff961e !important;
}

.notification-list {
    height: calc(100% - 120px);
    /* 減去標題和底部按鈕的高度 */
    max-height: none !important;
    overflow-y: auto;
    padding: 0 !important;
    background-color: #2e2e2e;
}

.notification-item {
    display: flex;
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-item:hover {
    background-color: rgba(255, 150, 30, 0.1);
}

.notification-item.unread {
    background-color: rgba(255, 150, 30, 0.05);
}

.notification-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 12px;
    background-color: #3e3e3e;
}

.notification-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.notification-content {
    flex: 1;
}

.notification-text {
    margin-bottom: 4px;
    line-height: 1.4;
    color: #ffffff;
}

.notification-time {
    font-size: 12px;
    color: #aaaaaa;
}

.no-notifications {
    padding: 24px;
    text-align: center;
    color: #aaaaaa;
}

.avatar-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3e3e3e;
    color: #ffffff;
    font-size: 20px;
    border: 1.5px solid #ffffff;
}

.load-more-btn {
    color: #aaaaaa !important;
    background-color: transparent !important;
}

.load-more-btn:hover {
    color: #ff961e !important;
}

:deep(.v-badge__badge) {
    background-color: #ff961e !important;
    color: white;
}

/* 捲軸樣式 */
.notification-list::-webkit-scrollbar {
    width: 8px;
}

.notification-list::-webkit-scrollbar-track {
    background: #1e1e1e;
}

.notification-list::-webkit-scrollbar-thumb {
    background: #ff961e;
    border-radius: 4px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
    background: #e88616;
}

:deep(.v-overlay__content) {
    position: fixed !important;
    top: 60px !important;
    /* 配合你的頂部導航高度 */
    left: 35px !important;
    /* 配合你的側邊欄寬度 */
    height: 330px !important;
}
</style>