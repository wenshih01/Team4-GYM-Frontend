<template>
  <div class="layout">
    <!-- 左側邊欄 -->
    <Sidebar
      :user="currentUser"
      :visible="isSidebarVisible"
      @show="showSidebar"
      @hide="hideSidebar"
    />

    <div class="main-content">
      <div class="container">
        <!-- 搜尋與過濾區域 -->
        <div class="search-section">
          <div class="button-group">
            <button @click="openPlanModal" class="plan-button">制定方案</button>
            <button @click="openLogModal" class="log-button">健身日誌</button>
            <button @click="openTrainingPlanModal" class="training-plan-button">
              訓練方案
            </button>
          </div>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="text"
            placeholder="搜尋動作..."
            class="search-bar"
          />
          <select
            v-model="selectedPart"
            @change="handleFilter"
            class="filter-select"
          >
            <option value="">全部部位</option>
            <option v-for="part in uniqueParts" :key="part" :value="part">
              {{ part }}
            </option>
          </select>
        </div>

        <!-- 動作卡片區域 -->
        <ActionCardList :actions="filteredActions" @select="openModal" />

        <!-- 詳細資料視窗 -->
        <ActionDetailModal
          v-if="selectedAction"
          :action="selectedAction"
          @close="closeModal"
        />
        <!-- 日曆 -->
        <LogModal
          :model-value="logCalendarVisible"
          @update:model-value="(val) => (logCalendarVisible = val)"
          :memberId="currentUserId"
        />

        <!-- 訓練方案視窗 -->
        <transition name="modal-fade">
          <TrainingPlanTable
            v-if="trainingPlanModalVisible"
            :visible="trainingPlanModalVisible"
            :items="trainingPlans"
            :headers="trainingPlanHeaders"
            @close="closeTrainingPlanModal"
            @edit="editPlan"
            @delete="deletePlan"
          />
        </transition>

        <!-- 制定方案視窗 -->
        <AddPlanModal
          v-if="planModalVisible"
          :visible="planModalVisible"
          :actions="actions"
          :memberId="currentUserId"
          @close="closePlanModal"
          @save="savePlan"
        />
        <!-- 編輯方案視窗 -->
        <EditPlanModal
          v-if="editModalVisible"
          :plan="selectedPlan"
          :actions="actions"
          :memberId="currentUserId"
          @close="closeEditModal"
          @save="saveEdit"
        />
      </div>
    </div>
  </div>
  <v-snackbar
    v-model="snackbar.visible"
    :timeout="snackbar.resolve ? -1 : 2000"
    :color="snackbar.color"
    location="bottom center"
  >
    {{ snackbar.message }}
    <template v-slot:actions v-if="snackbar.resolve">
      <v-btn color="white" variant="text" @click="handleSnackbarAction(false)"
        >取消</v-btn
      >
      <v-btn color="white" variant="text" @click="handleSnackbarAction(true)"
        >確定</v-btn
      >
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Sidebar from "./Workouts/Sidebar.vue";
import ActionCardList from "./Workouts/ActionCardList.vue";
import ActionDetailModal from "./Workouts/ActionDetailModal.vue";
import TrainingPlanTable from "./Workouts/TrainingPlanTable.vue";
import EditPlanModal from "./Workouts/EditPlanModal.vue";
import AddPlanModal from "./Workouts/AddPlanModal.vue";
import LogModal from "./Workouts/LogModal.vue"; // 導入新的 LogModal 組件

// 搜尋相關的狀態
const searchQuery = ref("");
const selectedPart = ref("");
const actions = ref([]);
const filteredActions = ref([]);
const uniqueParts = ref([]);

// 選擇動作的詳細視窗
const selectedAction = ref(null);

// 邊欄的狀態
const isSidebarVisible = ref(false);

// 方案相關的狀態
const planModalVisible = ref(false);

// 訓練方案的狀態
const trainingPlans = ref([]);
const trainingPlanModalVisible = ref(false);
const selectedPlan = ref(null);
const editModalVisible = ref(false);

