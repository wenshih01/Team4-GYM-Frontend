<template>
    <header class="header">
      <div class="logo">
        <router-link to="/" class="logo-link">
          <h1>GYM</h1>
        </router-link>
      </div>
  
      <nav class="nav">
        <ul class="nav-links">
          <li><router-link to="/coach">ABOUT US</router-link></li>
          <li><router-link to="/shop">SHOP</router-link></li>
          <li><router-link to="/workouts">WORKOUTS</router-link></li>
          <li><a href="#">MEMBERSHIP</a></li>
          <li><router-link to="/community">COMMUNITY</router-link></li>
          
        </ul>
      </nav>
  
      <div class="actions">
        <router-link v-if="isAdmin" to="/admin" class="admin-panel-link">
          Admin Hub
        </router-link>
  
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="login-btn fas fa-user"></router-link>
        </template>
        <template v-else>
          <div class="profile-container">
            <button class="profile-btn" @click="toggleMenu" @mouseover="isMenuOpen = true">
              <img v-if="user?.avatar" :src="user.avatar" class="avatar" :alt="user.username">
              <i v-else class="fas fa-user"></i>
            </button>
            <div v-if="isMenuOpen && isLoggedIn" class="dropdown-menu" @mouseleave="isMenuOpen = false">
              <button @click="goToProfile">會員中心</button>
              <button @click="showBookingDialog = true">預約課程</button>
              <button @click="logout">登出</button>
            </div>
          </div>
        </template>
      </div>
  
      <!-- 課程月曆彈窗 -->
      <BookingDialog v-model="showBookingDialog" />
    </header>
  </template>
  
  <script>
  import { ref, onMounted, watch } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import apiClient from "../api/apiClient";
  import BookingDialog from "@/components/BookingDialog.vue";
  
  export default {
    name: "Header",
    components: { BookingDialog },
  
    setup() {
      const isLoggedIn = ref(false);
      const user = ref(null);
      const isMenuOpen = ref(false);
      const isCheckingSession = ref(false);
      const router = useRouter();
      const route = useRoute();
      const isAdmin = ref(false);
      const showBookingDialog = ref(false);
  
      watch(
        () => route.path,
        async () => {
          await checkSession();
        }
      );
  
      const toggleMenu = () => {
        isMenuOpen.value = !isMenuOpen.value;
      };
  
      const checkSession = async () => {
        if (isCheckingSession.value) return;
        isCheckingSession.value = true;
        try {
          const response = await apiClient.get("/check", { withCredentials: true });
          if (response.data) {
            isLoggedIn.value = true;
            user.value = response.data.user;
            isAdmin.value = response.data.user.isAdmin;
          }
        } catch (error) {
          isLoggedIn.value = false;
          user.value = null;
          isAdmin.value = false;
        } finally {
          isCheckingSession.value = false;
        }
      };
  
      const goToProfile = async () => {
        await checkSession();
        if (isLoggedIn.value) {
          router.push("/profile");
        } else {
          router.push("/login");
        }
      };
  
      const logout = async () => {
        try {
          await apiClient.post("/logout", {}, { withCredentials: true });
          isLoggedIn.value = false;
          user.value = null;
          isAdmin.value = false;
          router.push("/login");
        } catch (error) {
          isLoggedIn.value = false;
          user.value = null;
          isAdmin.value = false;
          router.push("/login");
        }
      };
  
      onMounted(() => {
        checkSession();
      });
  
      return {
        isLoggedIn,
        isMenuOpen,
        toggleMenu,
        goToProfile,
        logout,
        user,
        isAdmin,
        showBookingDialog,
      };
    },
  };
  </script>



<style scoped>
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background-color: #1e1e1e;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 50px;
    z-index: 1000;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    font-family: "Montserrat", serif;
}

.logo h1 {
    font-size: 24px;
    color: #ff961e;
    margin: 0;
}

.logo-link {
    text-decoration: none;
}

.logo-link:hover h1 {
    color: #e2850d;
}

.nav {
    flex: 1;
    display: flex;
    justify-content: center;
}

.nav-links {
    list-style: none;
    display: flex;
    gap: 50px;
    padding: 0;
    margin: 0;
}

.nav-links li a {
    text-decoration: none;
    color: white;
    font-size: 16px;
    font-family: "Goldman", serif;
    font-weight: 400;
    font-style: normal;
    transition: color 0.3s;
}

.nav-links li a:hover {
    color: #ff961e;
}

.actions {
    display: flex;
    gap: 5px;
    margin-right: 0px;
    justify-content: flex-end;
}

.login-btn {
    text-decoration: none;
    color: white;
    padding: 8px 16px;
    border-radius: 50px;

    transition: background-color 0.3s;
}

.login-btn:hover {
    background: #e2850d;
}

.btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    font-size: 15px;
    cursor: pointer;
    background-color: #1e1e1e;
    color: white;
    transition: background-color 0.3s;
}

.actions .btn i {
    font-size: 17px;
    color: white;
}

.btn:hover {
    background-color: #5a5b5a;
}

.profile-container {
    position: relative;
}


.profile-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    border: none;
    padding: 0;
}

.avatar {
    width: 85%;
    height: 85%;
    object-fit: cover;
    border: 2px solid #ff961e;
    border-radius: 50px;

}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: #2a2a2a;
    border-radius: 8px;
    padding: 8px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    min-width: 120px;
}

.dropdown-menu button {
    width: 100%;
    padding: 8px 16px;
    text-align: left;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
}

.dropdown-menu button:hover {
    background: #3a3a3a;
    color: #ff961e;
}

.admin-panel-link {
    text-decoration: none;
    color: #ff961e;
    padding: 8px 10px;
    border-radius: 5px;
    background-color: rgba(255, 150, 30, 0.1);
    border: 0px solid #ff961e;
    transition: all 0.3s ease;
    font-family: "Goldman", serif;
    font-weight: 400;
    font-style: normal;
}

.admin-panel-link:hover {
    background-color: rgba(255, 150, 30, 0.2);
    color: #fff;
}
</style>