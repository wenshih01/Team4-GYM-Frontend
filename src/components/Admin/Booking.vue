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
  
        <v-btn color="primary" @click="openNew">新增預約</v-btn>
      </div>

      <v-btn color="primary" @click="goToBookingEnded">
  切換到已結束課程
</v-btn>
  
      <!-- DataTable -->
      <v-data-table
        :headers="headers"
        :items="bookings"
        item-value="bookingId"
        class="elevation-1 custom-table"
        dense
        fixed-header
        alternate-row
      >

        <template v-slot:[`item.scheduleTime`]="{ item }">
          {{ formatScheduleTime(item.schedule.startTime, item.schedule.endTime) }}
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="actions-container">
            <!-- <v-btn icon color="red" size="small" @click="cancelBooking(item.bookingId)">
              <v-icon>mdi-cancel</v-icon>
            </v-btn>
            <v-btn icon color="green" size="small" @click="restoreBooking(item.bookingId)">
              <v-icon>mdi-reload</v-icon>
            </v-btn> -->
            <v-btn icon color="red" size="small" @click="deleteBooking(item.bookingId)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
  
      <!-- Dialog -->
      <v-dialog v-model="detailDialog" max-width="600px">
        <v-card>
          <v-card-title>{{ isEdit ? "編輯預約" : "新增預約" }}</v-card-title>
          <v-card-text>
            <v-select
              label="選擇會員"
              :items="users"
              item-title="name"
              item-value="id"
              v-model="booking.userId"
              outlined
              clearable
            ></v-select>
  
            <v-select
              label="選擇課程"
              :items="schedules"
              item-title="course.courseName"
              item-value="scheduleId"
              v-model="booking.scheduleId"
              outlined
              clearable
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-btn color="white" text @click="hideDialog">取消</v-btn>
            <v-btn color="orange" text @click="saveBooking">儲存</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 錯誤訊息彈窗 -->
    <v-dialog v-model="errorDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">錯誤</v-card-title>
        <v-card-text>
          {{ errorMessage }}
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="errorDialog = false">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  import axios from "axios";
  import { useRouter } from "vue-router";
  const router = useRouter();
  
  // 資料
  const bookings = ref([]);
  const users = ref([]);
  const schedules = ref([]);
  const errorDialog = ref(false);        // 控制錯誤彈窗的開關
  const errorMessage = ref("");         //  儲存錯誤訊息內容
  
  const booking = ref({
    bookingId: null,
    userId: null,
    scheduleId: null,
  });
  
  const detailDialog = ref(false);
  const isEdit = ref(false);
  const search = ref("");
  
  // 表格標題
  const headers = ref([
    { title: "預約 ID", value: "bookingId" },
    { title: "會員名稱", value: "user.name" },
    { title: "課程名稱", value: "schedule.course.courseName" },
    { title: "課程時間", value: "scheduleTime" },
    // { title: "預約時間", value: "bookingTime" },
    { title: "狀態", value: "status" },
    { title: "操作", value: "actions", sortable: false },
  ]);
  
  // 獲取所有預約
  const fetchBookings = async () => {
  try {
    const response = await axios.get("http://localhost:8082/bookings");
    const now = new Date(); // 取得當前時間

    bookings.value = response.data
      .filter(booking => new Date(booking.schedule.startTime) > now) // 只保留「未開始」的課程
      .sort((a, b) => new Date(a.schedule.startTime) - new Date(b.schedule.startTime)); // 按開始時間排序
  } catch (error) {
    console.error("無法獲取預約資料：", error);
  }
};


  
  // 取得會員 & 課程資料
  const fetchDropdownData = async () => {
    try {
      const [userResponse, scheduleResponse] = await Promise.all([
        axios.get("http://localhost:8082/api/users/list"),
        axios.get("http://localhost:8082/schedules"),
      ]);
      users.value = userResponse.data;
      schedules.value = scheduleResponse.data;
    } catch (error) {
      console.error("無法獲取會員或課程資料：", error);
    }
  };
  
  // 搜尋預約
  const executeSearch = async () => {
  try {
    const response = await axios.get("http://localhost:8082/bookings/search", {
      params: { name: search.value },
    });

    const now = new Date(); // 取得當前時間

    bookings.value = response.data
      .filter(booking => new Date(booking.schedule.startTime) > now) // 只保留「未開始」的課程
      .sort((a, b) => new Date(a.schedule.startTime) - new Date(b.schedule.startTime)); // 按開始時間排序

  } catch (error) {
    console.error("搜尋預約失敗：", error);
  }
};


  
  // 打開新增預約對話框
  const openNew = () => {
    booking.value = {
      bookingId: null,
      userId: null,
      scheduleId: null,
    };
    isEdit.value = false;
    detailDialog.value = true;
  };
  
  // 關閉對話框
  const hideDialog = () => {
    detailDialog.value = false;
  };
  
  // 儲存預約
  const saveBooking = async () => {
  try {
    await axios.post("http://localhost:8082/bookings", booking.value);
    fetchBookings();
    hideDialog();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "發生錯誤，請稍後再試";  // 🛠(修改)
    errorDialog.value = true;  // 🛠(修改) 顯示錯誤彈窗
  }
};

  
  // 取消預約
  const cancelBooking = async (bookingId) => {
  try {
    await axios.put(`http://localhost:8082/bookings/${bookingId}/cancel`);
    fetchBookings();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "取消預約失敗";  // 🛠(修改)
    errorDialog.value = true;  // 🛠(修改) 顯示錯誤彈窗
  }
};
  
  // 恢復預約
  const restoreBooking = async (bookingId) => {
  try {
    await axios.put(`http://localhost:8082/bookings/${bookingId}/restore`);
    fetchBookings();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "恢復預約失敗";  // 🛠(修改)
    errorDialog.value = true;  // 🛠(修改) 顯示錯誤彈窗
  }
};
  // 刪除預約
  const deleteBooking = async (bookingId) => {
  try {
    if (confirm("確定要刪除此預約嗎？")) {
      await axios.delete(`http://localhost:8082/bookings/${bookingId}`);
      fetchBookings();
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "刪除預約失敗";  // 🛠(修改)
    errorDialog.value = true;  // 🛠(修改) 顯示錯誤彈窗
  }
};

const formatScheduleTime = (startTime, endTime) => {
  if (!startTime || !endTime) return "無資料";
  return `${startTime.replace("T", " ").substring(0, 16)} ~ ${endTime.replace("T", " ").substring(0, 16)}`;
};

const goToBookingEnded = () => {
  router.push("/admin/bookingEnded"); 
};



  // 初始化時獲取資料
  onMounted(() => {
    fetchBookings();
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
  </style>
  