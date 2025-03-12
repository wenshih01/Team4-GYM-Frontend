<template>
    <v-container class="member-container">
        <v-card class="member-card" max-width="800">
            <v-card-title class="text-h5 title">會員中心</v-card-title>
            <v-card-text>
                <div v-if="user">
                    <v-avatar size="100" class="avatar">
                        <img v-if="user.imageUrl" :src="user.imageUrl" alt="會員頭像" />
                        <v-icon v-else class="icon">mdi-account</v-icon>
                    </v-avatar>
                    <p><strong>會員ID：</strong> {{ user.id }}</p>
                    <p><strong>帳號：</strong> {{ user.username }}</p>
                    <p><strong>姓名：</strong> {{ user.name || "未提供" }}</p>
                    <p><strong>電子郵件：</strong> {{ user.email }}</p>
                    <p><strong>電話：</strong> {{ user.phone || "未提供" }}</p>
                    <p><strong>地址：</strong> {{ user.address || "未提供" }}</p>
                    <p><strong>性別：</strong> {{ user.gender || "未提供" }}</p>
                    <p><strong>身高：</strong> {{ user.height ? user.height + " cm" : "未提供" }}</p>
                    <p><strong>體重：</strong> {{ user.weight ? user.weight + " kg" : "未提供" }}</p>
                    <p><strong>生日：</strong> {{ user.birthday || "未提供" }}</p>
                </div>
                <v-alert v-else type="error" class="error-alert">
                    無法獲取會員資料，請重新登入。
                </v-alert>
            </v-card-text>
            <v-card-actions>
                <v-btn class="edit-btn" @click="openEditDialog">編輯資料</v-btn>
                <v-btn class="logout-btn" @click="logout">登出</v-btn>
            </v-card-actions>
        </v-card>

        <!-- 編輯會員資料的對話框 -->
        <v-dialog v-model="editDialog" max-width="600px">
            <v-card class="black-background">
                <v-card-title class="orange-text">
                    <span>編輯會員資料</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="userEdit.username" label="帳號" outlined></v-text-field>
                    <v-text-field v-model="userEdit.name" label="姓名" outlined></v-text-field>
                    <v-text-field v-model="userEdit.email" label="電子郵件" outlined></v-text-field>
                    <v-text-field v-model="userEdit.phone" label="電話" outlined></v-text-field>
                    <v-text-field v-model="userEdit.address" label="地址" outlined></v-text-field>
                    <v-select
                        v-model="userEdit.gender"
                        :items="['男', '女', '其他']"
                        label="性別"
                        outlined
                    ></v-select>
                    <v-text-field v-model="userEdit.height" label="身高 (cm)" type="number" outlined></v-text-field>
                    <v-text-field v-model="userEdit.weight" label="體重 (kg)" type="number" outlined></v-text-field>
                    <v-text-field v-model="userEdit.birthday" label="生日" type="date" outlined></v-text-field>
                    <v-file-input v-model="userEdit.image" label="上傳圖片" accept="image/*" outlined></v-file-input>
                </v-card-text>
                <v-card-actions>
                    <v-btn text color="red" @click="closeEditDialog">取消</v-btn>
                    <v-btn text color="green" @click="saveUserEdit">儲存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import apiClient from "../../api/apiClient";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

export default {
    name: "Member",
    setup() {
        const user = ref(null);
        const userEdit = ref({});
        const router = useRouter();
        const editDialog = ref(false);

        const getProfile = async () => {
            try {
                const sessionResponse = await apiClient.get("/profile", { withCredentials: true });
                if (!sessionResponse.data || !sessionResponse.data.id) {
                    throw new Error("未找到 Session ID");
                }

                const userId = sessionResponse.data.id;
                const response = await apiClient.get(`/users/${userId}`, { withCredentials: true });
                user.value = response.data;
            } catch (error) {
                console.error("取得會員資料失敗，跳轉登入頁", error);
                router.push("/login");
            }
        };

        const openEditDialog = () => {
            userEdit.value = { ...user.value };
            editDialog.value = true;
        };

        const closeEditDialog = () => {
            editDialog.value = false;
        };

        const saveUserEdit = async () => {
            try {
                const formData = new FormData();
                for (const key in userEdit.value) {
                    if (key === 'image' && userEdit.value[key]) {
                        formData.append('image_url', userEdit.value[key]);
                    } else {
                        formData.append(key, userEdit.value[key]);
                    }
                }

                await apiClient.put('/api/users/update', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                user.value = { ...userEdit.value };
                closeEditDialog();
            } catch (error) {
                console.error('更新會員資料失敗:', error);
            }
        };

        const logout = async () => {
            try {
                await apiClient.post("/logout", {}, { withCredentials: true });
                router.push("/login");
            } catch (error) {
                console.error("登出失敗:", error);
            }
        };

        onMounted(() => {
            getProfile();
        });

        return {
            user,
            userEdit,
            editDialog,
            openEditDialog,
            closeEditDialog,
            saveUserEdit,
            logout,
        };
    },
};
</script>


<style scoped>
/* 設定整體背景為黑色 */
.v-container {
    background-color: #121212;
    min-height: 100vh;
    display: flex;
    justify-content: flex-start; /* 讓卡片靠左 */
    align-items: center; /* 垂直置中 */
    padding: 20px;
    padding-left: 50px; /* 增加左邊距，避免太貼邊 */
}

/* 卡片設計 */
.v-card {
    background-color: #1E1E1E !important;
    color: white !important;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(255, 152, 0, 0.3);
    width: 400px; /* 限制卡片寬度 */
}

/* 標題樣式 */
.v-card-title {
    color: #FF9800;
    font-weight: bold;
    text-align: center;
}

/* 會員資訊文字 */
.v-card-text p {
    font-size: 16px;
    margin: 5px 0;
}

/* 會員頭像樣式 */
.v-avatar {
    display: block;
    margin: 0 auto 15px;
    border: 3px solid #FF9800;
}

/* 頭像內的 icon */
.v-avatar .v-icon {
    font-size: 80px;
    color: white;
}

/* 錯誤訊息 */
.v-alert {
    background-color: rgba(211, 47, 47, 0.8) !important;
    color: white !important;
    text-align: center;
}

/* 按鈕設計 */
.v-btn {
    flex: 1;
    font-weight: bold;
}

.v-btn[color="primary"] {
    background-color: #FF9800 !important;
    color: black !important;
}

.v-btn[color="red"] {
    background-color: #D32F2F !important;
    color: white !important;
}

.edit-btn {
    background-color: #FF9800 !important;
    color: black !important;
    font-weight: bold;
    padding: 10px 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.edit-btn:hover {
    background-color: #e68900 !important;
}

/* 登出按鈕（紅色） */
.logout-btn {
    background-color: #D32F2F !important;
    color: white !important;
    font-weight: bold;
    padding: 10px 20px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.logout-btn:hover {
    background-color: #b71c1c !important;
}
</style>
