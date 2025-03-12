<template>
  <!-- 日曆對話框 -->
  <v-dialog
    :model-value="modelValue"
    max-width="800px"
    @update:model-value="$emit('update:model-value', $event)"
  >
    <v-card class="calendar-card">
      <!-- 月曆標題區 -->
      <div class="calendar">
        <div class="calendar-header">
          <v-btn
            icon="mdi-chevron-left"
            @click="previousMonth"
            color="orange"
          />
          <h2 class="month-title">{{ currentMonth }} {{ currentYear }}</h2>
          <v-btn icon="mdi-chevron-right" @click="nextMonth" color="orange" />
        </div>
        <!-- 日曆格子 -->
        <div class="calendar-grid">
          <div class="day-name" v-for="dayName in dayNames" :key="dayName">
            {{ dayName }}
          </div>
          <div
            class="day"
            v-for="(dayObj, index) in days"
            :key="index"
            :class="{
              'current-day': isToday(dayObj.dateObj),
              'empty-day': !dayObj.dateObj,
            }"
            @click="openDetails(dayObj)"
          >
            <span class="date-number">
              {{ dayObj.dateObj ? dayObj.dateObj.getDate() : "" }}
            </span>
            <!-- 顯示第一筆方案 (截斷) + (共X筆)，已移除 title -->
            <div v-if="dayObj.records.length" class="plan-name">
              {{ dayObj.records[0].planName }} 等 ({{ dayObj.records.length }}
              筆)
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- 顯示某天所有紀錄的對話框 -->
    <v-dialog v-model="showDetails" max-width="500px">
      <v-card class="details-card">
        <v-card-title>{{ selectedDateStr }} 訓練紀錄</v-card-title>
        <v-card-text>
          <!-- 若當日有紀錄就列出，否則顯示「無紀錄」 -->
          <div v-if="dailyRecords.length">
            <div
              v-for="(rec, idx) in dailyRecords"
              :key="rec.id"
              class="record-item"
            >
              <div class="record-row">
                <!-- 左側文字：方案 + 卡路里 -->
                <div class="record-info">
                  <p>
                    {{ rec.planName }} ({{ rec.planTotalCalories }}
                    cal)
                  </p>
                </div>
                <!-- 右側按鈕群 -->
                <div class="record-actions">
                  <v-btn color="red" @click="deleteRecord(rec.id)">刪除</v-btn>
                </div>
              </div>
              <v-divider v-if="idx < dailyRecords.length - 1" />
            </div>
          </div>
          <div v-else>
            <p>無紀錄</p>
          </div>
        </v-card-text>
        <!-- 左下角顯示總熱量，右側顯示按鈕 -->
        <v-card-actions class="actions-row">
          <div class="left-actions">
            <div class="total-calories" v-if="dailyRecords.length">
              總熱量：{{ dailyCalories }} cal
            </div>
          </div>
          <div class="right-actions">
            <v-btn color="orange" @click="openAddRecordDialog">新增紀錄</v-btn>
            <!-- 關閉按鈕字顏色改成橘色 (使用 variant=\"text\" 可只改文字顏色) -->
            <v-btn color="red" variant="text" @click="showDetails = false">
              關閉
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增紀錄對話框 -->
    <v-dialog v-model="showAddRecord" max-width="500px">
      <v-card class="add-record-card">
        <v-card-title>新增訓練紀錄</v-card-title>
        <v-card-text>
          <!-- 下拉選單顯示「方案名稱 (卡路里)」 -->
          <v-select
            v-model="selectedPlanId"
            :items="availablePlans"
            item-title="displayName"
            item-value="id"
            label="選擇訓練方案"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="red" @click="showAddRecord = false">取消</v-btn>
          <v-btn color="orange" @click="addExecutionRecord">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import axios from "axios";

// 父元件傳入: modelValue(控制對話框), memberId(會員ID)
const props = defineProps({
  modelValue: Boolean,
  memberId: [Number, String],
});
const emit = defineEmits(["update:model-value"]);

/* 狀態 */
const currentDate = ref(new Date()); // 月曆顯示
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const recordsMap = ref({});
const availablePlans = ref([]); // 下拉清單可用方案

/* 詳情對話框 */
const showDetails = ref(false);
const selectedDateStr = ref("");
const dailyRecords = ref([]);

/* 新增紀錄對話框 */
const showAddRecord = ref(false);
const selectedPlanId = ref(null);

/* 月份標題計算 */
const currentMonth = computed(() =>
  currentDate.value.toLocaleString("zh-TW", { month: "long" })
);
const currentYear = computed(() => currentDate.value.getFullYear());

/* 取得當天所有紀錄的卡路里加總 => 左下角顯示 */
const dailyCalories = computed(() => {
  return dailyRecords.value.reduce(
    (acc, item) => acc + item.planTotalCalories,
    0
  );
});

// 時區修正 => 'yyyy-MM-dd'
function formatLocalDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* 計算: 當月每一天 => days[] */
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

  const arr = [];
  const startDayOfWeek = startOfMonth.getDay();

  for (let i = 0; i < startDayOfWeek; i++) {
    arr.push({ dateObj: null, dateKey: "", records: [] });
  }

  for (let day = 1; day <= endOfMonth.getDate(); day++) {
    const dateObj = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth(),
      day
    );
    const dateKey = formatLocalDate(dateObj);
    const recs = recordsMap.value[dateKey] || [];
    arr.push({ dateObj, dateKey, records: recs });
  }
  return arr;
});

