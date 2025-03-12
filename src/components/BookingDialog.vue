<template>
    <!-- 月曆對話框 -->
    <v-dialog v-model="internalShow" max-width="900px">
      <v-card class="calendar-card">
        <div class="calendar-header">
          <h2 class="title">{{ currentMonth }} {{ currentYear }}</h2>
          <v-btn color="orange" text @click="internalShow = false">關閉</v-btn>
        </div>
  
        <div class="calendar">
          <div class="calendar-header">
            <v-btn icon="mdi-chevron-left" @click="previousMonth" color="orange" />
            <h2 class="month-title">{{ currentMonth }} {{ currentYear }}</h2>
            <v-btn icon="mdi-chevron-right" @click="nextMonth" color="orange" />
          </div>
  
          <!-- 星期名稱 -->
          <div class="calendar-grid">
            <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
  
            <!-- 月曆日期 -->
            <div
                class="day"
                v-for="(day, index) in days"
                :key="index"
                :class="{ 'current-day': isToday(day.date), 'empty-day': !day.date, 'booked-day': day.isBooked }"
                @click="viewDetails(day)"
              >
                <span class="date-number">{{ day.date ? day.date.getDate() : '' }}</span>

                
                <!-- ✅ 這裡新增課程資訊 -->
                <div v-if="day.courses.length > 0" class="course-list">


                  <div v-for="(course, i) in day.courses" :key="i" class="course-item">
                    <span class="course-name">{{ course.name }}</span>
                    <span v-if="course.status === '停課'" class="status-icon cancelled-icon">✖</span>
                    <span v-else class="status-icon status-indicator" :class="getStatusClass(course.status)"></span>
                  </div>

                </div>
                </div>

          </div>
        </div>
      </v-card>
    </v-dialog>


    <v-dialog v-model="dialogVisible" max-width="600px">
  <v-card class="dialog-card">
    <v-card-title class="dialog-title">
      {{ selectedDate }} 的課程
    </v-card-title>

    <v-card-text class="dialog-content">
  <div v-if="selectedCourses.length === 0" class="no-course-text">
    當天沒有課程。
  </div>

  <v-list v-else class="course-list">
    <v-list-item 
        v-for="course in selectedCourses" 
        :key="course.scheduleId" 
        class="course-list-item"
        :class="{ 
            'booked-course': course.isBooked, 
            'disabled-course': course.hasStartedOrEnded 
        }"
    >
        <div class="course-details">
            <div class="course-info">
                <strong>課程名稱:</strong> {{ course.name }}
                <span v-if="course.status === '停課'" class="cancelled-text">停課</span>
            </div>
            <div class="course-info">
                <strong>教練:</strong> {{ course.coach }}
            </div>
            <div class="course-info">
                <strong>時間:</strong> {{ formatDateTime(course.startTime) }} - {{ formatDateTime(course.endTime) }}
            </div>
            <div class="course-info">
                <strong>目前預約人數:</strong> {{ course.currentParticipants }} / {{ course.maxParticipants }}
            </div>
        </div>

        <div class="course-actions">
            <v-btn 
                v-if="course.canBook && !course.hasStartedOrEnded"  
                :color="course.isBooked ? 'red' : 'orange'" 
                variant="outlined" 
                size="small"
                @click="toggleBooking(course)">
                {{ course.isBooked ? '取消預約' : '預約課程' }}
            </v-btn>
        </div>
    </v-list-item>
  </v-list>
</v-card-text>


    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="orange" text @click="dialogVisible = false">關閉</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


