<template>
    <div class="user-container">
        <div class="top-bar">
            <div class="left-actions">
                <!-- 搜尋使用者 -->
                <v-text-field v-model="search" label="以名稱搜尋" append-icon="mdi-magnify" outlined clearable
                    @keyup.enter="executeSearch" @click:append="executeSearch" style="width: 300px"></v-text-field>
            </div>
            <!-- 新增使用者按鈕 -->
            <v-btn color="primary" @click="openNew" class="add-user-btn">
                新增使用者
            </v-btn>
        </div>

        <!-- 使用者列表 -->
        <v-data-table :headers="headers" :items="filteredUsers" item-value="id" class="elevation-1 custom-table" dense
            fixed-header alternate-row>
            <!-- 操作按鈕 -->
            <template v-slot:[`item.actions`]="{ item }">
                <div class="actions-container">
                    <!-- 編輯使用者 -->
                    <v-btn icon color="primary" size="small" @click.stop="editUser(item)">
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>

                    <!-- 刪除使用者 -->
                    <v-btn icon color="red" size="small" @click.stop="deleteUser(item.id)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </div>
            </template>

            <!-- 使用者名稱顯示並點擊查看詳細資訊 -->
            <template v-slot:[`item.name`]="{ item }">
                <span class="link" @click="showDetails(item)">
                    {{ item.name }}
                </span>
            </template>
        </v-data-table>

        <!-- 新增/編輯使用者對話框 -->
        <v-dialog v-model="userDialog" max-width="600px">
            <v-card class="black-background">
                <v-card-title class="orange-text">
                    <span>{{ isEditMode ? '編輯使用者' : '新增使用者' }}</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="user.username" label="使用者名稱" outlined></v-text-field>
                    <v-text-field v-model="user.password" label="密碼" outlined></v-text-field>
                    <v-text-field v-model="user.name" label="姓名" outlined></v-text-field>
                    <v-text-field v-model="user.email" label="電子郵件" outlined></v-text-field>
                    <v-text-field v-model="user.phone" label="電話" outlined></v-text-field>
                    <v-text-field v-model="user.address" label="地址" outlined></v-text-field>
                    <v-select v-model="user.gender" :items="['男', '女', '其他']" label="性別" outlined></v-select>
                    <v-text-field v-model="user.height" label="身高 (cm)" type="number" outlined></v-text-field>
                    <v-text-field v-model="user.weight" label="體重 (kg)" type="number" outlined></v-text-field>
                    <v-text-field v-model="user.birthday" label="生日" type="date" outlined></v-text-field>
                    <v-file-input v-model="user.avatar" label="上傳圖片" accept="image/*" outlined></v-file-input>

                </v-card-text>
                <v-card-actions>
                    <v-btn text color="red" @click="closeDialog">取消</v-btn>
                    <v-btn text color="green" @click="saveUser">儲存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 使用者詳細資訊對話框 -->
        <v-dialog v-model="detailsDialog" max-width="600px">
            <v-card class="black-background">
                <v-card-title class="orange-text text-center">
                    <span>使用者詳細資訊</span>
                </v-card-title>
                <v-card-text>
                    <!-- 使用者頭像 -->
                    <div v-if="selectedUser.avatar" class="user-image-container">
                        <img :src="selectedUser.avatar.startsWith('http')
                            ? selectedUser.avatar
                            : `${axios.defaults.baseURL}${selectedUser.avatar}`" alt="使用者頭像" class="user-image" />
                    </div>
                    <div class="user-info-grid">
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-account</v-icon>
                            <span><strong>會員ID：</strong> {{ selectedUser.id }}</span>
                        </div>
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-card-account-details</v-icon>
                            <span><strong>帳號：</strong> {{ selectedUser.username }}</span>
                        </div>
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-email</v-icon>
                            <span><strong>電子郵件：</strong> {{ selectedUser.email }}</span>
                        </div>
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-phone</v-icon>
                            <span><strong>電話：</strong> {{ selectedUser.phone }}</span>
                        </div>
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-home</v-icon>
                            <span><strong>地址：</strong> {{ selectedUser.address || "未提供" }}</span>
                        </div>
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-gender-male-female</v-icon>
                            <span><strong>性別：</strong> {{ selectedUser.gender }}</span>
                        </div>
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-human-male-height</v-icon>
                            <span><strong>身高：</strong> {{ selectedUser.height }} cm</span>
                        </div>
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-weight</v-icon>
                            <span><strong>體重：</strong> {{ selectedUser.weight }} kg</span>
                        </div>
                        <div class="user-info-item">
                            <v-icon class="orange-icon">mdi-calendar</v-icon>
                            <span><strong>生日：</strong> {{ selectedUser.birthday }}</span>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions class="dialog-actions">
                    <v-btn color="red" @click="closeDetails">關閉</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>


<script>
import { ref, computed } from 'vue';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8082'; // 後端 API 基本路徑