/* 監聽: memberId => 抓可用方案 & 紀錄 */
watch(
  () => props.memberId,
  (val) => {
    if (val) {
      fetchAvailablePlans();
      fetchAllRecords();
    }
  },
  { immediate: true }
);

/* 監聽: currentDate => 重抓紀錄 */
watch(
  currentDate,
  () => {
    fetchAllRecords();
  },
  { immediate: true }
);

/* 抓取紀錄 => recordsMap */
async function fetchAllRecords() {
  if (!props.memberId) return;
  try {
    const res = await axios.get("/api/executionRecords/searchByMemberId", {
      params: { memberId: props.memberId },
    });
    const map = {};
    res.data.forEach((item) => {
      const dKey = item.executionDate; // 'yyyy-MM-dd'
      if (!map[dKey]) map[dKey] = [];
      map[dKey].push(item);
    });
    recordsMap.value = map;

    // 若已經在某天對話框，就同步更新
    if (selectedDateStr.value) {
      dailyRecords.value = map[selectedDateStr.value] || [];
    }
  } catch (err) {
    console.error("抓取訓練紀錄失敗:", err);
  }
}

/* 抓取可用的方案清單 => availablePlans */
async function fetchAvailablePlans() {
  if (!props.memberId) return;
  try {
    const res = await axios.get(`/api/plans/member/${props.memberId}`);
    // 針對每個方案，拼出 '方案名稱 (卡路里) ' => displayName
    const mapped = res.data.map((plan) => ({
      ...plan,
      displayName: `${plan.name} (${plan.totalCalories} cal)`,
    }));
    availablePlans.value = mapped;
  } catch (err) {
    console.error("抓取訓練方案失敗:", err);
  }
}

/* 點擊某一天 => 顯示該日詳情 */
function openDetails(dayObj) {
  if (!dayObj.dateObj) return;
  selectedDateStr.value = dayObj.dateKey;
  dailyRecords.value = dayObj.records;
  showDetails.value = true;
}

/* 新增紀錄 => POST */
function openAddRecordDialog() {
  selectedPlanId.value = null;
  showAddRecord.value = true;
}
async function addExecutionRecord() {
  if (!selectedPlanId.value || !selectedDateStr.value) return;
  try {
    await axios.post("/api/executionRecords", {
      memberId: props.memberId,
      planId: selectedPlanId.value,
      executionDate: selectedDateStr.value, // 'yyyy-MM-dd'
    });
    showAddRecord.value = false;
    await fetchAllRecords();
    dailyRecords.value = recordsMap.value[selectedDateStr.value] || [];
  } catch (err) {
    console.error("新增失敗:", err);
  }
}

/* 刪除紀錄 => DELETE */
async function deleteRecord(recordId) {
  try {
    await axios.delete(`/api/executionRecords/${recordId}`);
    await fetchAllRecords();
    dailyRecords.value = recordsMap.value[selectedDateStr.value] || [];
  } catch (err) {
    console.error("刪除失敗:", err);
  }
}

/* 切換月份 */
function previousMonth() {
  currentDate.value.setMonth(currentDate.value.getMonth() - 1);
  currentDate.value = new Date(currentDate.value);
}
function nextMonth() {
  currentDate.value.setMonth(currentDate.value.getMonth() + 1);
  currentDate.value = new Date(currentDate.value);
}

/* 是否為今天 */
function isToday(dateObj) {
  if (!dateObj) return false;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}
</script>

<style scoped>
.calendar-card {
  background-color: #2c2c2c;
  padding: 20px;
  border-radius: 12px;
}
.calendar {
  color: #e0e0e0;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.month-title {
  font-size: 1.5rem;
  color: #f36c0b;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.day-name {
  text-align: center;
  color: #f36c0b;
  font-weight: bold;
}
.day {
  background: #333;
  border-radius: 8px;
  padding: 10px;
  min-height: 100px;
  cursor: pointer;
  transition: background 0.2s;
}
.day:hover {
  background: #444;
}
.current-day {
  border: 2px solid #f36c0b;
}
.empty-day {
  background: #222;
}
.details-card {
  background-color: #222;
  color: #f36c0b;
  padding: 20px;
  text-align: center;
}
.add-record-card {
  background-color: #222;
  color: #f36c0b;
  padding: 20px;
  text-align: center;
}
.plan-name {
  margin-top: 5px;
  color: #f36c0b;
  font-weight: bold;
  display: inline-block;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 多筆紀錄分行 */
.record-item {
  margin-bottom: 16px;
}
/* 左邊文字、右邊按鈕 */
.record-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.record-info {
  text-align: left;
}
.record-actions {
  display: flex;
  gap: 8px;
}
.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
/* 左下角顯示 */
.left-actions {
  display: flex;
  align-items: center;
}
/* 右下角按鈕 */
.right-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.total-calories {
  font-weight: bold;
  color: #f36c0b;
}
</style>
