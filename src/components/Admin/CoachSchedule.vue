<template>
  <!-- 主對話框：顯示月曆 -->
  <v-dialog v-model="internalShow" max-width="900px">
    <v-card class="calendar-card">
      <!-- 如果 schedules 不為空 → 顯示月曆 -->
      <template v-if="schedules.length > 0">
        <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; color: orange;">{{ coachName }} 的課程月曆</h2>
          <v-btn color="orange" text @click="closeDialog">關閉</v-btn>
        </div>

        <div class="calendar">
          <div class="calendar-header">
            <v-btn icon="mdi-chevron-left" @click="previousMonth" color="orange" />
            <h2 class="month-title">{{ currentMonth }} {{ currentYear }}</h2>
            <v-btn icon="mdi-chevron-right" @click="nextMonth" color="orange" />
          </div>

          <div class="calendar-grid">
            <!-- 星期抬頭 -->
            <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>

            <!-- 日期格子 -->
            <div
              class="day"
              v-for="(day, index) in days"
              :key="index"
              :class="{ 'current-day': isToday(day.date), 'empty-day': !day.date }"
              @click="openDetails(day)"
            >
              <span class="date-number">{{ day.date ? day.date.getDate() : '' }}</span>

              <div v-if="day.courses.length > 0" class="course-list">
                <div v-for="(course, i) in day.courses" :key="i" class="course-item">
                  <span class="course-name">{{ course.name }}</span>

                  <!-- ✅ 如果課程停課，顯示紅色叉叉 (✖) -->
                  <span v-if="course.status === '停課'" class="status-icon cancelled-icon">✖</span>

                  <!-- ✅ 否則顯示正常的狀態指示圓點 -->
                  <span v-else class="status-icon status-indicator" :class="getStatusClass(course.status)"></span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </template>

      <!-- 如果 schedules 為空 → 顯示無課程提示 -->
      <template v-else>
        <div class="no-course-container">
          <h2 style="color: orange;">{{ coachName }} 尚未安排任何課程</h2>
          <v-btn color="orange" text @click="closeDialog">關閉</v-btn>
        </div>
      </template>
    </v-card>
  </v-dialog>

  <!-- 第二個對話框：顯示當天課程詳情 (無編輯、刪除) -->
  <v-dialog v-model="detailsDialogVisible" max-width="600px">
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
            </div>
          </v-list-item>
        </v-list>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="orange" text @click="detailsDialogVisible = false">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";

// 從父元件傳入的參數
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  schedules: {
    type: Array,
    default: () => []
  },
  coachName: {
    type: String,
    default: ""
  }
});

// 用來向父元件發事件
const emit = defineEmits(["update:show", "close"]);

// 1. 主對話框控制
const internalShow = ref(props.show);
watch(
  () => props.show,
  (newVal) => {
    internalShow.value = newVal;
  }
);
watch(internalShow, (newVal) => {
  if (!newVal) {
    emit("update:show", false);
    emit("close");
  }
});
const closeDialog = () => {
  internalShow.value = false;
};

// 2. 月曆相關
const currentDate = ref(new Date());
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 分組
const groupedCourses = computed(() => {
  const groups = {};
  props.schedules.forEach((schedule) => {
    const dateKey = new Date(schedule.startTime).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push({
      scheduleId: schedule.scheduleId,
      name: schedule.course?.courseName || "未知課程",
      coach: schedule.coach?.ename || "未知教練",
      status: schedule.status,
      startTime: schedule.startTime,
      endTime: schedule.endTime
    });
  });
  return groups;
});

// 生成該月日期
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
    daysArray.push({ date: null, courses: [] });
  }
  for (let d = 1; d <= endOfMonth.getDate(); d++) {
    const date = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      d
    );
    const dateKey = date.toDateString();
    daysArray.push({
      date,
      courses: groupedCourses.value[dateKey] || []
    });
  }
  return daysArray;
});

const currentMonth = computed(() =>
  currentDate.value.toLocaleString("default", { month: "long" })
);
const currentYear = computed(() => currentDate.value.getFullYear());

function isToday(date) {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getStatusClass(status) {
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
}

function previousMonth() {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1);
  currentDate.value = new Date(currentDate.value);
}

function nextMonth() {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1);
  currentDate.value = new Date(currentDate.value);
}

// 3. 當天課程詳情對話框
const detailsDialogVisible = ref(false);
const selectedDate = ref("");
const selectedCourses = ref([]);

function openDetails(day) {
  if (!day.date) return;
  selectedDate.value = day.date.toDateString();
  // 按開始時間排序
  selectedCourses.value = day.courses.sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
  detailsDialogVisible.value = true;
}

// 4. 簡單的時間格式化 (若有需要)
function formatDateTime(dateTimeStr) {
  // e.g. 2025-01-25T13:00:00 => "2025-01-25 13:00"
  return dateTimeStr.replace("T", " ").substring(0, 16);
}
</script>

<style scoped>
/* 盡量沿用你提供的「參考 component」的深色外觀 */

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
  font-size: 8px; 
  font-weight: bold;
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

/* 無課程容器 */
.no-course-container {
  text-align: center;
  padding: 40px;
}

/* 以下是對話框的深色樣式，盡量模仿參考碼 */
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

:deep(.dialog-card) {
  background-color: #2c2c2c !important;
}

:deep(.dialog-title) {
  background-color: #3c3c3c !important;
  color: #f36c0b !important;
}

:deep(.dialog-content) {
  background-color: #2c2c2c !important;
  color: #e0e0e0 !important;
}

/* 如果有列表/列表項 */
:deep(.v-list) {
  background-color: #2c2c2c !important;
}

:deep(.v-list-item) {
  background-color: #2c2c2c !important;
  color: #e0e0e0 !important;
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
  width: 10px;  
  height: 10px;
  margin-left: 5px; 
  vertical-align: middle; 
}



</style>
