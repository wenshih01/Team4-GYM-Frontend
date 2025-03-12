vueCopy<template>
  <v-card class="calendar-card">
    <div class="calendar">
      <!-- 日曆標題 -->
      <div class="calendar-header">
        <v-btn icon="mdi-chevron-left" @click="previousMonth" color="orange" />
        <h2 class="month-title">{{ currentMonth }} {{ currentYear }}</h2>
        <v-btn icon="mdi-chevron-right" @click="nextMonth" color="orange" />
      </div>

      <!-- 日曆網格 -->
      <div class="calendar-grid">
        <!-- 星期名稱 -->
        <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>

        <!-- 日期格子 -->
        <div class="day" v-for="(day, index) in days" :key="index"
          :class="{ 'current-day': isToday(day.date), 'empty-day': !day.date }" @click="viewDetails(day)">
          <span class="date-number">{{ day.date ? day.date.getDate() : '' }}</span>
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

    <!-- 課程詳情對話框 -->
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
            <v-list-item v-for="course in selectedCourses" :key="course.scheduleId" class="course-list-item">
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
                <v-btn color="orange" variant="outlined" size="small" @click="editCourse(course.scheduleId)">
                  修改
                </v-btn>
                <v-btn color="error" variant="outlined" size="small" @click="deleteCourse(course.scheduleId)">
                  刪除
                </v-btn>

                <v-btn
                    :color="course.status === '停課' ? 'green' : '#CCC5B9'"
                    variant="outlined"
                    size="small"
                    @click="toggleCancel(course)"
                  >
                    {{ course.status === '停課' ? '恢復' : '停課' }}
                  </v-btn>
                
                  <v-btn color="blue" variant="outlined" size="small" @click="showBookedUsers(course.scheduleId)">
    名單
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

    <!-- 修改課程對話框 -->
    <v-dialog v-model="editDialogVisible" max-width="500px">
      <v-card class="dialog-card">
        <v-card-title class="dialog-title">修改課程</v-card-title>

        <v-card-text class="dialog-content">
          <v-select label="選擇教練" :items="coaches" item-title="ename" item-value="empno"
            v-model="editSchedule.coach.empno" variant="outlined" class="mb-4" />

          <v-select label="選擇課程" :items="coursesList" v-model="editSchedule.course.courseID" variant="outlined"
            class="mb-4" />

          <v-text-field label="開始時間" type="datetime-local" v-model="editSchedule.startTime" variant="outlined"
            class="mb-4" />

          <v-text-field label="結束時間" type="datetime-local" v-model="editSchedule.endTime" variant="outlined" />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="closeEditDialog">取消</v-btn>
          <v-btn color="orange" text @click="saveEditedSchedule">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>

  <v-dialog v-model="bookingDialog" max-width="500px">
  <v-card>
    <v-card-title>已預約的會員</v-card-title>
    <v-card-text>
      <v-list v-if="bookedUsers.length">
        <v-list-item v-for="user in bookedUsers" :key="user.id">
          {{ user.name }} ({{ user.username }})
        </v-list-item>
      </v-list>
      <p v-else class="text-center">無人預約</p>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" text @click="bookingDialog = false">關閉</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const dialogVisible = ref(false); // 控制彈窗顯示
const selectedDate = ref(""); // 選中的日期
const selectedCourses = ref([]); // 選中日期的課程列表
const coaches = ref([]);




const currentDate = ref(new Date());
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const courses = ref([]); // 用於存儲後端返回的課程數據
const coursesList = ref([]);

const bookingDialog = ref(false); // 控制預約名單的彈窗
const bookedUsers = ref([]); // 存儲預約會員

const showBookedUsers = async (scheduleId) => {
  try {
    const response = await axios.get(`http://localhost:8082/bookings/schedule/${scheduleId}`);

    // 提取每筆預約的 user 物件
    bookedUsers.value = response.data.length ? response.data.map(booking => booking.user) : [];

    bookingDialog.value = true; // 打開預約名單彈窗
  } catch (error) {
    console.error("無法獲取預約人員資料：", error);
  }
};


const formatDateTime = (dateTimeStr) => {
  return dateTimeStr
    .replace('T', ' ')
    .substring(0, 16); // 只取到分鐘
}
// 根據日期分組課程
const groupedCourses = computed(() => {
  const groups = {};
  if (!Array.isArray(courses.value)) return groups;

  courses.value.forEach((schedule) => {
    const dateKey = new Date(schedule.startTime).toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    // 確保只有當 course 物件存在時才訪問其屬性
    const courseName = schedule.course?.courseName || '未知課程';
    groups[dateKey].push({
      scheduleId: schedule.scheduleId,
      name: courseName,
      coach: schedule.coach?.ename || '未知教練',
      status: schedule.status,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      currentParticipants: schedule.currentParticipants || 0,  // ✅ 目前報名人數
      maxParticipants: schedule.maxParticipants || 10,        // ✅ 最大報名人數  
    });
  });
  return groups;
});