<v-dialog v-model="successDialog" max-width="500px">
  <v-card class="dialog-card">
    <v-card-title class="dialog-title">預約成功</v-card-title>

    <v-card-text v-if="successCourse" class="dialog-content">
      <div class="course-info"><strong>課程名稱:</strong> {{ successCourse.name }}</div>
      <div class="course-info"><strong>教練:</strong> {{ successCourse.coach }}</div>
      <div class="course-info">
        <strong>時間:</strong> {{ formatDateTime(successCourse.startTime) }} - {{ formatDateTime(successCourse.endTime) }}
      </div>
      <div class="course-info">
        <strong>目前預約人數:</strong> {{ successCourse.currentParticipants }} / {{ successCourse.maxParticipants }}
      </div>
      <div class="course-info"><strong>課程介紹:</strong> {{ successCourse.description }}</div>
      <div class="course-info"><strong>課程時長:</strong> {{ successCourse.durationMinutes }} 分鐘</div>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="orange" text @click="successDialog = false">確定</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<v-dialog v-model="cancelDialog" max-width="400px">
  <v-card class="dialog-card">
    <v-card-title class="dialog-title">取消預約成功</v-card-title>

    <v-card-text class="dialog-content">
      您的預約已成功取消。
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="orange" text @click="cancelDialog = false">確定</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


  </template>
  
  <script setup>
  import { ref, computed, watch,onMounted,watchEffect  } from "vue";
   import axios from "axios";
  import apiClient from "@/api/apiClient";
  import { getUserProfile } from "@/api/auth";

  
  // **Props**
  const props = defineProps({
    modelValue: Boolean,
  });
  const emit = defineEmits(["update:modelValue"]);
  
  // **控制對話框開關**
  const internalShow = ref(props.modelValue);
  watch(() => props.modelValue, (newVal) => {
    internalShow.value = newVal;
  });
  watch(internalShow, (newVal) => {
    emit("update:modelValue", newVal);
  });
  
  // **日曆邏輯**
  const currentDate = ref(new Date());
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // 計算當月日期
  const days = computed(() => {
    const startOfMonth = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth(),
        1
    );
    const endOfMonth = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        0
    );

    const daysArray = [];
    const startDayOfWeek = startOfMonth.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
        daysArray.push({ date: null, courses: [], isBooked: false });
    }

    for (let i = 1; i <= endOfMonth.getDate(); i++) {
        const date = new Date(
            currentDate.value.getFullYear(),
            currentDate.value.getMonth(),
            i
        );

        const dateKey = date.toDateString();
        const coursesOnThisDay = groupedCourses.value[dateKey] || [];

        // ✅ 檢查這一天是否有會員已預約的課程
        const hasBookedCourse = coursesOnThisDay.some(course => course.isBooked);

        daysArray.push({
            date,
            courses: coursesOnThisDay,
            isBooked: hasBookedCourse, // ✅ 正確標記 `isBooked`
        });
    }

    return daysArray;
});


  
  // 取得目前月份與年份
  const currentMonth = computed(() =>
    currentDate.value.toLocaleString("default", { month: "long" })
  );
  const currentYear = computed(() => currentDate.value.getFullYear());
  
  // 判斷是否為今日
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // 切換月份
  const previousMonth = () => {
    currentDate.value.setMonth(currentDate.value.getMonth() - 1);
    currentDate.value = new Date(currentDate.value);
  };
  
  const nextMonth = () => {
    currentDate.value.setMonth(currentDate.value.getMonth() + 1);
    currentDate.value = new Date(currentDate.value);
  };

  const courses = ref([]); // 存放後端獲取的課程數據

  const fetchCourses = async () => {
  try {
    const startOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1);
    const endOfMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0);

    // 🔹 **只有在 `isLoggedIn` 為 `true` 時，才執行 `getUserData()`**
    if (isLoggedIn.value && !userid.value) {
      await getUserData();
    }

    // **🔹 查詢當月所有課程**
    const response = await axios.get("http://localhost:8082/schedules", {
      params: {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      },
    });

    let courseData = response.data;

    // 🔹 **只有已登入用戶才查詢預約課程**
    if (isLoggedIn.value && userid.value) {
      try {
        // **🔹 取得會員的所有預約課程**
        const bookingResponse = await axios.get(`http://localhost:8082/bookings/user/${userid.value}`);

        // **🔹 儲存所有已預約的 `scheduleId`**
        const bookedCourses = new Set(bookingResponse.data.map(booking => booking.schedule.scheduleId));

        // **🔹 確保課程標記 `isBooked`，並加入 `description` & `durationMinutes`**
        courseData = courseData.map((course) => ({
          ...course,
          isBooked: bookedCourses.has(course.scheduleId),  // ✅ 是否已預約
          currentParticipants: course.currentParticipants || 0, // ✅ 目前報名人數
          maxParticipants: course.maxParticipants || 10,       // ✅ 最大報名人數
          description: course.course?.description || "無課程介紹", // ✅ 課程描述
          durationMinutes: course.course?.durationMinutes || 60, // ✅ 課程時長（分鐘）
        }));
      } catch (bookingError) {
        console.warn("⚠️ 獲取預約數據失敗，可能未登入或其他問題", bookingError);
      }
    } else {
      console.log("🔹 未登入，跳過預約查詢");
      courseData = courseData.map((course) => ({
        ...course,
        isBooked: false, // **未登入時，所有課程皆設為未預約**
        currentParticipants: course.currentParticipants || 0,
        maxParticipants: course.maxParticipants || 10,
        description: course.course?.description || "無課程介紹",
        durationMinutes: course.course?.durationMinutes || 60,
      }));
    }

    courses.value = courseData;
  } catch (error) {
    console.error("❌ 無法獲取課程數據：", error);
  }
};








