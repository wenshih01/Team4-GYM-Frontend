<template>
  <div v-if="action" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2>{{ action.name }}</h2>
      <p>部位：{{ action.parts }}</p>
      <p>教學：{{ action.teaching }}</p>
      <p>卡路里消耗：{{ action.calories }} kcal</p>
      <iframe
        v-if="action.url"
        :src="convertToEmbedUrl(action.url)"
        class="video-player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
      <button @click="closeModal">關閉</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  action: Object, // 接收父組件傳遞的選中動作數據
});

const emit = defineEmits(["close"]); // 用於通知父組件關閉模態框

const convertToEmbedUrl = (url) => {
  if (url && url.includes("watch?v=")) {
    const videoId = url.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const closeModal = () => {
  emit("close"); // 發送關閉事件
};
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

.video-player {
  width: 100%;
  border-radius: 8px;
  margin-top: 15px;
  height: 315px;
}
</style>
