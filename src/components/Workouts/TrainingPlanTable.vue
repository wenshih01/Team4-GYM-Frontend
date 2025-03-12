<template>
  <div
    v-if="visible"
    class="training-plan-modal-overlay"
    @click.self="closeModal"
  >
    <div class="training-plan-modal-content">
      <v-data-table
        :items="items"
        :headers="headers"
        :items-per-page="10"
        class="rounded-bordered-table training-plan-table"
      >
        <template v-slot:top>
          <v-toolbar flat class="custom-toolbar">
            <v-toolbar-title class="title-center">方案列表</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
        </template>

        <!-- 操作按鈕 -->
        <template v-slot:item.action="{ item }">
          <div>
            <!-- 編輯按鈕 -->
            <v-btn
              v-if="!item.public"
              icon
              color="primary"
              size="small"
              class="btnEdit"
              @click="editPlan(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <!-- 刪除按鈕 -->
            <v-btn
              v-if="!item.public"
              icon
              color="red"
              size="small"
              @click="deletePlan(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- 當沒有資料時顯示提示 -->
      <p v-if="items.length === 0">沒有訓練方案資料。</p>

      <!-- 關閉按鈕 -->
      <div class="close-button-container">
        <button @click="closeModal" class="close-button">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

// 接收父層傳入的資料
defineProps({
  visible: Boolean, // 控制顯示
  items: Array, // 表格資料
  headers: Array, // 表格欄位標題
});

// 發出事件
const emit = defineEmits(["close", "edit", "delete"]);

// 關閉視窗的方法
const closeModal = () => {
  emit("close");
};

// 發出編輯事件
const editPlan = (plan) => {
  emit("edit", plan);
};

// 發出刪除事件
const deletePlan = (planId) => {
  emit("delete", planId);
};
</script>

<style scoped>
.training-plan-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.training-plan-modal-content {
  background-color: #333;
  padding: 20px;
  border-radius: 12px;
  color: #000;
  text-align: left;
  max-width: 80%;
  width: 1200px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.custom-toolbar {
  background-color: #ff961e;
  color: #ffffff;
}

.title-center {
  flex: 1;
  text-align: right;
  font-weight: bold;
}

.close-button-container {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.close-button {
  padding: 10px 15px;
  background-color: #ff961e;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  align-items: center;
}

.rounded-bordered-table {
  border: 2px solid #ff961e; /* 外框顏色 */
  border-radius: 12px; /* 圓角 */
  overflow: hidden; /* 防止內容超出圓角 */
  background-color: #f5e2c6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 陰影效果 */
}

.rounded-bordered-table th {
  background-color: #ff961e;
  color: white;
  font-weight: bold;
  text-align: left;
  padding: 10px;
  border-bottom: 2px solid #ddd;
}

.rounded-bordered-table tr:hover {
  background-color: #f7f7f7;
}

.rounded-bordered-table td,
.rounded-bordered-table th {
  padding: 10px;
  text-align: left;
}
</style>