// 根據日期分組課程
const groupedCourses = computed(() => {
    const groups = {};
    if (!Array.isArray(courses.value)) return groups;

    courses.value.forEach((schedule) => {
        const dateKey = new Date(schedule.startTime).toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        const courseObj = {
            scheduleId: schedule.scheduleId,
            name: schedule.course?.courseName || "未知課程",
            coach: schedule.coach?.ename || "未知教練",
            status: schedule.status || "未開始",
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            isBooked: schedule.isBooked || false,
            currentParticipants: schedule.currentParticipants, // ✅ 目前報名人數
            maxParticipants: schedule.maxParticipants,         // ✅ 最大人數
            description: schedule.description,                // ✅ 課程描述
            durationMinutes: schedule.durationMinutes,        // ✅ 課程時長
        };

        groups[dateKey].push(courseObj);
    });

    return groups;
});






const dialogVisible = ref(false);
const selectedDate = ref(""); // 儲存點擊的日期
const selectedCourses = ref([]); // 儲存當天的課程列表

const checkUserBooking = async (scheduleId) => {
  try {
    if (!userid.value) return { isBooked: false, bookingId: null };

    const response = await apiClient.get(`http://localhost:8082/bookings/user/${userid.value}/schedule/${scheduleId}`);
    
    if (response.data && response.data.isBooked) {
      return {
        isBooked: true,
        bookingId: response.data.bookingId || null, // ✅ 確保 bookingId 存在
      };
    } else {
      return { isBooked: false, bookingId: null };
    }
  } catch (error) {
    console.error("檢查預約狀態失敗：", error);
    return { isBooked: false, bookingId: null };
  }
};





const viewDetails = async (day) => {
  if (!day.date) return;
  selectedDate.value = day.date.toDateString();

  const now = new Date();

  const coursesWithBookingStatus = await Promise.all(
    day.courses.map(async (course) => {
      const bookingInfo = await checkUserBooking(course.scheduleId);
      const startTime = new Date(course.startTime);
      const endTime = new Date(course.endTime);

      return {
        ...course,
        isBooked: bookingInfo.isBooked,
        bookingId: bookingInfo.bookingId || null,
        canBook: now < startTime && course.status !== "停課",
        isCancelled: course.status === "停課",
        hasStartedOrEnded: now >= startTime || course.status === "停課",
        currentParticipants: course.currentParticipants, 
        maxParticipants: course.maxParticipants,         
      };
    })
  );

  selectedCourses.value = coursesWithBookingStatus.sort((a, b) => {
    return new Date(a.startTime) - new Date(b.startTime);
  });

  dialogVisible.value = true;
};










const getStatusClass = (status) => {
  switch (status) {
    case "未開始":
      return "not-started";
    case "進行中":
      return "in-progress";
    case "已結束":
      return "completed";
    default:
      return "";
  }
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "無資料"; // 避免空值錯誤
  return dateTimeStr.replace("T", " ").substring(0, 16); // 格式化日期時間（只取到分鐘）
};

const isLoggedIn = ref(false);
const currentUser = ref({
      username: '',
      avatar: null,
     userid:''
    });

const checkLoginStatus = async () => {
      try {
        const response = await apiClient.get('/check', { withCredentials: true });
        if (response.data && response.data.isLoggedIn) {
          isLoggedIn.value = true;
          currentUser.value = response.data.user;
        } else {
          isLoggedIn.value = false;
          currentUser.value = { username: '', avatar: null };
        }
      } catch (error) {
        console.error('Error checking login status:', error);
          isLoggedIn.value = false;
      }
    };

   

    const userid = ref(""); // 用於儲存當前登入的 userId



    // 獲取用戶 ID
    const getUserData = async () => {
    if (!isLoggedIn.value) {
        console.log("🔹 未登入，跳過 `getUserData()`");
        return; // **未登入時直接返回，不發送請求**
    }

    try {
        const response = await getUserProfile();
        console.log("📩 API 回應:", response.data); // 🛠 確保 API 回應正確

        if (response.data?.id) {
            userid.value = response.data.id;
            console.log("✅ 用戶 ID 獲取成功:", userid.value);
        } else {
            console.warn("⚠️ API 沒有返回 `id`，可能是後端問題");
        }
    } catch (err) {
        console.warn("⚠️ 獲取用戶資料失敗:", err);
    }
};

watch(isLoggedIn, async (newValue) => {
    console.log("🔹 isLoggedIn 變更:", newValue);
    if (newValue) {
        await getUserData(); // 確保登入後立即獲取 `userid`
    }
});









const cancelDialog = ref(false);

const successDialog = ref(false); // ✅ 預約成功對話框
const successCourse = ref(null); // ✅ 存放預約成功的課程資訊

