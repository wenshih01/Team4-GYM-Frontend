<template>
  <div>
    <div class="top-bar">
      <v-text-field
        v-model="search"
        label="以方案名稱搜尋"
        append-icon="mdi-magnify"
        outlined
        clearable
        @keyup.enter="executeSearch"
        @click:append="executeSearch"
      ></v-text-field>

      <v-btn color="primary" @click="openNew">新增方案細則</v-btn>
    </div>

    <!-- DataTable -->
    <v-data-table
      :headers="headers"
      :items="details"
      item-value="id"
      class="elevation-1 custom-table"
      dense
      fixed-header
      alternate-row
    >
      <template v-slot:[`item.actions`]="{ item }">
        <div class="actions-container">
          <v-btn
            icon
            color="primary"
            size="small"
            class="btnEdit"
            @click="editDetail(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" size="small" @click="deleteDetail(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Dialog -->
    <v-dialog v-model="detailDialog" max-width="600px">
      <v-card>
        <v-card-title>{{
          isEdit ? "編輯方案細則" : "新增方案細則"
        }}</v-card-title>
        <v-card-text>
          <v-text-field
            label="方案 ID"
            v-model.number="detail.planId"
            outlined
            clearable
            min="0"
            type="number"
          ></v-text-field>
          <v-text-field
            label="動作 ID"
            v-model.number="detail.actionId"
            outlined
            clearable
            min="0"
            type="number"
          ></v-text-field>
          <v-text-field
            label="組數"
            v-model.number="detail.sets"
            outlined
            clearable
            min="1"
            type="number"
          ></v-text-field>
          <v-text-field
            label="每組次數"
            v-model.number="detail.reps"
            outlined
            clearable
            min="1"
            type="number"
          ></v-text-field>
          <!-- <v-text-field
            label="總熱量消耗"
            v-model.number="detail.calories"
            outlined
            clearable
            type="number"
          ></v-text-field> -->
        </v-card-text>
        <v-card-actions>
          <v-btn color="white" text @click="hideDialog">取消</v-btn>
          <v-btn color="orange" text @click="saveDetail">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// 資料
const details = ref([]); // PlanDetail 資料列表
const detail = ref({
  id: 0,
  planId: 0,
  actionId: 0,
  sets: 0,
  reps: 0,
  calories: 0,
}); // 單筆 PlanDetail 資料
const detailDialog = ref(false); // 控制 Dialog 開關
const isEdit = ref(false); // 判斷是否為編輯模式
const search = ref(""); // 搜尋欄的內容

// 表格標題
const headers = ref([
  { title: "方案細則 ID", value: "id" },
  //   { title: "方案 ID", value: "planId" },
  { title: "方案名稱", value: "planName" },
  //   { title: "動作 ID", value: "actionId" },
  { title: "動作名稱", value: "actionName" },
  { title: "組數", value: "sets" },
  { title: "每組次數", value: "reps" },
  { title: "總熱量消耗", value: "calories" },
  { title: "操作", value: "actions", sortable: false },
]);

// 獲取所有 PlanDetail 資料
const fetchDetails = async () => {
  try {
    const response = await axios.get("http://localhost:8082/api/details"); // 連接 PlanDetailController
    details.value = response.data; // 後端返回的資料存入 details
  } catch (error) {
    console.error("無法獲取方案細則資料：", error);
  }
};

// 搜尋方案細則
const executeSearch = async () => {
  try {
    const response = await axios.get("http://localhost:8082/api/details", {
      params: { planName: search.value }, // 傳遞搜尋條件
    });
    details.value = response.data; // 更新 details
  } catch (error) {
    console.error("搜尋方案細則失敗：", error);
  }
};

// 打開新增方案細則對話框
const openNew = () => {
  detail.value = {
    id: 0,
    planId: 0,
    actionId: 0,
    sets: 1,
    reps: 1,
    // calories: 0,
  }; // 初始化資料
  isEdit.value = false; // 新增模式
  detailDialog.value = true;
};

// 編輯方案細則
const editDetail = (selectedDetail) => {
  detail.value = { ...selectedDetail }; // 將選中的資料複製到 detail
  isEdit.value = true; // 編輯模式
  detailDialog.value = true;
};

// 關閉對話框
const hideDialog = () => {
  detailDialog.value = false;
};

// 儲存方案細則（新增或編輯）
const saveDetail = async () => {
  try {
    if (isEdit.value) {
      // 更新方案細則
      await axios.put(
        `http://localhost:8082/api/details/${detail.value.id}`,
        detail.value
      );
    } else {
      // 新增方案細則
      await axios.post("http://localhost:8082/api/details", detail.value);
    }
    fetchDetails(); // 重新載入方案細則列表
    hideDialog();
  } catch (error) {
    console.error("儲存方案細則失敗：", error);
  }
};

// 刪除方案細則
const deleteDetail = async (id) => {
  try {
    if (confirm("確定要刪除此方案細則嗎？")) {
      await axios.delete(`http://localhost:8082/api/details/${id}`); // 刪除方案細則
      fetchDetails(); // 刷新方案細則列表
    }
  } catch (error) {
    console.error("刪除方案細則失敗：", error);
  }
};

// 初始化時獲取資料
onMounted(fetchDetails);
</script>

<style scoped>
/* 保留樣式設計，不更動任何 class */
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
