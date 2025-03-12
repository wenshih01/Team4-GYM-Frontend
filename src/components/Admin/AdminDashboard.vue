<template>
    <div class="dashboard">
        <!-- <h2 class="dashboard-title"></h2> -->

        <div class="stats-grid">
            <!-- 會員統計 -->
            <v-card class="stat-card">
                <v-card-title class="card-title">
                    <v-icon size="large" color="orange">mdi-account-group</v-icon>
                    會員統計
                </v-card-title>
                <v-card-text>
                    <div class="stat-number">2,450</div>
                    <div class="stat-label">總會員數</div>
                </v-card-text>
            </v-card>

            <!-- 訂單統計 -->
            <v-card class="stat-card">
                <v-card-title class="card-title">
                    <v-icon size="large" color="orange">mdi-shopping</v-icon>
                    訂單統計
                </v-card-title>
                <v-card-text>
                    <div class="stat-number">152</div>
                    <div class="stat-label">本月訂單</div>
                </v-card-text>
            </v-card>

            <v-card class="stat-card">
                <v-card-title class="card-title">
                    <v-icon size="large" color="orange">mdi-post</v-icon>
                    社群統計
                </v-card-title>
                <v-card-text>
                    <v-skeleton-loader v-if="loading" type="text" class="stat-number"></v-skeleton-loader>
                    <template v-else>
                        <div class="stat-number">{{ stats.totalPosts }}</div>
                        <div class="stat-label">貼文數量</div>
                    </template>
                </v-card-text>
            </v-card>
            <!-- 課程統計 -->
            <v-card class="stat-card">
                <v-card-title class="card-title">
                    <v-icon size="large" color="orange">mdi-dumbbell</v-icon>
                    課程統計
                </v-card-title>
                <v-card-text>
                    <div class="stat-number">48</div>
                    <div class="stat-label">活躍課程</div>
                </v-card-text>
            </v-card>
        </div>

        <!-- 最新活動 -->
        <v-card class="mt-6">
            <v-card-title class="card-title">
                <v-icon color="orange" class="mr-2">mdi-clock-outline</v-icon>
                最新動態
            </v-card-title>
            <v-card-text>
                <v-timeline density="compact" align="start">
                    <v-timeline-item v-for="(activity, i) in recentActivities" :key="i" :dot-color="activity.color"
                        size="small">
                        <div class="d-flex justify-space-between">
                            <div>
                                <strong>{{ activity.title }}</strong>
                                <div class="text-caption">{{ activity.description }}</div>
                            </div>
                            <div class="text-caption text-grey">{{ activity.time }}</div>
                        </div>
                    </v-timeline-item>
                </v-timeline>
            </v-card-text>
        </v-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
const loading = ref(true);
const stats = ref({
    totalPosts: 0,
    totalMembers: 2450, // 暫時保留靜態數據
    monthlyOrders: 152,
    activeCourses: 48
});

const recentActivities = ref([
    {
        title: '新會員註冊',
        description: '王小明完成註冊流程',
        time: '10 分鐘前',
        color: 'green'
    },
    {
        title: '新訂單',
        description: '收到新的健身器材訂單 #12345',
        time: '30 分鐘前',
        color: 'orange'
    },
    {
        title: '課程預約',
        description: '私人教練課程預約 - 李教練',
        time: '1 小時前',
        color: 'blue'
    },
    {
        title: '社群互動',
        description: '新貼文獲得 50+ 讚',
        time: '2 小時前',
        color: 'purple'
    }
]);

const fetchStats = async () => {
    loading.value = true;
    try {
        const postsResponse = await axios.get('http://localhost:8082/api/posts');
        if (Array.isArray(postsResponse.data)) {
            stats.value.totalPosts = postsResponse.data.length;
        } else if (postsResponse.data && postsResponse.data.content) {
            stats.value.totalPosts = postsResponse.data.content.length;
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
        stats.value.totalPosts = 0;
    } finally {
        loading.value = false;
    }
};

// 在組件掛載時獲取數據
onMounted(() => {
    fetchStats();
});
</script>

<style scoped>
.dashboard {
    padding: 20px;
}

.dashboard-title {
    color: #e17d19;
    margin-bottom: 24px;
    font-size: 1.8rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
}

.stat-card {
    background-color: #2c2c2c !important;
    border-radius: 10px;
}

.card-title {
    color: #ffffff !important;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem;
}

.stat-number {
    color: #ef8030;
    font-size: 2rem;
    font-weight: bold;
    margin: 10px 0;
}

.stat-label {
    color: #ffffff;
    font-size: 0.9rem;
    opacity: 0.8;
}

:deep(.v-timeline-item__body) {
    color: #ffffff !important;
}

:deep(.v-card-text) {
    color: #e0e0e0 !important;
}

.mt-6 {
    background-color: #2c2c2c;
    border-radius: 10px;
}
</style>