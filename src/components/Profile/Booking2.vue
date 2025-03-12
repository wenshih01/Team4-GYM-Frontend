<template>
    <div>
      
      <v-btn color="primary" @click="goToBooking1">
        切換到未開始課程
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
            <v-btn icon color="red" size="small" @click="deleteBooking(item.bookingId)">
                
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
  
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
  import { getUserProfile } from "@/api/auth";  // ✅ 獲取登入會員資訊的 API
  import { useRouter } from "vue-router";
  
  // **狀態變數**
  const bookings = ref([]);  // 存放當前會員的預約
  const errorDialog = ref(false);  
  const errorMessage = ref("");  
  const search = ref("");  
  const userId = ref(null);  // **存放登入會員的 ID**
  
  // **表格標題**
  const headers = ref([
    { title: "預約 ID", value: "bookingId" },
    { title: "課程名稱", value: "schedule.course.courseName" },
    { title: "課程時間", value: "scheduleTime" },
    { title: "預約時間", value: "bookingTime" },
    { title: "狀態", value: "status" },
   
  ]);
  
  // **取得當前登入的會員資訊**
  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      userId.value = response.data.id;
      fetchBookings();  // **確保獲取 `userId` 後再執行 `fetchBookings()`**
    } catch (error) {
      console.error("無法獲取會員資訊:", error);
    }
  };
  
  // **獲取當前會員的預約**
  const fetchBookings = async () => {
  if (!userId.value) return;

  try {
    const response = await axios.get(`http://localhost:8082/bookings/user/${userId.value}`);
    
    const now = new Date();
    bookings.value = response.data
      .filter(booking => {
        const startTime = new Date(booking.schedule.startTime);
        const endTime = new Date(booking.schedule.endTime);

        return now >= startTime; // **只顯示「進行中」或「已結束」的課程**
      })
      .sort((a, b) => new Date(a.schedule.startTime) - new Date(b.schedule.startTime)); // 按時間排序

  } catch (error) {
    console.error("無法獲取預約資料：", error);
  }
};



  
  
  

  
  // **刪除預約**
  const deleteBooking = async (bookingId) => {
    try {
      if (confirm("確定要刪除此預約嗎？")) {
        await axios.delete(`http://localhost:8082/bookings/${bookingId}`);
        fetchBookings();
      }
    } catch (error) {
      errorMessage.value = error.response?.data?.message || "刪除預約失敗";
      errorDialog.value = true;
    }
  };

  const formatScheduleTime = (startTime, endTime) => {
  if (!startTime || !endTime) return "無資料";
  return `${startTime.replace("T", " ").substring(0, 16)} ~ ${endTime.replace("T", " ").substring(0, 16)}`;
};



const router = useRouter();

const goToBooking1 = () => {
  router.push("/profile/booking1"); // 切換回 Booking1
};
  // **初始化時獲取會員與預約資料**
  onMounted(fetchUserProfile);
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
  </style>
  