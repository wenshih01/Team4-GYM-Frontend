        <template>
            <div>
            <div class="top-bar">
                <v-text-field
                v-model="search"
                label="以會員名稱搜尋"
                append-icon="mdi-magnify"
                outlined
                clearable
                @keyup.enter="executeSearch"
                @click:append="executeSearch"
                ></v-text-field>
        
                <v-btn color="primary" @click="openNew">新增會員等級</v-btn>
            </div>
        
            <!-- DataTable -->
            <v-data-table
                :headers="headers"
                :items="userLevels"
                item-value="id"
                class="elevation-1 custom-table"
                dense
                fixed-header
                alternate-row
            >
                <template v-slot:[`item.actions`]="{ item }">
                <div class="actions-container">
                    <v-btn icon color="primary" size="small" class="btnEdit" @click="editUserLevel(item)">
                    <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="red" size="small" @click="deleteUserLevel(item.id)">
                    <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </div>
                </template>
            </v-data-table>
        
            <!-- Dialog -->
            <v-dialog v-model="detailDialog" max-width="600px">
                <v-card>
                <v-card-title>
                    {{ isEdit ? "編輯會員等級" : "新增會員等級" }}
                </v-card-title>
                <v-card-text>
                    <v-select
                    label="選擇會員"
                    :items="users"
                    item-title="name"
                    item-value="id"
                    v-model="userLevel.userId"
                    outlined
                    clearable
                    ></v-select>
        
                    <v-select
                    label="選擇會員等級"
                    :items="membershipLevels"
                    item-title="levelName"
                    item-value="levelId"
                    v-model="userLevel.levelId"
                    outlined
                    clearable
                    ></v-select>
        
                    
                </v-card-text>
                <v-card-actions>
                    <v-btn color="white" text @click="hideDialog">取消</v-btn>
                    <v-btn color="orange" text @click="saveUserLevel">儲存</v-btn>
                </v-card-actions>
                </v-card>
            </v-dialog>
            </div>
        </template>
        
        <script setup>
        import { ref, onMounted } from "vue";
        import axios from "axios";
        
        // 資料
        const userLevels = ref([]); // UserLevel 列表
        const users = ref([]); // 會員列表
        const membershipLevels = ref([]); // 會員等級列表
        
        const userLevel = ref({
            id: null,
            userId: null,
            levelId: null,
            points: 0,
        });
        
        const detailDialog = ref(false); // 控制 Dialog 開關
        const isEdit = ref(false); // 判斷是否為編輯模式
        const search = ref(""); // 搜尋欄的內容
        
        // 表格標題
        const headers = ref([
            { title: "會員名稱", value: "user.name" },
            { title: "會員等級", value: "membershipLevel.levelName" },
            { title: "當前點數", value: "points" },
            { title: "開始日期", value: "startDate" },
            { title: "到期日期", value: "expiryDate" },
            { title: "操作", value: "actions", sortable: false },
        ]);
        
        // 獲取所有 UserLevel 資料
        const fetchUserLevels = async () => {
            try {
            const response = await axios.get("http://localhost:8082/api/user-level/all");
            userLevels.value = response.data;
            } catch (error) {
            console.error("無法獲取會員等級資料：", error);
            }
        };
        
        // 獲取會員 & 會員等級資料
        const fetchDropdownData = async () => {
            try {
            const [userResponse, membershipResponse] = await Promise.all([
                axios.get("http://localhost:8082/api/user-level/users"),
                axios.get("http://localhost:8082/api/user-level/membership-levels"),
            ]);
            users.value = userResponse.data;
            membershipLevels.value = membershipResponse.data;
            } catch (error) {
            console.error("無法獲取會員或會員等級資料：", error);
            }
        };
        
        // 搜尋 UserLevel
        const executeSearch = async () => {
            try {
            const response = await axios.get("http://localhost:8082/api/user-level/all", {
                params: { keyword: search.value },
            });
            userLevels.value = response.data;
            } catch (error) {
            console.error("搜尋會員等級失敗：", error);
            }
        };
        
        // 打開新增會員等級對話框
        const openNew = () => {
            userLevel.value = {
            id: null,
            userId: null,
            levelId: null,
            points: 0,
            };
            isEdit.value = false;
            detailDialog.value = true;
        };
        
        // 編輯會員等級
        const editUserLevel = (selectedUserLevel) => {
            userLevel.value = {
            id: selectedUserLevel.id,
            userId: selectedUserLevel.user.id,
            levelId: selectedUserLevel.membershipLevel.levelId,
            points: selectedUserLevel.points,
            };
            isEdit.value = true;
            detailDialog.value = true;
        };
        
        // 關閉對話框
        const hideDialog = () => {
            detailDialog.value = false;
        };
        
        // 儲存會員等級（新增或編輯）
        const saveUserLevel = async () => {
            try {
            if (isEdit.value) {
                // 更新會員等級
                await axios.put(`http://localhost:8082/api/user-level/update`, null, {
                params: {
                    userId: userLevel.value.userId,
                    levelId: userLevel.value.levelId,
                },
                });
            } else {
                // 新增會員等級
                await axios.post(`http://localhost:8082/api/user-level/purchase`, null, {
                params: {
                    userId: userLevel.value.userId,
                    levelId: userLevel.value.levelId,
                },
                });
            }
            fetchUserLevels(); // 更新列表
            hideDialog();
            } catch (error) {
            console.error("儲存會員等級失敗：", error);
            }
        };
        
        // 刪除會員等級
        const deleteUserLevel = async (id) => {
            try {
            if (confirm("確定要刪除此會員等級嗎？")) {
                await axios.delete(`http://localhost:8082/api/user-level/delete/${id}`);
                fetchUserLevels(); // 刷新列表
            }
            } catch (error) {
            console.error("刪除會員等級失敗：", error);
            }
        };
        
        // 初始化時獲取資料
        onMounted(() => {
            fetchUserLevels();
            fetchDropdownData();
        });
        </script>
        
        <style scoped>
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
        
        .actions-container {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 0.5rem;
        }
        
        .v-dialog :deep(.v-card) {
          background-color: #2c2c2c !important;
          color: white !important;
        }
        
        .v-dialog :deep(.v-card-title) {
          color: rgb(245, 118, 34) !important;
          background-color: #3c3c3c !important;
        }
        
        .v-dialog :deep(.v-card-text) {
          color: #e0e0e0 !important;
        }
        
        .v-dialog :deep(.v-field__input) {
          color: white !important;
          background-color: #3c3c3c !important;
          resize: none;
        }
        
        .v-dialog :deep(.v-label) {
          color: #e0e0e0 !important;
        }
        
        .v-input--horizontal {
          margin-bottom: 15px;
          flex: 1;
          max-width: 400px;
          height: 50px;
        }
        
        
        </style>
        