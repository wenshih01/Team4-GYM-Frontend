<template>
    <v-container class="h-100">
        <v-row class="h-100">
            <!-- 左側會員資訊 -->
            <v-col cols="3">
                <v-card class="pa-3 h-100">
                    <v-list v-if="user">
                        <!-- 會員頭像 -->
                        <v-list-item class="text-center">
                            <v-avatar size="80">
                                <!-- <img src="https://via.placeholder.com/80" alt="使用者頭像"> -->
                                <v-img v-if="user.avatar" :src="user.avatar" cover alt="會員頭像" />
                            </v-avatar>
                        </v-list-item>

                        <!-- 會員名稱與狀態 -->
                        <v-list-item class="text-center">
                            <v-list-item-title class="text-h5 font-weight-bold">
                                {{ user.name || "未提供" }}
                            </v-list-item-title>
                            <v-list-item-subtitle>會員自 2019/01/21 起</v-list-item-subtitle>

                            <!-- 依據 membershipLevel 顯示不同的圖片 -->
                            <v-img v-if="user.membershipLevel" :src="getMembershipImage(user.membershipLevel)"
                                height="100" contain class="mt-2"></v-img>

                            <!-- 顯示會員等級 -->
                            <v-chip color="green" class="mt-2">
                                會員等級：{{ formatMembershipLevel(user.membershipLevel) }}
                            </v-chip>
                        </v-list-item>


                        <v-divider></v-divider>

                        <!-- Check-in Code -->
                        <!-- <v-list-item class="text-center">
                            <v-list-item-title class="text-h4 font-weight-bold">1234</v-list-item-title>
                            <v-list-item-subtitle>簽到碼</v-list-item-subtitle>
                        </v-list-item> -->

                        <!-- 操作按鈕 -->
                        <!-- <v-list-item class="d-flex justify-center">
                            <v-btn color="primary" icon>
                                <v-icon>mdi-share</v-icon>
                            </v-btn>
                            <v-btn color="primary" icon>
                                <v-icon>mdi-phone</v-icon>
                            </v-btn>
                            <v-btn color="primary" icon>
                                <v-icon>mdi-email</v-icon>
                            </v-btn>
                        </v-list-item>

                        <v-divider></v-divider> -->

                        <!-- 個人資訊 -->
                        <v-list-item>
                            <v-row class="align-center">
                                <v-col cols="auto">
                                    <v-list-item-title class="font-weight-bold">個人資訊</v-list-item-title>
                                </v-col>
                                <v-col cols="auto">
                                    <v-card-actions>
                                        <v-btn class="edit-btn" @click="openEditDialog">
                                            <v-icon size="large" color="orange">mdi-account-edit</v-icon>
                                            編輯資料</v-btn>
                                    </v-card-actions>
                                </v-col>
                            </v-row>
                        </v-list-item>

                        <v-list-item class="mb-4">
                            <v-list-item-subtitle>🎂 生日：{{ user.birthday || "未提供" }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item class="mb-4">
                            <v-list-item-subtitle>📞 電話號碼：{{ user.phone || "未提供" }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item class="mb-4">
                            <v-list-item-subtitle>📧 電子郵件：{{ user.email }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item class="mb-4">
                            <v-list-item-subtitle>🏠 地址：{{ user.address || "未提供" }}</v-list-item-subtitle>
                        </v-list-item>

                        <v-divider></v-divider>

                        <!-- 帳單資訊 -->
                        <v-list-item>
                            <v-list-item-title class="font-weight-bold">付款方式</v-list-item-title>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-subtitle>💳 信用卡 - Visa **** 1234</v-list-item-subtitle>
                            <v-chip small color="blue white--text">預設</v-chip>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>


            <!-- 右側主要內容 -->
            <v-col cols="9">
                <v-main>
                    <v-row>
                        <v-col cols="12">
                            <h2 class="text-2xl mb-3"><v-icon size="large" color="orange">mdi-run-fast</v-icon>出席狀況</h2>
                            <v-card>
                                <v-card-text>
                                    <!-- 圖表區 -->
                                    <AttendanceChart />
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12">
                            <h2 class="text-2xl mb-3"><v-icon size="large"
                                    color="orange">mdi-account-credit-card</v-icon> 會員方案</h2>
                            <v-card>
                                <v-list>
                                    <v-list-item>
                                        <!-- 第一行：方案名稱 -->
                                        <v-row>
                                            <v-col cols="3">
                                                <v-list-item-title>BJJ Adults Unlimited</v-list-item-title>
                                            </v-col>
                                        </v-row>

                                        <!-- 第二行：會員等級 & 會員到期時間 -->
                                        <v-row class="align-center">
                                            <v-col cols="2">
                                                <v-list-item-subtitle>會員等級:
                                                    <strong>無敵</strong></v-list-item-subtitle>
                                            </v-col>
                                            <v-col cols="3">
                                                <v-list-item-subtitle>會員到期時間: 02/12/2020 <span
                                                        class="change-text">(Change)</span></v-list-item-subtitle>
                                            </v-col>
                                            <v-col cols="1" class="text-right button">
                                                <v-btn color="red" text>取消會員</v-btn>
                                            </v-col>
                                        </v-row>

                                        <!-- 第三行：開始時間 & 付款金額 & 按鈕 -->
                                        <v-row>
                                            <v-col cols="2">
                                                <v-list-item-subtitle>開始時間: 01/12/2019</v-list-item-subtitle>
                                            </v-col>
                                            <v-col cols="3">
                                                <v-list-item-subtitle>付款金額: <strong>$139.00/month</strong> <span
                                                        class="change-text">(Change)</span></v-list-item-subtitle>
                                            </v-col>
                                        </v-row>
                                    </v-list-item>
                                    <!-- <v-divider></v-divider> -->
                                </v-list>
                            </v-card>

                        </v-col>

                        <v-col cols="12">
                            <h2 class="text-2xl mb-3">
                                <v-icon size="large" color="orange">mdi-currency-usd</v-icon>定期付款
                            </h2>
                            <v-card>
                                <v-list>
                                    <!-- 方案名稱 -->
                                    <v-list-item>
                                        <v-list-item-title>一般方案</v-list-item-title>
                                    </v-list-item>

                                    <!-- 方案詳情（兩行排版） -->
                                    <v-list-item>
                                        <v-row>
                                            <!-- 第一行：持續時間 & 下次付款時間 -->
                                            <v-col cols="3">
                                                <v-list-item-subtitle>持續時間：Every 1 months(s)</v-list-item-subtitle>
                                            </v-col>
                                            <v-col cols="3">
                                                <v-list-item-subtitle>下次付款時間: 01/12/2019</v-list-item-subtitle>
                                            </v-col>
                                        </v-row>

                                        <v-row>
                                            <!-- 第二行：開始時間 & 付款金額 -->
                                            <v-col cols="3">
                                                <v-list-item-subtitle>開始時間: 01/01/2019</v-list-item-subtitle>
                                            </v-col>
                                            <v-col cols="3">
                                                <v-list-item-subtitle>付款金額: $39.99/月</v-list-item-subtitle>
                                            </v-col>
                                        </v-row>
                                    </v-list-item>
                                </v-list>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-main>
            </v-col>
        </v-row>

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
                    <v-select v-model="userEdit.gender" :items="['男', '女', '其他']" label="性別" outlined></v-select>
                    <v-text-field v-model="userEdit.height" label="身高 (cm)" type="number" outlined></v-text-field>
                    <v-text-field v-model="userEdit.weight" label="體重 (kg)" type="number" outlined></v-text-field>
                    <v-text-field v-model="userEdit.birthday" label="生日" type="date" outlined></v-text-field>
                    <v-file-input v-model="userEdit.avatar" label="上傳圖片" accept="image/*" outlined></v-file-input>
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
import AttendanceChart from "./components/VueApexCharts.vue"
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8082'; // 後端 API 基本路徑

export default {
    name: "Member",
    components: {
        AttendanceChart  // ✅ 註冊組件
    },
    setup() {
        const user = ref(null);
        const userEdit = ref({
            username: '',     // 帳號
            password: '',
            name: '',         // 姓名
            email: '',        // 電子郵件
            phone: '',        // 電話
            address: '',      // 地址
            gender: '',       // 性別
            height: null,     // 身高
            weight: null,     // 體重
            birthday: '',     // 生日
            avatar: null,     // 頭像
        });
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
                    if (key === 'avatar' && userEdit.value[key]) {
                        formData.append('avatar', userEdit.value[key]);
                    } else {
                        console.log("append", userEdit.value[key]);
                        formData.append(key, userEdit.value[key]);
                    }
                }
                // await apiClient.put('/api/users/update', formData, {
                //     headers: { 'Content-Type': 'multipart/form-data' },
                // });

                console.log("📤 提交的 FormData:", [...formData.entries()]);
                await axios.put('/api/users/updateNp', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                await getProfile();
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


        // 取得對應的會員等級圖片
        const getMembershipImage = (level) => {
            switch (level) {
                case 'basic':
                    return '/images/A silver crown.jpg';
                case 'standard':
                    return '/images/A gold crown.jpg';
                case 'premium':
                    return '/images/A diamond crown.jpg';
                default:
                    return ''; // 預設不顯示圖片
            }
        };

        // 格式化會員等級顯示文字
        const formatMembershipLevel = (level) => {
            switch (level) {
                case 'basic':
                    return 'Basic 會員';
                case 'standard':
                    return 'Standard 會員';
                case 'premium':
                    return 'Premium 會員';
                default:
                    return '未設定';
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
            getMembershipImage,
            formatMembershipLevel,
        };

    },
};
</script>


<style scoped>
h2 {
    color: white;
}

.v-card {
    color: white;
    background-color: #2c2c2c;
    border-radius: 10px;

    .v-list {
        padding: 20px 0;
        color: white;
        background-color: #2c2c2c;
    }
}

.button {
    padding: 0;
}
</style>
