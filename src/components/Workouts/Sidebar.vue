<template>
  <div class="sidebar" @mouseover="showSidebar" @mouseleave="hideSidebar">
    <div v-if="visible" class="user-info">
      <p>會員ID: {{ user.id }}</p>
      <p>會員帳號: {{ user.name }}</p>
    </div>
    <ul v-if="visible">
      <li>選單項目 1</li>
      <li>選單項目 2</li>
      <li>選單項目 3</li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  user: Object,
  visible: Boolean,
});

const emit = defineEmits(["show", "hide"]);

const showSidebar = () => emit("show");
const hideSidebar = () => emit("hide");
</script>

<style scoped>
.sidebar {
  width: 60px;
  height: 100%;
  background-color: #1e1e1e;
  color: white;
  transition: width 0.3s;
}

.sidebar:hover {
  width: 400px;
}
</style>