const editDialogVisible = ref(false); // 控制修改彈窗的顯示
const editSchedule = ref({
  scheduleId: null,
  course: { courseID: null, courseName: "" },
  coach: { empno: null, ename: "" },
  startTime: "",
  endTime: "",

});





// 計算日曆每一天的數據
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

  // 填充空白天數（上月剩餘的空格）
  for (let i = 0; i < startDayOfWeek; i++) {
    daysArray.push({ date: null, courses: [] });
  }

  // 填充當月日期
  for (let i = 1; i <= endOfMonth.getDate(); i++) {
    const date = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      i
    );

    const dateKey = date.toDateString();
    daysArray.push({
      date,
      courses: groupedCourses.value[dateKey] || [],
    });
  }

  return daysArray;
});

// 當前月份與年份
const currentMonth = computed(() =>
  currentDate.value.toLocaleString("default", { month: "long" })
);
const currentYear = computed(() => currentDate.value.getFullYear());

const isToday = (date) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
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



const previousMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1);
  currentDate.value = new Date(currentDate.value);
  fetchCourses(); // 切換月份時重新獲取數據
};

const nextMonth = () => {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1);
  currentDate.value = new Date(currentDate.value);
  fetchCourses(); // 切換月份時重新獲取數據
};

const viewDetails = (day) => {
  if (!day.date) return; // 如果日期為空，直接返回
  selectedDate.value = day.date.toDateString(); // 設定選中的日期
  selectedCourses.value = day.courses.sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  ); // 按開始時間排序課程
  dialogVisible.value = true; // 顯示彈窗
};

// 從後端獲取課程數據
const fetchCourses = async () => {
  try {
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

    const response = await axios.get("http://localhost:8082/schedules", {
      params: {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      },
    });

    console.log("後端返回的數據:", response.data); // 檢查返回數據
    courses.value = response.data.map(course => ({
      ...course,
      currentParticipants: course.currentParticipants || 0,  // ✅ 確保預約人數
      maxParticipants: course.maxParticipants || 10,        // ✅ 確保最大人數
    }));
  } catch (error) {
    console.error("無法獲取課程數據：", error);
  }
};



//編輯與刪除
// 打開修改彈窗，並填充數據
const editCourse = (scheduleId) => {
  const schedule = courses.value.find((c) => c.scheduleId === scheduleId);
  if (schedule) {
    console.log("選中的排程：", schedule); // 確認選中的數據是否正確

    editSchedule.value = {
      scheduleId: schedule.scheduleId,
      course: { courseID: schedule.course.courseID, courseName: schedule.course.courseName },
      coach: { empno: schedule.coach.empno, ename: schedule.coach.ename },
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    };
    editDialogVisible.value = true;
  } else {
    console.error("找不到對應的排程，scheduleId：", scheduleId);
  }
};


// 關閉修改彈窗
const closeEditDialog = () => {
  editDialogVisible.value = false;
};

// 儲存修改後的數據
const saveEditedSchedule = async () => {
  try {
    await axios.put(`http://localhost:8082/schedules/${editSchedule.value.scheduleId}`, {
      courseID: editSchedule.value.course.courseID,
      empno: editSchedule.value.coach.empno,
      startTime: editSchedule.value.startTime,
      endTime: editSchedule.value.endTime,
    });

    alert("課程修改成功！");
    editDialogVisible.value = false;
    fetchCourses(); // 重新獲取課程數據，刷新日曆
  } catch (error) {
    console.error("修改課程失敗：", error);
    alert("修改失敗，請稍後再試！");
  }
};

const deleteCourse = async (scheduleId) => {
  console.log("刪除課程，scheduleId：", scheduleId);
  if (confirm(`確定要刪除此課程嗎？`)) {
    try {
      // 假設後端支持按 scheduleId 刪除課程
      await axios.delete(`http://localhost:8082/schedules/${scheduleId}`);
      // 刪除成功後刷新數據
      fetchCourses();
    } catch (error) {
      console.error("刪除課程失敗：", error);
      alert("刪除失敗，請稍後再試！");
    }
  }
};

