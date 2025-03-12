<template>
    <div class="dashboard">
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

            <!-- 社群統計 -->
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

        <!-- 我的會員資料（取代「最新動態」） -->
        <v-card class="mt-6">
            <v-card-title class="card-title">
                <v-icon color="orange" class="mr-2">mdi-account</v-icon>
                我的會員資料
            </v-card-title>
            <v-card-text v-if="user">
                <div class="stat-item"><strong>會員ID：</strong> {{ user.id }}</div>
                <div class="stat-item"><strong>帳號：</strong> {{ user.username }}</div>
                <div class="stat-item"><strong>姓名：</strong> {{ user.name || "未提供" }}</div>
                <div class="stat-item"><strong>電子郵件：</strong> {{ user.email }}</div>
                <div class="stat-item"><strong>電話：</strong> {{ user.phone || "未提供" }}</div>
                <div class="stat-item"><strong>地址：</strong> {{ user.address || "未提供" }}</div>
                <div class="stat-item"><strong>性別：</strong> {{ user.gender || "未提供" }}</div>
                <div class="stat-item"><strong>身高：</strong> {{ user.height ? user.height + " cm" : "未提供" }}</div>
                <div class="stat-item"><strong>體重：</strong> {{ user.weight ? user.weight + " kg" : "未提供" }}</div>
                <div class="stat-item"><strong>生日：</strong> {{ user.birthday || "未提供" }}</div>
            </v-card-text>
            <v-card-text v-else>
                <v-skeleton-loader type="paragraph"></v-skeleton-loader>
            </v-card-text>
        </v-card>
    </div>
</template>


---

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const user = ref(null);
const loading = ref(true);
const stats = ref({
    totalPosts: 0,
    totalMembers: 2450, // 暫時保留靜態數據
    monthlyOrders: 152,
    activeCourses: 48
});
// **使用與 `Member.vue` 相同的方式獲取會員資料**
const getProfile = async () => {
    
        console.log("🔍 嘗試從 /profile 取得 Session 內的用戶 ID...");
        const sessionResponse = await axios.get("/api/profile", { withCredentials: true });
        
        if (!sessionResponse.data || !sessionResponse.data.id) {
            throw new Error("❌ 未找到 Session ID");
        }

        const userId = sessionResponse.data.id;
        console.log("✅ 獲取到 userId:", userId);

        console.log(`🔍 使用 userId ${userId} 來查詢會員資料...`);
        const response = await axios.get(`/api/users/${userId}`, { withCredentials: true });

        console.log("✅ 會員資料:", response.data);
        user.value = response.data;
    
};

onMounted(() => {
    getProfile();
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