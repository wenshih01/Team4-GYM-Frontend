<template>
    <div>
      <div class="top-bar">
        <v-text-field
          v-model="search"
          label="以課程稱搜尋"
          append-icon="mdi-magnify"
          outlined
          clearable
          @keyup.enter="executeSearch"
          @click:append="executeSearch"
        ></v-text-field>
  
        <v-btn color="primary" @click="openNew">新增排程</v-btn>
      </div>
      <br>

      <v-btn color="primary" @click="goToSchedule">
       切換到未開始排程
      </v-btn>
      
      
  
      <!-- DataTable -->
      <v-data-table
  :headers="headers"
  :items="schedules"
  item-value="scheduleId"
  class="elevation-1 custom-table"
  dense
  fixed-header
  alternate-row
>
  <template v-slot:[`item.startTime`]="{ item }">
    {{ item.formattedStartTime }}
  </template>

  <template v-slot:[`item.endTime`]="{ item }">
    {{ item.formattedEndTime }}
  </template>

  <template v-slot:[`item.actions`]="{ item }">
    <div class="actions-container">
      <v-btn icon color="primary" size="small" class="btnEdit" @click="editDetail(item)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon color="red" size="small" @click="deleteDetail(item.scheduleId)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>

      <v-btn
              icon
              :color="item.status === '停課' ? 'green' : 'orange'"
              size="small"
              @click="toggleCancel(item)"
            >
              <v-icon>
                {{ item.status === '停課' ? 'mdi-reload' : 'mdi-cancel' }}
              </v-icon>
            </v-btn>
    </div>
  </template>
</v-data-table>

      
  
      <!-- Dialog -->
      <v-dialog v-model="detailDialog" max-width="600px">
        <v-card>
          <v-card-title>{{
            isEdit ? "編輯排程" : "新增排程"
          }}</v-card-title>
          <v-card-text>
            <v-select
                label="選擇教練"
                :items="coaches"
                item-title="ename"  
                item-value="empno" 
                v-model="schedule.coach.empno"
                outlined
                clearable
              ></v-select>

              <v-select
                label="選擇課程"
                :items="courses"
                item-title="courseName"  
                item-value="courseID"   
                v-model="schedule.course.courseId"
                outlined
                clearable
              ></v-select>
              <v-text-field
                label="最大報名人數"
                v-model="schedule.maxParticipants"
                outlined
                clearable
                type="number"
                min="1"
              ></v-text-field>

              <v-select  
  label="開始時間"
  :items="timeOptions"  
  v-model="startTime"
  outlined
  clearable
  @update:modelValue="updateEndTime"  
></v-select>

<v-select  
  label="結束時間"
  :items="timeOptions" 
  v-model="endTime"
  outlined
  clearable
></v-select>
            <v-text-field
              label="開始日期"
              v-model="startDate"
              outlined
              clearable
              type="date"
            />
            <v-text-field
              label="結束日期"
              v-model="endDate"
              outlined
              clearable
              type="date"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn color="white" text @click="hideDialog">取消</v-btn>
            <v-btn color="orange" text @click="saveDetail">儲存</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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

const errorDialog = ref(false);        // 控制錯誤訊息彈窗的開關
const errorMessage = ref("");         // 儲存要在彈窗中顯示的錯誤訊息

const schedules = ref([]);  
const coaches = ref([]);
const courses = ref([]);
const startDate = ref("");
const endDate = ref("");


const startTime = ref("");  // 開始時間
const endTime = ref("");    // 結束時間

// 時間選項 (僅允許整點)
const timeOptions = ref([
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", 
  "18:00", "19:00", "20:00", "21:00", "22:00"
]);

// 當選擇開始時間時，自動設定結束時間 +1 小時
const updateEndTime = () => {
  if (startTime.value) {
    const index = timeOptions.value.indexOf(startTime.value);
    if (index !== -1 && index < timeOptions.value.length - 1) {
      endTime.value = timeOptions.value[index + 1];  // 結束時間 +1 小時
    } else {
      endTime.value = ""; // 如果已是最後一個選項，則不自動填入
    }
  }
};



const fetchDropdownData = async () => {
  try {
    const [coachResponse, courseResponse] = await Promise.all([
      axios.get("http://localhost:8082/schedules/coaches"),
      axios.get("http://localhost:8082/schedules/courses"),
    ]);
    coaches.value = coachResponse.data;
    console.log("coaches =>", coaches.value); 
    courses.value = courseResponse.data;
    console.log("courses =>", courses.value);
  } catch (error) {
    console.error("無法獲取教練或課程資料：", error);
  }
};
onMounted(() => {
  fetchDetails(); // 獲取所有排程資料
  fetchDropdownData(); // 獲取教練與課程資料
});
// 資料
const schedule = ref({
  scheduleId: null,
  course: {
    courseId: null,
    courseName: "",
  },
  coach: {
    empno: null,
    coachName: "",
  },
  startTime: "",
  endTime: "",
  status: "",
  maxParticipants: 10,  
  currentParticipants: 0, 
});
// 單筆 PlanDetail 資料
const detailDialog = ref(false); // 控制 Dialog 開關
const isEdit = ref(false); // 判斷是否為編輯模式
const search = ref(""); // 搜尋欄的內容

