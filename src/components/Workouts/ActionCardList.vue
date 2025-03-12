<template>
  <div class="card-container">
    <div
      v-for="action in actions"
      :key="action.id"
      class="card"
      @click="selectAction(action)"
    >
      <h3>{{ action.name }}</h3>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  actions: Array, // 接收父組件傳遞的動作數據
});

const emit = defineEmits(["select"]); // 用於通知父組件卡片被點擊

const selectAction = (action) => {
  emit("select", action); // 發送事件，將被點擊的動作數據傳遞給父組件
};
</script>

<style scoped>
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
}

.card {
  background-color: #d3d3d3;
  padding: 15px;
  border-radius: 8px;
  color: #000000;
  width: 300px;
  height: 300px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.card h3 {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 20px;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}
</style>
