<template>
  <div>
    <div class="top-bar">
      <v-text-field
        v-model="search"
        label="以教練名稱搜尋"
        append-icon="mdi-magnify"
        outlined
        clearable
        @keyup.enter="executeSearch"
        @click:append="executeSearch"
      ></v-text-field>

      <v-btn color="primary" @click="openNew">新增教練</v-btn>
    </div>

    <!-- DataTable -->
    <v-data-table
      :headers="headers"
      :items="coaches"
      item-value="empno"
      class="elevation-1 custom-table"
      dense
      fixed-header
      alternate-row
    >
      <!-- 照片欄位 -->
      <template v-slot:[`item.photo`]="{ item }">
  <img
    :src="item.photo"
    alt="教練照片"
    style="max-width: 100px; height: auto;"
    v-if="item.photo"
  />
</template>

      <!-- 操作欄位 -->
      <template v-slot:[`item.actions`]="{ item }">
        <div class="actions-container">
          <v-btn
            icon
            color="primary"
            size="small"
            class="btnEdit"
            @click="editCoach(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon color="red" size="small" @click="deleteCoach(item.empno)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-btn icon color="green" size="small" @click="openCalendar(item)">
      <v-icon>mdi-calendar</v-icon>
    </v-btn>
        </div>
      </template>
    </v-data-table>



    <!-- Dialog -->
    <CoachSchedule
    v-model:show="calendarDialog"  
      :schedules="coachSchedules"    
      :coachName="selectedCoachName" 
      @close="onCalendarClose"></CoachSchedule>
        


      <v-dialog v-model="coachDialog" max-width="600px">
            <v-card class="dialog-card"> <!-- ✅ 新增 class -->
              <v-card-title class="dialog-title"> 
                {{ isEdit ? "編輯教練" : "新增教練" }}
              </v-card-title>
              <v-card-text class="dialog-content"> <!-- ✅ 新增 class -->
                <v-text-field label="教練編號" v-model="coach.empno" outlined clearable :readonly="isEdit"></v-text-field>
                <v-text-field label="姓名" v-model="coach.ename" outlined clearable></v-text-field>
                <v-text-field label="暱稱" v-model="coach.nickname" outlined clearable></v-text-field>
                <v-text-field label="薪水" v-model="coach.salary" outlined clearable></v-text-field>
                <v-text-field label="聘用日期" v-model="coach.hiredate" outlined clearable type="date"></v-text-field>
                <v-text-field label="職稱" v-model="coach.title" outlined clearable></v-text-field>
                <v-text-field label="技能" v-model="coach.skill" outlined clearable></v-text-field>

                <!-- 照片上傳 -->
                <v-file-input label="上傳照片" v-model="coach.photo" outlined clearable accept="image/*"></v-file-input>

                <v-text-field label="經驗" v-model="coach.experience" outlined clearable></v-text-field>
              </v-card-text>

              <v-card-actions>
                <v-btn color="white" text @click="hideDialog">取消</v-btn>
                <v-btn color="orange" text @click="saveCoach">儲存</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import CoachSchedule from "./CoachSchedule.vue";

// 資料
const coaches = ref([]); // Coach 資料列表
const coach = ref({}); // 單筆 Coach 資料
const coachDialog = ref(false); // 控制 Dialog 開關
const isEdit = ref(false); // 判斷是否為編輯模式
const search = ref(""); // 搜尋欄的內容


const coachSchedules = ref([])        // 存「單一教練」的排程
const selectedCoachName = ref('')     // 單一教練的姓名
const calendarDialog = ref(false)     // 控制子元件 CoachSchedule 的顯示/隱藏
  


// 表格標題
const headers = ref([
  { title: "教練編號", value: "empno" },
  { title: "姓名", value: "ename" },
  { title: "暱稱", value: "nickname" },
  { title: "薪水", value: "salary" },
  { title: "聘用日期", value: "hiredate" },
  { title: "職稱", value: "title" },
  { title: "技能", value: "skill" },
  { title: "照片", value: "photo" },
  { title: "操作", value: "actions", sortable: false },
]);

// 處理照片上傳