// 表格標題
const headers = ref([
  { title: "排程 ID", value: "scheduleId" },
  { title: "課程名稱", value: "course.courseName" },
  { title: "教練名稱", value: "coach.ename" },
  { title: "開始時間", value: "startTime" },
  { title: "結束時間", value: "endTime" },
  { title: "狀態", value: "status" },
  { title: "目前報名人數", value: "currentParticipants" },  
  { title: "最大報名人數", value: "maxParticipants" }, 

  { title: "操作", value: "actions", sortable: false },
]);


const formatDateTime = (date) => {
  if (!date) return "無資料";
  const d = new Date(date);
  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,  // 使用 24 小時制
  }).replace(/\//g, "-"); // 轉換 "/" 為 "-"
};

const fetchDetails = async () => {
  try {
    const response = await axios.get("http://localhost:8082/schedules");

    const now = new Date();

    schedules.value = response.data
      .map(schedule => ({
        ...schedule,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
        formattedStartTime: formatDateTime(schedule.startTime), // 確保格式化時間
        formattedEndTime: formatDateTime(schedule.endTime),
      }))
      .filter(schedule => schedule.startTime <= now) 
      .sort((a, b) => a.startTime - b.startTime);

  } catch (error) {
    console.error("無法獲取排程資料：", error);
  }
};





// 搜尋排程
const executeSearch = async () => {
  try {
    const response = await axios.get("http://localhost:8082/schedules", {
      params: { courseName: search.value },
    });
    schedules.value = response.data; // 更新 schedules
    if (schedules.value.length === 0) {
      alert("未找到符合條件的排程！");
    }
  } catch (error) {
    console.error("搜尋排程失敗：", error);
  }
};







// 打開新增排程對話框
const openNew = () => {
  schedule.value = {
    scheduleId: null,
    course: { courseId: null, courseName: "" },
    coach: { empno: null, ename: "" },
    startTime: "",
    endTime: "",
    status: "",
  };
  isEdit.value = false;
  detailDialog.value = true;
};

// 編輯排程
const editDetail = (selectedSchedule) => {
  schedule.value = { ...selectedSchedule };
  isEdit.value = true;
  detailDialog.value = true;
};

// 關閉對話框
const hideDialog = () => {
  detailDialog.value = false;
};

// 儲存排程（新增或編輯）
const saveDetail = async () => {
  try {
    if (!startDate.value || !startTime.value || !endTime.value) {
      errorMessage.value = "請選擇開始日期、開始時間和結束時間！";
      errorDialog.value = true;
      return;
    }

    const formattedStartTime = `${startDate.value}T${startTime.value}:00`;
    const formattedEndTime = `${startDate.value}T${endTime.value}:00`;

    const requestData = {
      courseId: schedule.value.course.courseId,
      empno: schedule.value.coach.empno,
      startTime: formattedStartTime,  // ✅ 確保是完整的 ISO 8601 格式
      endTime: formattedEndTime,      // ✅ 確保是完整的 ISO 8601 格式
      status: schedule.value.status,
      maxParticipants: schedule.value.maxParticipants,
    };

    if (startDate.value && endDate.value && startDate.value !== endDate.value) {
      // 重複排程
      await axios.post(
        "http://localhost:8082/schedules/recurring",
        requestData,
        { params: { startDate: startDate.value, endDate: endDate.value } }
      );
    } else {
      // 單次排程
      await axios.post("http://localhost:8082/schedules", requestData);
    }

    await fetchDetails(); 
    hideDialog();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message;
    errorDialog.value = true;
  }
};



// 刪除排程
const deleteDetail = async (id) => {
  try {
    if (confirm("確定要刪除此排程嗎？")) {
      await axios.delete(`http://localhost:8082/schedules/${id}`);
      await fetchDetails(); // 確保刪除後刷新 schedules
    }
  } catch (error) {
    alert("刪除失敗，請稍後再試！");
    console.error("刪除排程失敗：", error);
  }
};

const toggleCancel = async (item) => {
  try {
    if (item.status === "已結束") {
      throw new Error("此課程已結束，無法更改狀態！");
    }

    if (item.manualStatus === "停課") {
      // 調用恢復 API
      await axios.put(`http://localhost:8082/schedules/restore/${item.scheduleId}`);
      item.manualStatus = null;
      item.status = "未開始"; // 假設恢復後狀態為 "未開始"
    } else {
      // 調用取消 API
      await axios.put(`http://localhost:8082/schedules/cancel/${item.scheduleId}`);
      item.manualStatus = "停課";
      item.status = "停課";
    }

    // 更新前端 UI
    schedules.value = schedules.value.map((s) =>
      s.scheduleId === item.scheduleId ? { ...s, ...item } : s
    );
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message;
    errorDialog.value = true; // 顯示錯誤彈窗
  }
};

const goToSchedule = () => {
  router.push("/admin/schedule"); // 
};



// 初始化時獲取資料
onMounted(fetchDetails);
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
  