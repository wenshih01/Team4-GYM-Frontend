<template>
    <div class="container">
      <h1 class="title">教練介紹</h1>
      <div class="coach-list">
        <div v-for="coach in coaches" :key="coach.empno" class="coach-card" @click="goToDetail(coach.empno)">
          <div class="photo-container">
            <img :src="coach.photo" alt="教練照片" class="coach-photo" />
          </div>
          <h2>{{ coach.ename }} ({{ coach.nickname }})</h2>
          <p><strong>職稱：</strong>{{ coach.title }}</p>
          <p><strong>專長：</strong>{{ coach.skill }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        coaches: []
      };
    },
    created() {
      this.fetchCoaches();
    },
    methods: {
      async fetchCoaches() {
        try {
          const response = await axios.get('http://localhost:8082/coaches/findAll');
          
          this.coaches = response.data;
        } catch (error) {
          console.error('載入教練資訊失敗', error);
        }
      },
      goToDetail(empno) {
        this.$router.push(`/coach-profile/${empno}`);
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    text-align: center;
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
    margin-bottom: 20px;
    
  }
  
  .coach-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
  
  .coach-card {
    width: 250px;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.2s;
    background: #FFFCF2;
    text-align: center;
  }
  
  .coach-card:hover {
    transform: scale(1.05);
  }
  
  .photo-container {
    width: 100%;
    height: 200px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
  }
  
  .coach-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  border-radius: 5px;
}

.coach-card h2 {
  color: #635F59; /* 設定教練名稱為藍色 */
}

.coach-card p {
  color: #555; /* 設定職稱、專長等文字為深灰色 */
}

.coach-card p strong {
  color: #222; /* 讓標題文字更深 */
}

.coach-card:hover h2 {
  color: #EB5E28; 
}

.coach-card:hover p {
  color: #444;
}

  </style>
  