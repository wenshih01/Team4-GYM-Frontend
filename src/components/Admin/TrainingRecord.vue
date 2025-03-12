<template>
  <div>
    <div class="top-bar">
      <v-text-field
        v-model="search"
        label="以會員ID搜尋"
        append-icon="mdi-magnify"
        outlined
        clearable
        @keyup.enter="executeSearch"
        @click:append="executeSearch"
      ></v-text-field>
    </div>

    <!-- DataTable -->
    <v-data-table
      :headers="headers"
      :items="records"
      item-value="id"
      class="elevation-1 custom-table"
      dense
      fixed-header
      alternate-row
    >
      <template v-slot:[`item.memberName`]="{ item }">
        <span>{{ item.memberId }} - {{ item.memberName }}</span>
      </template>
      <template v-slot:[`item.planName`]="{ item }">
        <span>
          {{ item.planName }} (總熱量: {{ item.planTotalCalories || 0 }} kcal)
        </span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <div class="actions-container">
          <v-btn
            icon
            color="red"
            size="small"
            class="btnDelete"
            @click="deleteRecord(item.id)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// 資料
const records = ref([]); // 執行記錄列表
const search = ref(""); // 搜尋條件

// 表格標題
const headers = ref([
  { title: "執行記錄 ID", value: "id" },
  { title: "會員名稱", value: "memberName" },
  { title: "健身方案", value: "planName" },
  { title: "執行日期", value: "executionDate" },
  { title: "操作", value: "actions", sortable: false },
]);

// 獲取所有執行記錄
const fetchRecords = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8082/api/executionRecords"
    );
    records.value = response.data; // 資料存入 records
  } catch (error) {
    console.error("無法獲取執行記錄：", error);
  }
};

// 根據會員ID查詢
const executeSearch = async () => {
  if (!search.value || isNaN(search.value)) {
    fetchRecords();
    return;
  }

  try {
    const response = await axios.get(
      "http://localhost:8082/api/executionRecords/searchByMemberId",
      {
        params: { memberId: parseInt(search.value, 10) },
      }
    );
    records.value = response.data; // 更新 records
  } catch (error) {
    console.error("搜尋執行記錄失敗：", error);
  }
};

// 刪除執行記錄
const deleteRecord = async (id) => {
  const confirmed = window.confirm("確定要刪除此執行記錄嗎？");
  if (!confirmed) return;

  try {
    await axios.delete(`http://localhost:8082/api/executionRecords/${id}`);
    fetchRecords(); // 刪除後刷新資料
  } catch (error) {
    console.error("刪除執行記錄失敗：", error);
  }
};

// 初始化資料
onMounted(fetchRecords);
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

.btnDelete {
  padding: 4px;
  font-size: 12px;
  background-color: red;
  color: white;
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
