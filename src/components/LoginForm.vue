<template>
  <v-container class="d-flex align-center justify-center" style="height: 100%">
    <v-card class="login-form" elevation="8">
      <v-card-title class="text-center text-h4 font-weight-bold mb-6">
        登入
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="login">
          <v-text-field v-model="username" label="帳號" variant="outlined" prepend-inner-icon="mdi-account"
            :rules="[(v) => !!v || '請輸入帳號']" required autocomplete="off"></v-text-field>

          <v-text-field v-model="password" label="密碼" variant="outlined" prepend-inner-icon="mdi-lock"
            :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showPassword = !showPassword" :rules="[(v) => !!v || '請輸入密碼']" required></v-text-field>

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
            {{ error }}
          </v-alert>

          <v-btn color="orange" size="large" block type="submit" class="mt-4" :loading="loading">
            登入
            <v-icon right class="ml-2">mdi-login</v-icon>
          </v-btn>
          <v-btn @click="showDialog = true" color="orange" size="large" block class="mt-4">
            註冊
            <v-icon right class="ml-2">mdi-account-plus</v-icon>
          </v-btn>
          <v-btn @click="goToForgotPassword" color="orange" size="large" block class="mt-4">
            忘記密碼
            <v-icon right class="ml-2">mdi-lock-question</v-icon>
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>

  <!-- 註冊對話框 -->
  <v-dialog v-model="showDialog" max-width="500px">
    <v-card class="register-form">
      <v-card-title class="text-h5">註冊帳號</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="register">
          <v-text-field v-model="registerForm.username" label="帳號" :rules="[
            v => !!v || '請輸入帳號',
            v => v.length >= 4 || '帳號至少4個字元'
          ]" required></v-text-field>

          <v-text-field v-model="registerForm.password" label="密碼" type="password" :rules="[
            v => !!v || '請輸入密碼',
            v => v.length >= 6 || '密碼至少6個字元',
            v => /[A-Z]/.test(v) || '密碼需包含大寫字母'
          ]" required></v-text-field>

          <v-text-field v-model="registerForm.email" label="Email" :rules="[
            v => !!v || '請輸入Email',
            v => /.+@.+\..+/.test(v) || 'Email格式不正確'
          ]" required></v-text-field>
          <v-text-field v-model="registerForm.name" label="姓名" required></v-text-field>
          <v-radio-group v-model="registerForm.gender" row required>
            <v-label>性別</v-label>
            <v-radio label="男" value="男"></v-radio>
            <v-radio label="女" value="女"></v-radio>
          </v-radio-group>
          <v-text-field v-model="registerForm.phone" label="電話" required></v-text-field>
          <v-text-field v-model="registerForm.birthday" label="生日" type="date" required></v-text-field>
          <v-file-input v-model="registerForm.imageUrl" label="上傳圖片" required accept="image/*"></v-file-input>

          <v-btn color="orange" block type="submit" class="mt-4">
            確認註冊
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" color="success">
    {{ snackbarText }}
  </v-snackbar>

</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "../api/apiClient";

const snackbar = ref(false);
const snackbarText = ref('');

const username = ref("");
const password = ref("");
const error = ref(null);
const router = useRouter();
const showPassword = ref(false);
const loading = ref(false);
const showDialog = ref(false);
const registerForm = ref({
  username: "",
  password: "",
  name: "",
  email: "",
  gender: "",
  phone: "",
  birthday: "",
  weight: null,
  height: null,
  imageUrl: null,
});

const register = async () => {
  try {
    const formData = new FormData();
    formData.append("username", registerForm.value.username);
    formData.append("password", registerForm.value.password);
    formData.append("name", registerForm.value.name);
    formData.append("email", registerForm.value.email);
    formData.append("phone", registerForm.value.phone);
    formData.append("gender", registerForm.value.gender);
    formData.append("birthday", new Date(registerForm.value.birthday).toISOString().split("T")[0]);

    if (registerForm.value.imageUrl) {
      formData.append("avatar", registerForm.value.imageUrl);
    }

    const response = await apiClient.post("/users/save", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    if (response.status === 200) {
      showDialog.value = false;  // 註冊成功才關閉
      snackbarText.value = "註冊成功，請重新登入";
      snackbar.value = true;

      // 清空表單
      registerForm.value = {
        username: "",
        password: "",
        name: "",
        email: "",
        gender: "",
        phone: "",
        birthday: "",
        avatar: null
      };
    }
  } catch (error) {
    snackbarText.value = `註冊失敗: ${error.response?.data || '請稍後再試'}`;
    snackbar.value = true;
  }
};

// 定義 files ref
const files = ref(null);
const checkSession = async () => {
  try {
    const response = await apiClient.get("/profile", {
      withCredentials: true,
    });
    if (response.data) return true;
  } catch (error) {
    console.warn("❌ 使用者未登入");
    return false;
  }
};

const login = async () => {
  if (!username.value || !password.value) {
    error.value = "請填寫完整的登入資訊";
    return;
  }

  loading.value = true;
  try {
    await apiClient.post("/login", {
      username: username.value,
      password: password.value,
    }, { withCredentials: true });

    // 直接跳轉到首頁
    router.push('/');
  } catch (err) {
    error.value = "無效的帳號或密碼";
  } finally {
    loading.value = false;
  }
};

// 跳轉到忘記密碼頁面
const goToForgotPassword = () => {
  router.push("/forgotpassword"); // ✅ 確保路由正確
};

</script>

<style scoped>
.login-form {
  width: 100%;
  max-width: 400px;
  background-color: #2c2c2c !important;
  padding: 20px;
  margin-top: 50px;
}

:deep(.v-card-title) {
  color: #ef8030 !important;
}

:deep(.v-text-field .v-field__input) {
  color: white !important;
}

:deep(.v-text-field .v-field__outline) {
  color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.v-text-field .v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.v-text-field .v-field) {
  --v-field-padding-top: 28px !important;
  background-color: transparent !important;
}

:deep(.v-text-field .v-field--focused .v-field__outline) {
  color: #ef8030 !important;
}

:deep(.v-icon) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.v-field--focused .v-icon) {
  color: #ef8030 !important;
}

.register-form {
  background-color: #2c2c2c !important;
  padding: 20px;
  width: 600px;
}

:deep(.v-text-field) {
  margin-bottom: 8px;
  width: 70%;
}

:deep(.v-card-title) {
  color: #ef8030 !important;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.v-text-field .v-field__input) {
  color: white !important;
  height: 60px !important;
}

:deep(.v-text-field .v-field__outline) {
  color: rgba(255, 255, 255, 0.2) !important;
}

:deep(.v-text-field .v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.v-text-field .v-field) {
  --v-field-padding-top: 20px !important;
  background-color: transparent !important;
}

:deep(.v-text-field .v-field--focused .v-field__outline) {
  color: #ef8030 !important;
}

:deep(.v-btn) {
  height: 40px;
}

.login-form :deep(.v-text-field) {
  width: 100%;
}

:deep(.v-text-field input:-webkit-autofill),
:deep(.v-text-field input:-webkit-autofill:hover),
:deep(.v-text-field input:-webkit-autofill:focus),
:deep(.v-text-field input:-webkit-autofill:active) {
    box-shadow: 0 0 0px 1000px #2c2c2c inset !important;
    -webkit-box-shadow: 0 0 0px 1000px #2c2c2c inset !important;
    background-color: #2c2c2c !important;
    color: white !important; /* ✅ 讓文字變白 */
    caret-color: white !important; /* ✅ 讓游標也變白 */
    -webkit-text-fill-color: white !important; /* ✅ 確保 autofill 文字也是白色 */
}

</style>