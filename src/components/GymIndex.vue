<template>
  <div class="gym-page">
    <div class="main-content">
      <header class="hero-section">
        <div class="hero-text">
          <p>BUILD MUSCLE.</p>
          <p>BURN CALORIES.</p>
          <p>GET RESULTS.</p>
          <p></p>

        </div>
        <!-- <div class="hero-buttons">
          <button class="btn join-now">Join Now</button>

        </div> -->
      </header>

      <!-- Statistics -->
      <section class="statistics">
        <div class="stat">
          <h2>3.2K</h2>
          <p>Members</p>
        </div>
        <div class="stat">
          <h2>349</h2>
          <p>Workouts</p>
        </div>
        <div class="stat">
          <h2>3.2</h2>
          <p>Average Rating</p>
        </div>
      </section>

      <section class="plan-card-wrapper">
        <h2 class="section-title">Memberships</h2>
        <div class="featured-posts">

          <PlanCard icon="mdi-trophy" title="Elite" price="NT$2,000/月" description="適合想要認真健身的你" :details="[
            '無限制使用所有器材',
            '每月4堂私人教練課程',
            '專業營養諮詢',
            '獨享會員優惠'
          ]" @learn-more="showPlanDetails" />
          <PlanCard icon="mdi-crown" title="Premium" price="NT$1,500/月" description="專業健身選擇"
            :details="['無限制使用所有器材', '專屬教練諮詢']" @learn-more="showPlanDetails" />
          <PlanCard icon="mdi-arm-flex" title="Basic" price="NT$800/月" description="最實惠的選擇"
            :details="['基本器材使用', '基礎課程諮詢']" @learn-more="showPlanDetails" />
        </div>
      </section>
    </div>

  </div>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card v-if="selectedPlan" color="#2c2c2c">
      <v-card-title class="text-orange">
        {{ selectedPlan?.title }} 會員方案詳情
      </v-card-title>
      <v-card-text class="text-white">
        <h3>特色功能</h3>
        <ul>
          <li v-for="feature in selectedPlan?.features" :key="feature">{{ feature }}</li>
        </ul>
        <h3>可用器材</h3>
        <ul>
          <li v-for="equip in selectedPlan?.equipment" :key="equip">{{ equip }}</li>
        </ul>
        <h3>課程</h3>
        <div v-if="selectedPlan?.classes?.length">
          <ul>
            <li v-for="class_ in selectedPlan.classes" :key="class_">{{ class_ }}</li>
          </ul>
        </div>
        <div v-else>無包含課程</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="orange" @click="dialog = false">關閉</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";
import PlanCard from "@/components/PlanCard.vue";
import Footer from "@/components/Footer.vue";

const dialog = ref(false);
const selectedPlan = ref(null);

const planDetails = {
  'Elite': {
    features: ['專屬更衣室', '免費停車', '24小時使用', '營養師諮詢', '個人化訓練計畫'],
    equipment: ['有氧器材', '重訓器材', '功能性訓練區', '瑜珈室'],
    trainers: true,
    classes: ['HIIT', '瑜珈', '飛輪', 'TRX']
  },
  'Premium': {
    features: ['24小時使用', '基本諮詢', '個人訓練空間'],
    equipment: ['有氧器材', '重訓器材'],
    trainers: true,
    classes: ['HIIT', '瑜珈']
  },
  'Basic': {
    features: ['基本設施使用'],
    equipment: ['有氧器材', '重訓器材'],
    trainers: false,
    classes: []
  }
};
const showPlanDetails = (title) => {
  console.log('title:', title); // 檢查 title
  selectedPlan.value = {
    title,
    ...planDetails[title]
  };
  console.log('selectedPlan:', selectedPlan.value); // 檢查資料
  dialog.value = true;
};
</script>

<style scoped>
.gym-page {
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  color: white;
  background-color: #1e1e1e;
  min-height: 100vh;
  max-width: 100%;
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  /* 撐滿寬度 */
  background-color: #000;
  z-index: 1000;
  padding: 10px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

}

.topbar ul {
  list-style: none;
  display: flex;
  gap: 20px;
  /* 控制項目間距 */
  margin: 0;
  padding: 0;
}

.topbar li {
  font-size: 18px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  /* 圖標和文字垂直居中 */
}

.topbar li i {
  margin-right: 8px;
}

.topbar li:hover {
  color: #ff961e;
}


.main-content {
  flex: 1;
  margin-top: 80px;
  padding: 20px;
}

/* Hero Section */
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  height: 420px;
  background: linear-gradient(to right, #3b3c3b, #000);
  background-image: url('/public/images/image2.png');
  background-size: cover;
  border-radius: 15px;
  margin-bottom: 20px;
}

.hero-text {
  position: absolute;
  bottom: 150px;
  left: 20px;
}

.hero-text h1 {
  font-size: 36px;
  color: #000;

}

.hero-text p {
  font-size: 50px;
  color: #070707;
  font-style: italic;
  font-family: "Teko", serif;
  font-weight: 600;
  line-height: 1;
  margin: 0;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #f2ebeb,
    -1px 1px 0 #000,
    1px 1px 0 #000;

}

.hero-buttons .btn {
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.hero-buttons .join-now {
  background-color: #ff961e;
  color: #000;
}

.hero-buttons .learn-more {
  background-color: #3b3c3b;
  color: #fff;
}

.hero-buttons .btn:hover {
  opacity: 0.8;
}

.hero-image {
  width: 150px;
  border-radius: 10px;
}

/* Statistics */
.statistics {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  background-color: #2e2e2e;
  padding: 15px;
  border-radius: 10px;
}

.stat h2 {
  font-size: 24px;
  margin: 0;
}

.stat p {
  font-size: 14px;
}


.plan-card-wrapper {
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  padding-top: 20px;
}

.featured-posts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.post {
  background-color: #3b3c3b;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
}

.post-image {
  max-width: 100%;
  border-radius: 10px;
  margin-bottom: 10px;
}

.post h3 {
  font-size: 16px;
}

.post p {
  font-size: 14px;
  color: #ccc;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #ff961e;
  margin-bottom: 20px;
  font-family: "Montserrat", serif;
}

.plan-dialog {
  background-color: #2c2c2c !important;
  color: white;
}

:deep(.v-card-title) {
  color: #ff961e !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}

:deep(.v-card-text) {
  padding: 20px;
}

:deep(.v-card-text ul) {
  list-style: none;
  padding-left: 0;
}

:deep(.v-card-text li) {
  margin: 8px 0;
  padding-left: 20px;
  position: relative;
}

:deep(.v-card-text li)::before {
  content: "•";
  color: #ff961e;
  position: absolute;
  left: 0;
}
</style>