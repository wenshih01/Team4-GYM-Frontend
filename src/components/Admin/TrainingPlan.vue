<template>
  <div>
    <div class="top-bar">
      <v-text-field v-model="search" label="以方案名稱搜尋" append-icon="mdi-magnify" outlined clearable
        @keyup.enter="executeSearch" @click:append="executeSearch"></v-text-field>

      <v-btn color="primary" @click="openNew">新增健身方案</v-btn>
    </div>

    <!-- DataTable -->
    <v-data-table :headers="headers" :items="plans" item-value="id" class="elevation-1 custom-table" dense fixed-header
      alternate-row>
      <!-- 點擊方案名稱的連結，會顯示方案細則 -->
      <template v-slot:[`item.name`]="{ item }">
        <a href="#" @click.prevent="viewPlanDetails(item)" class="plan-link">{{
          item.name
        }}</a>
      </template>
      <template v-slot:[`item.type`]="{ item }">
        <span>{{
          item.memberId === null ? "公版" : "會員ID: " + item.memberId
        }}</span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <div class="actions-container">
          <v-btn icon color="primary" size="small" class="btnEdit" @click="editPlan(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" size="small" @click="deletePlan(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Dialog for Plan Details -->
    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card>
        <v-card-title>{{ selectedPlan.name }}</v-card-title>
        <v-card-text>
          <p>
            <strong>會員ID:</strong>
            {{
              selectedPlan.memberId === null ? "公版" : selectedPlan.memberId
            }}
          </p>
          <p class="description">
            <strong>描述:</strong> {{ selectedPlan.description }}
          </p>
          <div v-for="detail in selectedPlan.planDetails" :key="detail.id" class="plan-detail-item">
            <p>
              動作: {{ getActionName(detail.actionId) }}， 組數:
              {{ detail.sets }}， 次數: {{ detail.reps }}
            </p>
          </div>
          <p>
            <strong>總熱量消耗:</strong> {{ selectedPlan.totalCalories }} 卡路里
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="white" text @click="detailsDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for Add/Edit Plan -->
    <v-dialog v-model="planDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ isEdit ? "編輯健身方案" : "新增健身方案" }}
        </v-card-title>
        <v-card-text>
          <v-text-field label="方案名稱" v-model="plan.name" outlined clearable required></v-text-field>
          <v-textarea label="方案描述" v-model="plan.description" outlined clearable
            style="max-height: 100px; overflow: auto"></v-textarea>

          <h3>方案細則</h3>
          <div v-for="(detail, index) in plan.planDetails" :key="index" class="plan-detail">
            <v-select label="動作" :items="actions" item-value="id" item-title="name" v-model="detail.actionId" outlined
              clearable required></v-select>
            <v-text-field label="組數" v-model.number="detail.sets" outlined clearable type="number" min="1"
              required></v-text-field>
            <v-text-field label="一組次數" v-model.number="detail.reps" outlined clearable type="number" min="1"
              required></v-text-field>
            <v-btn icon color="red" @click="removeDetail(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>

          <v-btn color="primary" text @click="addDetail">新增方案細則</v-btn>
        </v-card-text>
        <v-card-actions>
          <v-btn color="white" text @click="closeDialog">取消</v-btn>
          <v-btn color="orange" text @click="savePlan">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const plans = ref([]);
const plan = ref({
  id: null,
  name: "",
  description: "",
  isPublic: true,
  planDetails: [],
});
const selectedPlan = ref({});
const planDialog = ref(false);
const detailsDialog = ref(false);
const isEdit = ref(false);
const search = ref("");

const headers = ref([
  { title: "名稱", value: "name" },
  { title: "公版/會員ID", value: "type" },
  { title: "描述", value: "description" },
  { title: "總熱量消耗", value: "totalCalories" },
  { title: "操作", value: "actions", sortable: false },
]);

const actions = ref([]);

onMounted(async () => {
  try {
    const actionsResponse = await axios.get("/api/actions/all");
    actions.value = actionsResponse.data.content.map((action) => ({
      id: action.id,
      name: action.name,
    }));
    await fetchPlans();
  } catch (error) {
    console.error("初始化時發生錯誤：", error);
  }
});

const fetchPlans = async () => {
  try {
    const response = await axios.get("/api/plans", {
      params: {
        page: 0, // 頁碼
        size: 1000, // 每頁筆數設置一個大值
        name: search.value || "", // 支援模糊查詢
      },
    });
    plans.value = response.data.content || response.data; // 根據 API 回傳處理
  } catch (error) {
    console.error("無法獲取健身方案資料：", error);
  }
};

const executeSearch = async () => {
  try {
    const response = await axios.get("/api/plans/search", {
      params: { name: search.value },
    });
    plans.value = response.data.content;
  } catch (error) {
    console.error("搜尋健身方案失敗：", error);
  }
};

const openNew = () => {
  plan.value = {
    id: null,
    name: "",
    description: "",
    isPublic: true,
    planDetails: [],
  };
  isEdit.value = false;
  planDialog.value = true;
};

const viewPlanDetails = async (selectedPlanItem) => {
  try {
    const response = await axios.get(`/api/plans/${selectedPlanItem.id}`);
    selectedPlan.value = response.data;
    detailsDialog.value = true;
  } catch (error) {
    console.error("無法獲取方案細節：", error);
  }
};

const editPlan = async (selectedPlanItem) => {
  try {
    const response = await axios.get(`/api/plans/${selectedPlanItem.id}`);
    const fetchedPlan = response.data;
    plan.value = {
      id: fetchedPlan.id,
      name: fetchedPlan.name,
      description: fetchedPlan.description,
      isPublic: fetchedPlan.isPublic,
      planDetails: fetchedPlan.planDetails.map((detail) => ({
        id: detail.id,
        actionId: detail.actionId || null,
        sets: detail.sets,
        reps: detail.reps,
        calories: detail.calories,
      })),
    };
    isEdit.value = true;
    planDialog.value = true;
  } catch (error) {
    console.error("無法獲取方案細節：", error);
  }
};

const closeDialog = () => {
  planDialog.value = false;
};

const addDetail = () => {
  plan.value.planDetails.push({
    actionId: null,
    sets: 1,
    reps: 1,
  });
};

const removeDetail = (index) => {
  plan.value.planDetails.splice(index, 1);
};

const savePlan = async () => {
  try {
    if (isEdit.value) {
      await axios.put(`/api/plans/${plan.value.id}`, plan.value);
    } else {
      await axios.post("/api/plans", plan.value);
    }
    fetchPlans();
    closeDialog();
  } catch (error) {
    console.error("儲存方案失敗：", error);
  }
};

const deletePlan = async (id) => {
  try {
    if (confirm("確定要刪除此健身方案嗎？")) {
      await axios.delete(`/api/plans/${id}`);
      fetchPlans();
    }
  } catch (error) {
    console.error("刪除健身方案失敗：", error);
  }
};

const getActionName = (actionId) => {
  const action = actions.value.find((a) => a.id === actionId);
  return action ? action.name : "未知動作";
};
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

.btnEdit {
  padding: 4px;
  font-size: 12px;
}

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

.plan-link {
  color: black;
  text-decoration: none;
  font-weight: normal;
}

.plan-link:hover {
  text-decoration: none;
  color: #ef8030;
  font-weight: bold;
  cursor: pointer;
}

.description {
  margin-bottom: 2rem;
}

.actions-section {
  margin-bottom: 1rem;
}

.action-item {
  margin-bottom: 0.2rem;
}

.plan-detail-item {
  margin-bottom: 0.5rem;
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
