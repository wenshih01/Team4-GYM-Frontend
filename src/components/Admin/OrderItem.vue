<template>
    <div class="order-item-container">
      <v-card class="order-item-card">
        <v-card-title>
          <h2>訂單明細 - 訂單編號 {{ orderId }}</h2>
        </v-card-title>
        <v-card-text>
          <v-data-table
  :headers="headers"
  :items="orderItems"
  class="elevation-1"
  dense
>
  <template v-slot:[`item.price`]="{ item }">
    {{ item.price.toFixed(2) }} 元
  </template>
  <template v-slot:[`item.subtotal`]="{ item }">
    {{ item.subtotal.toFixed(2) }} 元
  </template>
</v-data-table>

        </v-card-text>
        <v-card-actions>
          <v-btn text color="primary" @click="goBack">返回</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import axios from "axios";
  import { useRoute, useRouter } from "vue-router";
  
  export default {
    setup() {
      const route = useRoute(); // 獲取路由參數
      const router = useRouter(); // 路由導航
      const orderId = ref(route.params.orderId); // 從路由參數中獲取 orderId
      const orderItems = ref([]); // 訂單明細數據
  
      // 表格表頭
      const headers = ref([
        { text: "商品 ID", value: "productId" },
        { text: "商品名稱", value: "productName" },
        { text: "數量", value: "quantity" },
        { text: "單價", value: "price" },
        { text: "小計", value: "subtotal" },
      ]);
  
      // 加載訂單明細
      const fetchOrderItems = async () => {
  try {
    if (!orderId.value) {
      throw new Error("訂單編號缺失");
    }

    const response = await axios.get(`/api/orderitems/order/${orderId.value}/details`);
    if (!response.data || response.data.length === 0) {
      throw new Error("未找到該訂單的明細數據");
    }

    console.log("✅ API 返回的訂單明細:", response.data); // 確保 API 正確返回

    // ✅ 確保前端正確解析 `productId` 和 `productName`
    orderItems.value = response.data.map((item) => ({
      productId: item.productId || "未知商品 ID",
      productName: item.productName || "未知商品名稱",
      quantity: item.quantity || 0,
      price: item.price || 0,
      subtotal: (item.price || 0) * (item.quantity || 0),
    }));
  } catch (error) {
    console.error("❌ 載入訂單明細失敗:", error);
    alert(error.message || "無法載入訂單明細，請稍後再試");
  }
};



  
      // 返回按鈕功能
      const goBack = () => {
        router.push("/admin/order"); // 返回訂單列表頁面
      };
  
      // 在組件加載時調用數據加載函數
      onMounted(fetchOrderItems);
  
      return {
        orderId,
        orderItems,
        headers,
        goBack,
      };
    },
  };
  </script>
  
  <style scoped>
  .order-item-container {
    padding: 20px;
  }
  
  .order-item-card {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .elevation-1 {
    border-radius: 10px;
    overflow: hidden;
  }
  </style>
  