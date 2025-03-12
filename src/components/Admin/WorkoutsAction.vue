<template>
  <div>
    <div class="top-bar">
      <v-text-field
        v-model="search"
        label="以動作名稱搜尋"
        append-icon="mdi-magnify"
        outlined
        clearable
        @keyup.enter="executeSearch"
        @click:append="executeSearch"
      ></v-text-field>

      <v-btn color="primary" @click="openNew">新增動作</v-btn>
    </div>

    <!-- DataTable -->
    <v-data-table
      :headers="headers"
      :items="posts"
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
            @click="editPost(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" size="small" @click="deletePost(item.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </template>
    </v-data-table>

    <!-- Dialog -->
    <v-dialog v-model="postDialog" max-width="600px">
      <v-card>
        <v-card-title>{{ isEdit ? "編輯動作" : "新增動作" }}</v-card-title>
        <v-card-text>
          <v-text-field
            label="動作名稱"
            v-model="post.name"
            outlined
            clearable
          ></v-text-field>
          <v-text-field
            label="部位"
            v-model="post.parts"
            outlined
            clearable
          ></v-text-field>
          <v-text-field
            label="詳細說明"
            v-model="post.teaching"
            outlined
            clearable
          ></v-text-field>
          <v-text-field
            label="教學連結"
            v-model="post.url"
            outlined
            clearable
          ></v-text-field>
          <v-text-field
            label="熱量消耗 (kcal)"
            v-model.number="post.calories"
            outlined
            type="number"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="white" text @click="hideDialog">取消</v-btn>
          <v-btn color="orange" text @click="savePost">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

// 資料
const posts = ref([]); // TrainBean 資料列表
const post = ref({}); // 單筆 TrainBean 資料
const postDialog = ref(false); // 控制 Dialog 開關
const isEdit = ref(false); // 判斷是否為編輯模式
const search = ref(""); // 搜尋欄的內容

// 表格標題
const headers = ref([
  { title: "動作 ID", value: "id" },
  { title: "名稱", value: "name" },
  { title: "部位", value: "parts" },
  { title: "詳細說明", value: "teaching" },
  { title: "教學連結", value: "url" },
  { title: "熱量消耗", value: "calories" },
  { title: "操作", value: "actions", sortable: false },
]);

// 獲取所有 TrainBean 資料
const fetchPosts = async () => {
  try {
    const response = await axios.get("http://localhost:8082/api/actions/all"); // 連接 TrainBeanController
    posts.value = response.data.content; // 後端返回的資料存入 posts
  } catch (error) {
    console.error("無法獲取動作資料：", error);
  }
};

// 搜尋特定名稱的動作
const executeSearch = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8082/api/actions/search",
      {
        params: { name: search.value }, // 傳遞搜尋條件
      }
    );
    posts.value = response.data.content; // 更新 posts
  } catch (error) {
    console.error("搜尋動作失敗：", error);
  }
};

// 打開新增動作對話框
const openNew = () => {
  post.value = { name: "", parts: "", teaching: "", url: "", calories: 0 }; // 初始化資料
  isEdit.value = false; // 新增模式
  postDialog.value = true;
};

// 編輯動作
const editPost = (selectedPost) => {
  post.value = { ...selectedPost }; // 將選中的資料複製到 post
  isEdit.value = true; // 編輯模式
  postDialog.value = true;
};

// 關閉對話框
const hideDialog = () => {
  postDialog.value = false;
};

// 儲存動作（新增或編輯）
const savePost = async () => {
  try {
    if (isEdit.value) {
      // 更新動作
      await axios.put(
        `http://localhost:8082/api/actions/${post.value.id}`,
        post.value
      );
    } else {
      // 新增動作
      await axios.post("http://localhost:8082/api/actions", post.value);
    }
    fetchPosts(); // 重新載入動作列表
    hideDialog();
  } catch (error) {
    console.error("儲存動作失敗：", error);
  }
};

// 刪除動作
const deletePost = async (id) => {
  const confirmed = window.confirm("確定要刪除此動作嗎？");
  if (!confirmed) return; // 如果用戶取消，直接返回

  try {
    await axios.delete(`http://localhost:8082/api/actions/${id}`); // 刪除動作
    fetchPosts(); // 刷新動作列表
  } catch (error) {
    console.error("刪除動作失敗：", error);
  }
};

// 初始化時獲取資料
onMounted(fetchPosts);
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
