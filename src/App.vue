<template>
  <div id="app">
    <template v-if="isAdminRoute">
      <router-view />
    </template>
    <template v-else>
      <Header />
      <main class="main-content">
        <router-view />
      </main>
      <!-- 根據路由決定是否顯示 Footer -->
      <Footer v-if="!isCommunityPage" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import AdminLayout from "./components/Admin/AdminLayout.vue";
import apiClient from "./api/apiClient";

const route = useRoute();
const isAdmin = ref(false);

// 判斷是否是管理路由
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin');
});

const isCommunityPage = computed(() => {
  return route.path === '/community';
});

// 檢查管理員狀態
const checkAdminStatus = async () => {
  try {
    const response = await apiClient.get("/check", { withCredentials: true });
    isAdmin.value = response.data?.user?.role === 'ADMIN';
  } catch (error) {
    isAdmin.value = false;
  }
};
// 提供給 Header 組件更新管理員狀態
const updateAdminStatus = (status) => {
  isAdmin.value = status;
};

onMounted(checkAdminStatus);
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  min-height: 100vh;
  max-width: 100%;
  margin: 0;
  padding: 0;
  background-color: #1e1e1e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 0px;
  overflow: hidden;
}

.main-content.community-page {
  overflow: hidden;
  height: calc(100vh - 60px);
  /* 只減去 Header 的高度 */
}

#app>div[class*="admin"] {
  flex: 1;
}
</style>