// 表格的欄位標題
const trainingPlanHeaders = [
  { title: "方案名稱", value: "name" },
  { title: "方案描述", value: "description" },
  { title: "總計熱量", value: "totalCalories" },
  { title: "操作", value: "action" },
];

onMounted(() => {
  console.log("Headers:", trainingPlanHeaders);
  console.log("Plans:", trainingPlans);
});

// 動態用戶資訊
const currentUser = ref({ id: "", name: "" });

onMounted(async () => {
  try {
    const actionsResponse = await fetch("/api/actions/all");
    const actionsData = await actionsResponse.json();
    actions.value = actionsData.content;
    uniqueParts.value = [
      ...new Set(actions.value.map((action) => action.parts)),
    ];
    filteredActions.value = actions.value;

    const userResponse = await fetch("/api/profile", {
      credentials: "include",
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      currentUser.value.id = userData.id;
      currentUser.value.name = userData.username;
    } else {
      console.error("無法取得用戶資訊");
    }
  } catch (error) {
    console.error("初始化失敗：", error);
  }
});

const handleSearch = () => {
  const query = searchQuery.value.toLowerCase();
  filteredActions.value = actions.value.filter((action) =>
    action.name.toLowerCase().includes(query)
  );
};

const handleFilter = () => {
  const part = selectedPart.value;
  filteredActions.value = actions.value.filter(
    (action) => part === "" || action.parts === part
  );
};

const openModal = (action) => {
  selectedAction.value = action;
};

const closeModal = () => {
  selectedAction.value = null;
};

const openPlanModal = () => {
  planModalVisible.value = true;
};

const closePlanModal = () => {
  planModalVisible.value = false;
};

const savePlan = async (createdPlan) => {
  try {
    const payload = {
      name: createdPlan.name,
      description: createdPlan.description,
      memberId: currentUserId.value, // 確保有傳遞會員 ID
      planDetails: createdPlan.planDetails.map((detail) => ({
        actionId: detail.actionId,
        sets: detail.sets,
        reps: detail.reps,
      })),
    };

    const response = await axios.post("/api/plans", payload); // 發送請求到後端
    const savedPlan = response.data;

    // 更新本地數據
    trainingPlans.value.push(savedPlan);
    planModalVisible.value = false; // 關閉視窗

    showSnackbar("方案已成功新增！", "success");
  } catch (error) {
    console.error("新增方案失敗：", error);
    showSnackbar("新增方案失敗！", "error");
  }
};

const openTrainingPlanModal = async () => {
  try {
    const response = await axios.get(
      `/api/plans/member/${currentUser.value.id}`
    );
    trainingPlans.value = response.data || [];
    trainingPlanModalVisible.value = true;
  } catch (error) {
    console.error("無法載入訓練方案：", error);
  }
};

const closeTrainingPlanModal = () => {
  trainingPlanModalVisible.value = false;
};

const editPlan = async (plan) => {
  try {
    // 從後端獲取最新的方案數據
    const response = await axios.get(`/api/plans/${plan.id}`);
    const fetchedPlan = response.data;

    // 傳遞最新數據到子組件
    selectedPlan.value = {
      id: fetchedPlan.id,
      name: fetchedPlan.name,
      description: fetchedPlan.description,
      planDetails: fetchedPlan.planDetails.map((detail) => ({
        id: detail.id,
        actionId: detail.actionId, // 動作 ID
        sets: detail.sets, // 組數
        reps: detail.reps, // 每組次數
      })),
    };

    editModalVisible.value = true; // 打開編輯視窗
  } catch (error) {
    console.error("無法獲取方案數據：", error);
  }
};

const snackbar = ref({ visible: false, message: "", color: "", resolve: null });

const saveEdit = async (updatedPlan) => {
  try {
    const response = await axios.put(
      `/api/plans/${updatedPlan.id}`,
      updatedPlan
    );
    const updatedData = response.data; // 從後端獲取最新數據
    trainingPlans.value = trainingPlans.value.map((plan) =>
      plan.id === updatedData.id ? updatedData : plan
    );
    editModalVisible.value = false;
    showSnackbar("方案已成功更新！", "success");
  } catch (error) {
    console.error("更新方案失敗：", error);
    showSnackbar("更新失敗！", "error");
  }
};

const deletePlan = async (id) => {
  try {
    const confirmed = await showConfirmation("確認要刪除此方案嗎？");
    if (!confirmed) return;

    await axios.delete(`/api/plans/${id}`);
    trainingPlans.value = trainingPlans.value.filter((plan) => plan.id !== id);
    showSnackbar("方案已成功刪除！", "success");
  } catch (error) {
    console.error("刪除方案失敗：", error);
    showSnackbar("刪除失敗！", "error");
  }
};

// 顯示 snackbar
const showSnackbar = (message, color) => {
  snackbar.value.message = message;
  snackbar.value.color = color;
  snackbar.value.visible = true;
  snackbar.value.resolve = null; // 避免干擾
};

// 顯示確認對話框
const showConfirmation = (message) => {
  return new Promise((resolve) => {
    snackbar.value.message = message;
    snackbar.value.color = "orange";
    snackbar.value.visible = true;
    snackbar.value.resolve = resolve;
  });
};

// 處理 Snackbar 按鈕動作
const handleSnackbarAction = (isConfirmed) => {
  if (snackbar.value.resolve) {
    snackbar.value.resolve(isConfirmed);
  }
  snackbar.value.visible = false; // 關閉 Snackbar
};

const showSidebar = () => {
  isSidebarVisible.value = true;
};

const hideSidebar = () => {
  isSidebarVisible.value = false;
};

const closeEditModal = () => {
  editModalVisible.value = false; // 修正父組件邏輯，確保能正確關閉編輯方案視窗
};

const currentUserId = ref(null); // 用來儲存當前用戶 ID

onMounted(async () => {
  try {
    const userResponse = await fetch("/api/profile", {
      credentials: "include",
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      currentUserId.value = userData.id; // 儲存用戶 ID
    } else {
      console.error("無法取得用戶資訊");
    }
  } catch (error) {
    console.error("初始化失敗：", error);
  }
});

// 日曆顯示狀態
const logCalendarVisible = ref(false);

// 打開日曆
const openLogModal = () => {
  console.log("按鈕被點擊，顯示日曆");
  logCalendarVisible.value = true;
};
</script>

<style scoped>
body {
  background-color: #000;
  margin: 0;
  font-family: Arial, sans-serif;
}

.layout {
  display: flex;
  flex-direction: row;
}

.sidebar {
  width: 60px;
  height: calc(100vh - 50px);
  position: fixed;
  top: 50px;
  left: 0;
  background-color: #1e1e1e;
  color: #ffffff;
  transition: width 0.3s ease;
  overflow: hidden;
  z-index: 1000;
}

.sidebar:hover {
  width: 400px;
}

.main-content {
  flex: 1;
  padding: 20px;
  margin-left: 60px;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  margin-top: 60px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.plan-button,
.log-button,
.training-plan-button {
  background-color: #ff961e;
  color: #ffffff;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
}

.plan-button:hover,
.log-button:hover,
.training-plan-button:hover {
  background-color: #ffa540;
}

.search-bar {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  background-color: #1e1e1e;
  color: #ffffff;
  font-size: 16px;
}

.search-bar::placeholder {
  color: #aaaaaa;
}

.filter-select {
  padding: 10px;
  border-radius: 8px;
  border: none;
  background-color: #1e1e1e;
  color: #ffffff;
  font-size: 16px;
}

.v-snackbar {
  background-color: var(--v-theme-background, #1e1e1e);
  color: var(--v-theme-on-background, white);
}

.v-btn {
  color: white;
}

.v-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.v-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
}
.v-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}
.v-card-text {
  font-size: 16px;
  color: #333333;
}
.v-card-actions {
  justify-content: flex-end;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
