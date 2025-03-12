<template>
  <v-container class="d-flex align-center justify-center full-height">
    <v-card class="forgot-password-form" elevation="8">
      <v-card-title class="text-center text-h4 font-weight-bold mb-6">
        忘記密碼
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="requestReset">
          <v-text-field 
            v-model="email" 
            label="請輸入您的 Email" 
            variant="outlined" 
            prepend-inner-icon="mdi-email"
            :rules="[(v) => !!v || '請輸入 Email', (v) => /.+@.+\..+/.test(v) || 'Email 格式不正確']" 
            required>
          </v-text-field>

          <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
            {{ successMessage }}
          </v-alert>

          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>

          <v-btn color="orange" size="large" block type="submit" class="mt-4" :loading="loading">
            發送重設密碼連結
            <v-icon right class="ml-2">mdi-send</v-icon>
          </v-btn>

          <v-btn text color="blue" block class="mt-4" @click="goToLogin">
            返回登入頁面
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../api/apiClient";

const email = ref("");
const successMessage = ref(null);
const errorMessage = ref(null);
const loading = ref(false);
const router = useRouter();

// 送出重設密碼請求
const requestReset = async () => {
  if (!email.value) {
    errorMessage.value = "請輸入 Email";
    return;
  }

  loading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    console.log(email.value);
    const response = await apiClient.post("/users/forgot-password", { email: email.value });
    successMessage.value = "重設密碼連結已發送至您的 Email！";
  } catch (error) {
    if (error.response) {
      errorMessage.value = error.response.data; // ✅ 顯示 "此 Email 尚未註冊！"
    } else {
      errorMessage.value = "請確認 Email 是否正確！";
    }
  } finally {
    loading.value = false;
  }
};

// 返回登入頁面
const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
/* 讓容器撐滿整個畫面，並讓內容置中 */
.full-height {
  height: 100vh; /* 🛠️ 確保 v-container 滿版 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 50px; /* 🛠️ 避免頂部過於貼近 */
}

/* 忘記密碼表單卡片 */
.forgot-password-form {
  width: 400px;
  padding: 30px;
  background-color: #1e1e1e !important;
  color: white !important;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(255, 165, 0, 0.3);
  margin-top: 20px; /* 🛠️ 增加一些 margin 避免切到 */
}

/* 標題顏色 */
.v-card-title {
  color: #ff9800 !important;
}

/* 主要按鈕樣式 */
.v-btn[color="orange"] {
  background-color: #ff9800 !important;
  color: black !important;
  font-weight: bold;
}

/* 返回登入按鈕 */
.v-btn[color="blue"] {
  color: #2196f3 !important;
}
</style>