const toggleBooking = async (course) => {
  try {
    if (course.isBooked && course.bookingId) {
      // 🔴 **刪除預約**
      console.log(`🗑️ 刪除預約 - bookingId=${course.bookingId}`);
      await apiClient.delete(`http://localhost:8082/bookings/${course.bookingId}`);

      // ✅ 開啟「取消預約成功」的彈窗
      cancelDialog.value = true;

      // ✅ 更新狀態
      course.isBooked = false;
      course.bookingId = null;
    } else {
      // ✅ **新增預約**
      console.log(`🆕 新增預約 - scheduleId=${course.scheduleId}`);
      const response = await apiClient.post("http://localhost:8082/bookings", {
        userId: userid.value,
        scheduleId: course.scheduleId
      });

      // ✅ 開啟「預約成功」的彈窗
      successCourse.value = { ...course };
      successDialog.value = true;

      // ✅ 更新狀態
      course.bookingId = response.data.bookingId;
      course.isBooked = true;
    }

    // **✅ 重新獲取最新課程狀態**
    await fetchCourses();
  } catch (error) {
    console.error("操作失敗：", error);
    alert(error.response?.data || "操作失敗，請稍後再試！");
  }
};










//修改部分!!!!
onMounted(async () => {
  await checkLoginStatus();  
  if (isLoggedIn.value) {
    await getUserData();  
  }
  await fetchCourses();   
});





  </script>
  
  <style scoped>
  /* 月曆對話框樣式 */
  .calendar-card {
    background-color: #2c2c2c;
    border-radius: 12px;
    padding: 20px;
    margin: 20px;
    box-shadow: none;
  }
  
  .calendar {
    color: #e0e0e0;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .title {
    color: #f36c0b;
    font-size: 1.5rem;
    margin: 0;
  }
  
  /* 月曆網格 */
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }
  
  /* 星期名稱 */
  .day-name {
    text-align: center;
    padding: 10px;
    font-weight: bold;
    color: #f36c0b;
  }
  
  /* 日期方塊 */
  .day {
    background: #333;
    border-radius: 8px;
    padding: 10px;
    min-height: 100px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .day:hover {
    background: #3c3c3c;
  }
  
  /* 今天的日期 */
  .current-day {
    border: 2px solid #f36c0b;
  }
  
  /* 空白日期 */
  .empty-day {
    background: #2c2c2c;
  }
  
  /* 日期數字 */
  .date-number {
    display: block;
    text-align: right;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }
  
  /* 課程列表 */
  .course-list {
    margin-top: 8px;
  }
  
  /* 課程項目 */
  .course-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px;
    margin: 2px 0;
    font-size: 0.8rem;
    
  }
  
  /* 課程名稱 */
  .course-name {
    color: #a79990;
    font-size:8px !important;
  }

  .status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-left: 5px;
}

/* 課程狀態顏色 */
.not-started {
  background: #9e9e9e; /* 灰色 */
}
.in-progress {
  background: #4caf50; /* 綠色 */
}
.completed {
  background: #f44336; /* 紅色 */
}

.dialog-card {
  background-color: #2c2c2c !important;
}

.dialog-title {
  background-color: #3c3c3c !important;
  color: #f36c0b !important;
  padding: 16px !important;
}

.dialog-content {
  padding: 32px 24px !important;
  color: #e0e0e0 !important;
}

.no-course-text {
  text-align: center;
  color: #a79990;
  padding: 20px;
}

.course-list-item {
  background: #333 !important;
  margin-bottom: 8px;
  border-radius: 8px;
  padding: 12px !important;
}

.course-info {
  margin: 5px 0;
  color: #e0e0e0;
}

.course-info strong {
  color: #f36c0b !important;
}

.v-list{
    background-color: transparent !important ;
}

/* 已預約的日期 */
.booked-day {
  background-color: #524E49 !important; /* 淺藍色背景 */
  color: #CCC5B9 !important; /* 白色字體 */
  font-weight: bold; 
  border: 2px solid #CCC5B9; /* 深藍色邊框 */
}

/* 預約的課程變更背景顏色 */
/* 預約的課程背景變色，但不改變字體 */
.booked-course {
  background: #524E49 !important; /* 淺藍色背景 */
  border: 2px solid #868179 !important; /* 深藍色外框 */
  border-radius: 8px; /* 圓角 */
  padding: 8px; /* 內邊距 */
}


/* 課程已經開始或已結束的樣式 */
.disabled-course {
    background: #888 !important; /* 灰色背景 */
    opacity: 0.6; /* 降低透明度 */
    pointer-events: none; /* 禁止點擊 */
}

.cancelled-text {
  color: rgb(222, 59, 59);
  font-weight: bold;
  margin-left: 5px;
  font-size: 18px;
  
}

.cancelled-icon {
  color: red;
  font-size: 12px; /* 統一大小 */
  font-weight: bold;
}

.status-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 10px;  /* 確保寬高統一 */
  height: 10px;
  margin-left: 5px; /* 保持與課程名稱間距 */
  vertical-align: middle; /* 讓圖示與文字對齊 */
}



  </style>
  