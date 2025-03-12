<template>
    <div class="reset-password-container">
      <div class="reset-password-card">
        <h2>🔒 重設密碼</h2>
        <p class="description">請輸入並確認新密碼</p>
  
        <!-- 新密碼輸入 -->
        <input 
          type="password" 
          v-model="newPassword" 
          placeholder="輸入新密碼" 
          class="password-input"
        >
        
        <!-- 確認密碼輸入 -->
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="確認新密碼" 
          class="password-input"
        >
  
        <button @click="resetPassword" class="reset-btn">確認重設</button>
  
        <!-- 錯誤訊息 -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  
        <!-- 成功 / 失敗 訊息 -->
        <p v-if="message" :class="{'success-message': isSuccess, 'error-message': !isSuccess}">
          {{ message }}
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import { useRoute } from "vue-router";
  import axios from "axios";
  
  const route = useRoute();
  const newPassword = ref("");
  const confirmPassword = ref("");
  const message = ref("");
  const errorMessage = ref("");
  const isSuccess = ref(false);
  
  const resetPassword = async () => {
    // 驗證新密碼與確認密碼是否相同
    if (newPassword.value !== confirmPassword.value) {
      errorMessage.value = "❌ 兩次輸入的密碼不一致，請重新輸入！";
      return;
    }
    
    // 清空錯誤訊息
    errorMessage.value = "";
  
    try {
      const response = await axios.post("http://localhost:8082/api/users/reset-password", null, {
        params: { token: route.query.token, newPassword: newPassword.value }
      });
      message.value = "✅ 密碼重設成功，請使用新密碼登入！";
      isSuccess.value = true;
    } catch (error) {
      message.value = "❌ 密碼重設失敗，請確認您的 Token 是否有效！";
      isSuccess.value = false;
    }
  };
  </script>
  
  <style scoped>
  /* 背景設置 */
  .reset-password-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
  }
  
  /* 卡片樣式 */
  .reset-password-card {
    background: #222;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
    text-align: center;
    max-width: 400px;
    width: 90%;
    animation: fadeIn 0.5s ease-in-out;
    color: white;
  }
  
  /* 標題 */
  h2 {
    font-size: 24px;
    margin-bottom: 10px;
    color: #ffa500; /* 橘色標題 */
  }
  
  /* 說明文字 */
  .description {
    font-size: 14px;
    color: #ccc;
    margin-bottom: 20px;
  }
  
  /* 輸入框 */
  .password-input {
    width: 100%;
    padding: 12px;
    border: 2px solid #ffa500;
    background: #333;
    color: white;
    border-radius: 8px;
    font-size: 16px;
    margin-bottom: 15px;
    transition: 0.3s;
  }
  
  .password-input::placeholder {
    color: #bbb;
  }
  
  .password-input:focus {
    border-color: #ff8c00;
    box-shadow: 0 0 8px rgba(255, 140, 0, 0.6);
    outline: none;
  }
  
  /* 按鈕 */
  .reset-btn {
    width: 100%;
    background-color: #ffa500;
    color: black;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    font-weight: bold;
    transition: 0.3s;
  }
  
  .reset-btn:hover {
    background-color: #ff8c00;
    transform: scale(1.05);
  }
  
  /* 訊息樣式 */
  .success-message {
    color: #28a745;
    font-size: 14px;
    margin-top: 15px;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 15px;
  }
  
  /* 動畫效果 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>
  