export default {
    setup() {
        const users = ref([]);
        const search = ref('');
        const userDialog = ref(false);
        const isEditMode = ref(false);
        const user = ref({
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


        const headers = ref([
            { title: '會員ID', value: 'id' },
            { title: '帳號', value: 'username' },
            { title: '姓名', value: 'name' },
            { title: '電子郵件', value: 'email' },
            { title: '性別', value: 'gender' },
            { title: '身高', value: 'height' },
            { title: '體重', value: 'weight' },
            { title: '生日', value: 'birthday' },
            { title: '操作', value: 'actions', sortable: false }
        ]);


        const filteredUsers = computed(() => {
            if (!search.value.trim()) {
                return users.value; // 如果沒有輸入搜尋條件，顯示全部使用者
            }
            return users.value.filter((user) =>
                user.name.toLowerCase().includes(search.value.toLowerCase())
            );
        });

        const getImageUrl = (url) => {
            if (!url) return '';
            return url.startsWith('http') ? url : `${axios.defaults.baseURL}${url}`;
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users/list');
                users.value = response.data.map((user) => ({
                    ...user,
                    avatar: user.avatar
                        ? user.avatar.startsWith('http')
                            ? user.avatar
                            : `${axios.defaults.baseURL}${user.avatar}`
                        : ''
                }));
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const executeSearch = async () => {
            try {
                const response = await axios.get('/api/users/search', { params: { name: search.value } });
                users.value = response.data;
            } catch (error) {
                console.error('Error searching users:', error);
            }
        };

        const deleteUser = async (userId) => {
            try {
                await axios.delete(`/api/users/delete/${userId}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        };

        const viewDetails = (user) => {
            selectedUser.value = {
                ...user,
                avatar: user.avatar
                    ? user.avatar.startsWith('http')
                        ? user.avatar  // 如果是完整網址就直接使用
                        : `${axios.defaults.baseURL}${user.avatar}`  // 如果是相對路徑就加上基礎URL
                    : ''
            };
            detailsDialog.value = true;
        };


        const editUser = (item) => {
            user.value = { ...item };
            isEditMode.value = true;
            userDialog.value = true;
        };

        const openNew = () => {
            user.value = {};
            isEditMode.value = false;
            userDialog.value = true;
        };

        const closeDialog = () => {
            userDialog.value = false;
        };

        const detailsDialog = ref(false);
        const selectedUser = ref({
            name: '',
            email: '',
            phone: '',
            address: '',
            gender: '',
            avatar: '',
        });

        const showDetails = (item) => {
            console.log("點擊的使用者資料:", item);
            console.log("使用者圖片路徑:", item.avatar);
            selectedUser.value = { ...item };
            detailsDialog.value = true;
        };

        const closeDetails = () => {
            detailsDialog.value = false;
        };

        const saveUser = async () => {
            try {
                const formData = new FormData();

                // 添加基本資料
                Object.keys(user.value).forEach(key => {
                    if (key !== 'avatar') {  // 排除 avatar 欄位
                        formData.append(key, user.value[key]);
                    }
                });

                // 特別處理圖片
                if (user.value.avatar instanceof File) {
                    formData.append('image', user.value.avatar);
                    console.log('正在上傳圖片:', user.value.avatar.name);
                }

                console.log('FormData 內容:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}: ${value}`);
                }

                const response = await axios.post('/api/users/save', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('儲存成功:', response.data);
                await fetchUsers();
                closeDialog();

            } catch (error) {
                console.error('儲存失敗:', error);
            }
        };


        fetchUsers();

        return {
            users,
            search,
            userDialog,
            isEditMode,
            user,
            headers,
            executeSearch,
            fetchUsers,
            deleteUser,
            editUser,
            openNew,
            closeDialog,
            saveUser,
            detailsDialog,
            selectedUser,
            showDetails,
            closeDetails,
            viewDetails,
            filteredUsers,
            getImageUrl,
        };
    },
};

</script>




<style scoped>
/* 🟠 黑 + 橘 色調 */
.elevation-1 {
    margin-bottom: 1rem;
}

.custom-table {
    border-radius: 10px;
    overflow: hidden;
    background-color: #f5e2c6;
}

.custom-table :deep(thead tr th) {
    background-color: #ef8030 !important;
    color: #333 !important;
    font-weight: bold;
    text-align: center;
}

.custom-table :deep(tbody tr:hover) {
    background-color: #f4c682 !important;
    cursor: pointer;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
    max-width: 1000px;
    margin-left: auto;
}

.btnEdit,
.btnDelete {
    padding: 4px;
    font-size: 12px;
}

.actions-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
}

/* 🟠 Dialog 樣式 */
.v-dialog :deep(.v-card) {
    background-color: #2c2c2c !important;
    color: white !important;
    border-radius: 10px;
}

.v-dialog :deep(.v-card-title) {
    color: rgb(245, 118, 34) !important;
    background-color: #3c3c3c !important;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
}

/* 使用者資訊區塊 - 統一設計 */
.user-info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 10px;
}

.user-info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 6px;
    background-color: rgba(255, 152, 0, 0.15);
    transition: all 0.3s ease-in-out;
}

.user-info-item:hover {
    background-color: rgba(255, 152, 0, 0.3);
}

/* 圖標樣式 */
.orange-icon {
    color: #ef8030 !important;
    font-size: 22px;
}

/* 🔶 會員頭像區塊 */
.user-image-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.user-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0px 4px 10px rgba(255, 152, 0, 0.5);
    border: 3px solid #ef8030;
}

/* 🔶 按鈕區塊 */
.dialog-actions {
    display: flex;
    justify-content: center;
    padding-top: 10px;
}

/* 調整關閉按鈕 */
.v-btn {
    font-weight: bold;
    border-radius: 6px;
    padding: 8px 20px;
    transition: all 0.3s ease-in-out;
}

.v-btn[color="red"]:hover {
    background-color: #b71c1c !important;
}
</style>