// 獲取教練與課程資料
const fetchDropdownData = async () => {
  try {
    const [coachResponse, courseResponse] = await Promise.all([
      axios.get('http://localhost:8082/schedules/coaches'),
      axios.get('http://localhost:8082/courses/getAll')
    ]);
    coaches.value = coachResponse.data;
    coursesList.value = courseResponse.data.map(course => ({
      title: course.courseName,
      value: course.courseID
    }));
  } catch (error) {
    console.error('無法獲取資料：', error);
  }
};


const toggleCancel = async (course) => {
  try {
    if (course.status === "已結束") {
      throw new Error("此課程已結束，無法更改狀態！");
    }

    if (course.status === "停課") {
      // 調用恢復 API
      await axios.put(`http://localhost:8082/schedules/restore/${course.scheduleId}`);
      course.status = "未開始"; // 恢復課程
    } else {
      // 調用停課 API
      await axios.put(`http://localhost:8082/schedules/cancel/${course.scheduleId}`);
      course.status = "停課"; // 變成停課狀態
    }

    // 更新前端 UI
    selectedCourses.value = selectedCourses.value.map((c) =>
      c.scheduleId === course.scheduleId ? { ...c, status: course.status } : c
    );

    await fetchCourses(); // 更新日曆顯示
  } catch (error) {
    console.error("狀態變更失敗：", error);
    alert(error.response?.data?.message || "操作失敗，請稍後再試！");
  }
};


// 初始化時調用
onMounted(() => {
  fetchCourses();        // 原本抓排程
  fetchDropdownData();   // 新增抓教練與課程清單
});
</script>

<style scoped>
.calendar-card {
  background-color: #2c2c2c !important;
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

.month-title {
  color: #f36c0b;
  font-size: 1.5rem;
  margin: 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-name {
  text-align: center;
  padding: 10px;
  font-weight: bold;
  color: #f36c0b;
}

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

.current-day {
  border: 2px solid #f36c0b;
}

.empty-day {
  background: #2c2c2c;
}

.date-number {
  display: block;
  text-align: right;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.course-list {
  margin-top: 8px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px;
  margin: 2px 0;
  font-size: 0.8rem;
}

.course-name {
  color: #a79990;
  font-size:8px !important;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.not-started {
  background: #9e9e9e;
}

.in-progress {
  background: #4caf50;
}

.completed {
  background: #f44336;
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
  color: #615b5b !important;
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

.course-details {
  flex: 1;
}

.course-info {
  margin: 5px 0;
  color: #e0e0e0;
}

.course-info strong {
  color: #f36c0b !important;
}

.course-actions {
  margin-top: 20px;
  display: flex;
  /* width: 50%; */
  flex-direction: row;
  justify-content: space-around;
  gap: 8px;
}

:deep(.v-field) {
  background-color: #333 !important;
  color: #e0e0e0 !important;
}

:deep(.v-label) {
  color: #a79990 !important;
}

:deep(.v-overlay__content) {
  box-shadow: none !important;
  background-color: transparent !important;
}


:deep(.v-card),
:deep(.dialog-card) {
  box-shadow: none !important;
  border: none !important;
}

.v-list {
  background-color: #2c2c2c;
}

:deep(.v-text-field input[type="datetime-local"]) {
  color: #e0e0e0 !important;
  background-color: #333 !important;
}

/* 修改瀏覽器原生日期選擇器的樣式 */
:deep(input[type="datetime-local"]::-webkit-calendar-picker-indicator) {
  filter: invert(0.8) sepia(100%) saturate(2000%) hue-rotate(10deg);

  cursor: pointer;
}

:deep(input[type="datetime-local"]) {
  color-scheme: dark;

}

:deep(.v-field:hover .v-field__outline) {
  color: #f36c0b !important;
}

:deep(.v-select:hover .v-field__outline) {
  color: #f36c0b !important;
}

:deep(.v-field--focused .v-field__outline) {
  color: #f36c0b !important;
}

:deep(.v-field--focused .v-label) {
  color: #f36c0b !important;
}

.status-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 10px;
  margin-left: 5px;
  vertical-align: middle;
}

.cancelled-icon {
  color: red;
  font-size: 12px;
  font-weight: bold;
}

.cancelled-text {
  color: rgb(222, 59, 59);
  font-weight: bold;
  margin-left: 5px;
  font-size: 16px;
}

.v-list{
    background-color: transparent !important ;
}
  

  .user-list-item {
  background-color: #524E49; /* 修改為更明顯的淺藍色背景 */
  padding: 20px 10px !important;
  border-radius: 5px;
  margin-bottom: 5px;
}

.user-name {
  color: #ff5722; /* 設為鮮豔的橙色 */
  font-weight: bold;
}

.user-username {
  color: white; /* 或者其他你想要的顏色 */
}


</style>