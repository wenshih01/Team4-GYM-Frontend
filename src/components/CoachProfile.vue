<template>
    <div class="container">
      <div class="coach-info">
        <img :src="coach.photo" alt="教練照片" class="coach-photo" />
        <div class="coach-text">
          <h1>{{ coach.ename }} </h1>
          <p><strong>綽號：</strong>{{ coach.nickname }}</p>
          <p><strong>職稱：</strong>{{ coach.title }}</p>
          <p><strong>專長：</strong>{{ coach.skill }}</p>
          <p><strong>經驗：</strong>{{ coach.experience }}</p>
          
          <v-btn color="green" @click="openCalendar" style="margin-top: 20px;">
  <v-icon>mdi-calendar</v-icon> 查看教練課表
</v-btn>

        </div>
      </div>
    </div>
    
    <CoachSchedule2 v-model:show="calendarDialog"  
      :coachName="coach.ename"
      :schedules="coachSchedules"
      @close="calendarDialog = false"></CoachSchedule2>
</template>

<script>
import axios from "axios";
import CoachSchedule2 from "./CoachSchedule2.vue";

export default {
  components: {
    CoachSchedule2
  },
  data() {
    return {
      coach: {},
      calendarDialog: false,
      coachSchedules: []
    };
  },
  created() {
    this.fetchCoachDetail();
  },
  methods: {
    async fetchCoachDetail() {
      const empno = this.$route.params.empno;
      try {
        const response = await axios.get(`http://localhost:8082/coaches/find/${empno}`);
        this.coach = response.data;
      } catch (error) {
        console.error("載入教練詳細資訊失敗", error);
      }
    },
    async openCalendar() {
      try {
        console.log("✅ openCalendar() 被觸發！");
        const response = await axios.get(`http://localhost:8082/coaches/${this.coach.empno}/schedules`);
        this.coachSchedules = response.data;
        this.calendarDialog = true; // 開啟彈窗
      } catch (error) {
        console.error("獲取課程失敗:", error);
        alert("無法載入課程資訊");
      }
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  padding: 20px;
  display: flex;
  justify-content: center;
  margin-top: 100px;
}

.coach-photo {
  width: 50%;
  max-width: 300px;
  height: auto;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid #ddd;
}

.coach-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.coach-text {
  flex: 1;
  text-align: left;
  margin-left: 30px;
}

.coach-text h1 {
  margin-bottom: 20px;
}

.coach-text p {
  display: flex;
  align-items: center;
}

.coach-text p strong {
  width: 80px;
  text-align: left;
}


</style>