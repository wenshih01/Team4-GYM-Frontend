<template>
  <div>
    <div class="top-bar">
      <v-text-field
        v-model="search"
        label="以會員等級名稱搜尋"
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
      :items="membershipLevels"
      item-value="levelId"
      class="elevation-1 custom-table"
      dense
      fixed-header
      alternate-row
    >
      <template v-slot:[`item.actions`]="{ item }">
        <div class="actions-container">
          <v-btn icon color="primary" size="small" class="btnEdit" @click="editLevel(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" size="small" @click="deleteLevel(item.levelId)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Dialog -->
    <v-dialog v-model="levelDialog" max-width="600px">
      <v-card>
        <v-card-title>{{ isEdit ? "編輯會員等級" : "新增會員等級" }}</v-card-title>
        <v-card-text>
          <v-text-field label="會員等級名稱" v-model="level.levelName" outlined clearable></v-text-field>
          <v-text-field label="最大點數" v-model.number="level.maxPoints" outlined clearable type="number"></v-text-field>
          <v-text-field label="價格" v-model.number="level.price" outlined clearable type="number"></v-text-field>
          <v-text-field label="方案時長 (月份)" v-model.number="level.durationMonths" outlined clearable type="number"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="white" text @click="hideDialog">取消</v-btn>
          <v-btn color="orange" text @click="saveLevel">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// 會員等級列表
const membershipLevels = ref([]);
const level = ref({
  levelId: null,
  levelName: "",
  maxPoints: 0,
  price: 0,
  durationMonths: 0, // ⬅ 新增 durationMonths
});
const levelDialog = ref(false);
const isEdit = ref(false);
const search = ref("");

// 表格標題，新增「方案時長 (月份)」
const headers = ref([
  { title: "等級 ID", value: "levelId" },
  { title: "等級名稱", value: "levelName" },
  { title: "最大點數", value: "maxPoints" },
  { title: "價格", value: "price" },
  { title: "方案時長 (月)", value: "durationMonths" }, 
  { title: "操作", value: "actions", sortable: false },
]);

// 獲取所有會員等級
const fetchLevels = async () => {
  try {
    const response = await axios.get("http://localhost:8082/api/membership-levels");
    membershipLevels.value = response.data;
  } catch (error) {
    console.error("無法獲取會員等級資料：", error);
  }
};

// 搜尋會員等級
const executeSearch = async () => {
  try {
    const response = await axios.get("http://localhost:8082/api/membership-levels");
    membershipLevels.value = response.data.filter(level => level.levelName.includes(search.value));
  } catch (error) {
    console.error("搜尋會員等級失敗：", error);
  }
};

// 打開新增會員等級對話框
const openNew = () => {
  level.value = {
    levelId: null,
    levelName: "",
    maxPoints: 0,
    price: 0,
    durationMonths: 0, // ⬅ 預設為 0
  };
  isEdit.value = false;
  levelDialog.value = true;
};

// 編輯會員等級
const editLevel = (selectedLevel) => {
  level.value = { ...selectedLevel };
  isEdit.value = true;
  levelDialog.value = true;
};

// 關閉對話框
const hideDialog = () => {
  levelDialog.value = false;
};

// 儲存會員等級（新增或編輯）
const saveLevel = async () => {
  try {
    if (isEdit.value) {
      await axios.put(`http://localhost:8082/api/membership-levels/${level.value.levelId}`, level.value);
    } else {
      await axios.post("http://localhost:8082/api/membership-levels", level.value);
    }
    fetchLevels();
    hideDialog();
  } catch (error) {
    console.error("儲存會員等級失敗：", error);
  }
};

// 刪除會員等級
const deleteLevel = async (id) => {
  try {
    if (confirm("確定要刪除此會員等級嗎？")) {
      await axios.delete(`http://localhost:8082/api/membership-levels/${id}`);
      fetchLevels();
    }
  } catch (error) {
    console.error("刪除會員等級失敗：", error);
  }
};

// 初始化時獲取資料
onMounted(fetchLevels);
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
