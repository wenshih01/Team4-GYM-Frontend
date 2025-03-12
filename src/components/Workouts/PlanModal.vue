<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <h2>暫存方案細則</h2>
      <div v-for="item in items" :key="item.id" class="plan-item">
        <p>動作: {{ item.name }}</p>
        <p>組數: {{ item.sets }}</p>
        <p>每組次數: {{ item.reps }}</p>
        <p>熱量: {{ item.calories }} kcal</p>
        <button @click="remove(item.id)">移除</button>
      </div>
      <button v-if="items.length > 0" @click="save">確認儲存</button>
      <button @click="close">關閉</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  visible: Boolean, // 控制模態視窗顯示
  items: Array, // 傳入方案的細節數據
});

const emit = defineEmits(["close", "save", "remove"]); // 傳遞事件到父組件

const close = () => emit("close");
const save = () => emit("save");
const remove = (id) => emit("remove", id);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #000;
  padding: 20px;
  border-radius: 8px;
  color: #fff;
  text-align: center;
  max-width: 600px;
  width: 90%;
}

.plan-item {
  background-color: #2e2e2e;
  color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
}

button {
  background-color: #ff961e;
  color: #fff;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #ffa540;
}
</style>