// 獲取所有 Coach 資料
const fetchCoaches = async () => {
  try {
    const response = await axios.get("http://localhost:8082/coaches/findAll");
    coaches.value = response.data;
  } catch (error) {
    console.error("無法獲取教練資料：", error);
  }
};

// 搜尋特定教練
const executeSearch = async () => {
  try {
    const response = await axios.get("http://localhost:8082/coaches/searchByName", {
      params: { ename: search.value },
    });
    coaches.value = response.data;
  } catch (error) {
    console.error("搜尋教練失敗：", error);
  }
};


// 打開新增教練對話框
const openNew = () => {
  console.log("🔹 openNew() 被觸發！"); // 確保函數有執行

  // ✅ 確保初始化 coach.value
  coach.value = {
    empno: "",
    ename: "",
    nickname: "",
    salary: "",
    hiredate: "",
    title: "",
    skill: "",
    photo: "", // ✅ 設為空字串，避免 v-file-input 出錯
    experience: "",
  };

  isEdit.value = false; // 設為新增模式
  coachDialog.value = true; // 打開對話框

  console.log("🔹 coachDialog: ", coachDialog.value);
};


// 編輯教練
const editCoach = (selectedCoach) => {
  coach.value = { ...selectedCoach };
  isEdit.value = true;
  coachDialog.value = true;
};

// 關閉對話框
const hideDialog = () => {
  coachDialog.value = false;
};

// 儲存教練（新增或編輯）
const saveCoach = async () => {
  try {
    const formData = new FormData();

    // 附加所有教練資料
    Object.keys(coach.value).forEach((key) => {
      if (key === "photo" && coach.value.photo instanceof File) {
       formData.append(key, coach.value.photo);
        } else {
       formData.append(key, coach.value[key]);
        }
    });

    // 打印 FormData 的內容
    console.log("FormData 內容：");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    if (isEdit.value) {
      await axios.put(`http://localhost:8082/coaches/update/${coach.value.empno}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await axios.post("http://localhost:8082/coaches/insert", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    await fetchCoaches();
    hideDialog();
    alert("操作成功！");
  } catch (error) {
    console.error("操作失敗：", error);
    alert("操作失敗，請稍後再試！");
  }
};



// 刪除教練
const deleteCoach = async (empno) => {
  const confirmed = window.confirm("確定要刪除此教練嗎？");
  if (!confirmed) return; // 如果用戶取消操作，直接返回

  try {
    // 發送 DELETE 請求
    await axios.delete("http://localhost:8082/coaches/DeleteEmp", {
      params: { empno },
    });

    // 成功後重新載入列表
    await fetchCoaches();
    alert(`教練編號 ${empno} 已刪除成功`);
  } catch (error) {
    console.error("刪除教練失敗：", error);
    alert("刪除失敗，請稍後再試");
  }
};


const openCalendar = async (coachItem) => {
  try {
    // 呼叫後端取得該教練所有排程
    const res = await axios.get(`http://localhost:8082/coaches/${coachItem.empno}/schedules`)
    coachSchedules.value = res.data
    selectedCoachName.value = coachItem.ename
    // 打開 CoachSchedule 子元件的彈窗
    calendarDialog.value = true
  } catch (err) {
    console.error("取得教練課程失敗:", err)
    alert("取得課程失敗，請稍後再試！")
  }
}

// 監聽子元件的 @close 事件
const onCalendarClose = () => {
  console.log("子元件 CoachSchedule 被關閉了")
  // 你也可以在這裡做其他事情，例如清空 coachSchedules
  // coachSchedules.value = []
}


// 初始化時獲取資料
onMounted(fetchCoaches);
</script>

<style scoped>
/* 與原來樣式保持一致 */
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


.dialog-card {
  background-color: #2c2c2c !important;
}

.dialog-title {
  background-color: #3c3c3c !important;
  color: rgb(245, 118, 34) !important;
  padding: 16px !important;
}

.dialog-content {
  padding: 32px 24px !important;
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

/* ✅ 修改按鈕樣式 */
.v-card-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
}

.v-btn {
  margin-left: 10px;
}
</style>
