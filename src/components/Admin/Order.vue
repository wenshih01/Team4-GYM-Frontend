<template>
  <div class="order-container">
    <div class="top-bar">
      <div class="left-actions">
        <!-- 搜尋訂單 -->
        <v-text-field v-model="search" label="以訂單編號搜尋" append-icon="mdi-magnify" outlined clearable
          @keyup.enter="executeSearch" @click:append="executeSearch" style="width: 300px"></v-text-field>

        <!-- 訂單狀態篩選 -->
        <v-select v-model="statusFilter" :items="statusOptions" label="訂單狀態" item-title="title" item-value="value"
          outlined dense @change="filterByStatus" style="width: 300px"></v-select>
        <!-- 動態輸入訂單編號 -->
        <v-text-field v-model="dynamicOrderId" label="輸入訂單編號" outlined clearable style="width: 300px"
          @change="goToOrderItemByButton" />
      </div>
      <!-- 新增訂單按鈕 -->
      <v-btn color="primary" @click="openNew" class="add-order-btn">
        新增訂單
      </v-btn>
    </div>

    <!-- 訂單列表 -->
    <v-data-table v-if="filteredOrders.length > 0" :headers="headers" :items="filteredOrders" item-value="orderId"
      class="elevation-1 custom-table" dense fixed-header alternate-row>
      <!-- 狀態顯示 -->
      <template v-slot:[`item.status`]="{ item }">
        <span :class="{
          'pending-status': item.status === 'Pending',
          'completed-status': item.status === 'Completed',
          'cancelled-status': item.status === 'Cancelled',
        }">
          {{ item.status === 'Pending' ? '待處理' :
            item.status === 'Completed' ? '已完成' :
              '已取消' }}
        </span>
      </template>


      <!-- 支付狀態顯示 -->
      <template v-slot:[`item.paymentStatus`]="{ item }">
        <span :class="{
          'pending-status': item.paymentStatus === 'Pending',
          'completed-status': item.paymentStatus === 'Completed',
          'failed-status': item.paymentStatus === 'Failed',
        }">
          {{ item.paymentStatus === 'Pending' ? '待處理' :
            item.paymentStatus === 'Completed' ? '已完成' :
              '失敗' }}
        </span>
      </template>




      <!-- 操作按鈕 -->
      <template v-slot:[`item.actions`]="{ item }">
        <div class="actions-container">
          <!-- 編輯訂單 -->
          <v-btn icon color="primary" size="small" @click.stop="editOrder(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>

          <!-- 刪除訂單 -->
          <v-btn icon color="red" size="small" @click.stop="deleteOrder(item.orderId)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>

          <!-- 狀態切換 -->
          <v-btn icon :color="item.status === 'Pending' ? 'yellow' : item.status === 'Completed' ? 'green' : 'red'"
            size="small" @click.stop="toggleOrderStatus(item)">
            <v-icon>
              {{ item.status === 'Pending' ? 'mdi-clock-outline' :
                item.status === 'Completed' ? 'mdi-check-circle-outline' : 'mdi-cancel' }}
            </v-icon>
          </v-btn>
          <!-- 更新支付狀態 -->
          <v-btn icon color="blue" size="small" @click.stop="openPaymentStatusDialog(item)">
            <v-icon>mdi-cash</v-icon>
          </v-btn>
        </div>
      </template>

      <!-- 訂單編號點擊查看詳細資訊 -->
      <template v-slot:[`item.orderId`]="{ item }">
        <span class="link" @click="showDetails(item)">
          {{ item.orderId }}
        </span>
      </template>

    </v-data-table>

    <!-- 新增/編輯訂單對話框 -->
    <v-dialog v-model="orderDialog" max-width="600px">
      <v-card class="black-background">
        <v-card-title class="orange-text">
          <span>{{ isEditMode ? '編輯訂單' : '新增訂單' }}</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="order.userId" label="使用者 ID" outlined></v-text-field>
          <v-text-field v-model="order.totalPrice" label="總金額" type="number" outlined></v-text-field>
          <v-select v-model="order.status" :items="statusOptions" label="狀態" item-title="title" item-value="value"
            outlined></v-select>
          <v-select v-model="order.paymentStatus" :items="paymentStatusOptions" label="支付狀態" item-title="title"
            item-value="value" outlined></v-select>
          <v-text-field v-model="order.transactionId" label="交易編號" outlined></v-text-field>
          <v-text-field v-model="order.deliveryAddress" label="配送地址" outlined></v-text-field>
          <v-text-field v-model="order.createdAt" label="創建時間" readonly outlined></v-text-field>
          <v-text-field v-model="order.updatedAt" label="更新時間" readonly outlined></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="red" @click="closeDialog">取消</v-btn>
          <v-btn text color="green" @click="saveOrder">儲存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 訂單詳細資訊對話框 -->
    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card class="black-background">
        <v-card-title class="orange-text">
          <span>訂單詳細資訊</span>
        </v-card-title>
        <v-card-text>
          <p><strong>訂單編號：</strong> {{ selectedOrder.orderId }}</p>
          <p><strong>使用者 ID：</strong> {{ selectedOrder.userId }}</p>
          <p><strong>總金額：</strong> {{ selectedOrder.totalPrice }}</p>
          <p><strong>狀態：</strong>
            {{ selectedOrder.status === 'Pending' ? '待處理' : selectedOrder.status === 'Completed' ? '已完成' : '已取消' }}
          </p>
          <p><strong>支付狀態：</strong>
            {{ selectedOrder.paymentStatus === 'Pending' ? '未支付' : selectedOrder.paymentStatus === 'Completed' ? '已支付' :
            '支付失敗' }}
          </p>
          <p><strong>交易編號：</strong> {{ selectedOrder.transactionId }}</p>
          <p><strong>配送地址：</strong> {{ selectedOrder.deliveryAddress }}</p>
          <p><strong>創建時間：</strong> {{ selectedOrder.createdAt }}</p>
          <p><strong>更新時間：</strong> {{ selectedOrder.updatedAt }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="red" @click="closeDetails">關閉</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 更新支付狀態對話框 -->
    <v-dialog v-model="paymentStatusDialog" max-width="400px">
      <v-card>
        <v-card-title>更新支付狀態</v-card-title>
        <v-card-text>
          <v-select v-model="paymentStatus" :items="paymentStatusOptions" label="選擇新的支付狀態" outlined></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="red" @click="closePaymentStatusDialog">取消</v-btn>
          <v-btn text color="green" @click="updatePaymentStatus">更新</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


  </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from "vue-router";

axios.defaults.baseURL = 'http://localhost:8082';

export default {
  setup() {
    const orders = ref([]);
    const search = ref('');
    const statusFilter = ref(null);
    const orderDialog = ref(false);
    const isEditMode = ref(false);
    const order = ref({
      userId: '',
      totalPrice: null,
      status: null,
      paymentStatus: null,
      transactionId: '',
      createdAt: '',
      updatedAt: '',
      deliveryAddress: '',
    });

    const paymentStatusDialog = ref(false);

    const paymentStatus = ref('');

    const paymentStatusOptions = ref([
      { title: '未支付', value: 'Pending' },
      { title: '已支付', value: 'Completed' },
      { title: '支付失敗', value: 'Failed' },
    ]);

    const currentOrder = ref(null);

    const statusOptions = ref([
      { title: '待處理', value: 'Pending' },
      { title: '已完成', value: 'Completed' },
      { title: '已取消', value: 'Cancelled' },
    ]);

    const headers = ref([
      { title: '訂單編號', value: 'orderId' },
      { title: '使用者 ID', value: 'userId' },
      { title: '總金額', value: 'totalPrice' },
      { title: '配送地址', value: 'deliveryAddress' },
      { title: '狀態', value: 'status' },
      { title: '支付狀態', value: 'paymentStatus' },
      { title: '操作', value: 'actions', sortable: false },
    ]);

    const detailHeaders = ref([
      { title: '商品 ID', value: 'productId' },
      { title: '商品名稱', value: 'productName' },
      { title: '數量', value: 'quantity' },
      { title: '價格', value: 'price' },
      { title: '小計', value: 'subtotal' },
    ]);


    const filteredOrders = computed(() => {
      if (statusFilter.value === null) {
        return orders.value; // 返回所有訂單
      }
      return orders.value.filter((o) => o.status === statusFilter.value); // 根據狀態過濾
    });



    const fetchOrders = async () => {
      try {
        const response = await axios.get("/api/orders");
        orders.value = response.data;
        console.log("訂單數據:", orders.value); // 確保數據結構正確
      } catch (error) {
        console.error("載入訂單失敗:", error);
      }
    };

    const executeSearch = async () => {
      try {
        const response = await axios.get('/api/orders', { params: { orderId: search.value } });
        orders.value = response.data;
      } catch (error) {
        console.error('搜尋訂單失敗:', error);
      }
    };

    const toggleOrderStatus = async (item) => {
      try {
        const nextStatus =
          item.status === 'Pending'
            ? 'Completed'
            : item.status === 'Completed'
              ? 'Cancelled'
              : 'Pending';

        const response = await axios.patch(`/api/orders/${item.orderId}/status`, null, {
          params: { status: nextStatus },
        });

        const updatedOrder = response.data;
        const index = orders.value.findIndex((o) => o.orderId === updatedOrder.orderId);
        if (index !== -1) {
          orders.value[index] = updatedOrder;
        }
      } catch (error) {
        console.error('更新訂單狀態失敗:', error);
      }
    };

    const deleteOrder = async (orderId) => {
      try {
        await axios.delete(`/api/orders/${orderId}`);
        fetchOrders();
      } catch (error) {
        console.error('刪除訂單失敗:', error);
      }
    };

    const editOrder = (item) => {
      order.value = { ...item };
      isEditMode.value = true;
      orderDialog.value = true;
    };

    const openNew = () => {
      order.value = {};
      isEditMode.value = false;
      orderDialog.value = true;
    };

    const closeDialog = () => {
      orderDialog.value = false;
    };



    const orderSummary = ref({ totalAmount: 0, totalQuantity: 0 });



    const detailsDialog = ref(false);
    const selectedOrder = ref({
      orderId: '',
      userId: '',
      totalPrice: null,
      status: '',
      transactionId: '',
      createdAt: '',
      updatedAt: '',
    });

    const showDetails = (item) => {
      if (!item || !item.orderId) {
        console.warn('無效的訂單數據');
        return;
      }

      selectedOrder.value = { ...item };
      detailsDialog.value = true; // 打開詳細資訊對話框
    };

    const closeDetails = () => {
      detailsDialog.value = false;
    };

    const saveOrder = async () => {
      try {
        const url = order.value.orderId ? `/api/orders/${order.value.orderId}` : '/api/orders';
        const method = order.value.orderId ? 'put' : 'post';

        await axios({ method, url, data: order.value });
        fetchOrders();
        closeDialog();
      } catch (error) {
        console.error('儲存訂單失敗:', error);
      }
    };

    const openPaymentStatusDialog = (item) => {
      currentOrder.value = item;
      paymentStatus.value = item.paymentStatus;
      paymentStatusDialog.value = true;
    };

    const closePaymentStatusDialog = () => {
      paymentStatusDialog.value = false;
    };

    const updatePaymentStatus = async () => {
      if (!currentOrder.value) {
        console.error('未選擇訂單');
        return;
      }

      try {
        const response = await axios.patch(`/api/orders/${currentOrder.value.orderId}/payment-status`, null, {
          params: { paymentStatus: paymentStatus.value },
        });

        const updatedOrder = response.data;
        const index = orders.value.findIndex((o) => o.orderId === updatedOrder.orderId);
        if (index !== -1) {
          orders.value[index] = updatedOrder;
        }

        paymentStatusDialog.value = false;
      } catch (error) {
        console.error('更新支付狀態失敗:', error);
      }
    };


    const router = useRouter(); // 初始化 router

    // 按鈕點擊跳轉的方法
    const goToOrderItemByButton = () => {
      // 檢查 dynamicOrderId 是否為空或無效
      if (!dynamicOrderId.value) {
        orderIdError.value = "訂單編號不能為空";
        return;
      }
      if (isNaN(Number(dynamicOrderId.value)) || Number(dynamicOrderId.value) <= 0) {
        orderIdError.value = "請輸入大於 0 的有效訂單編號";
        return;
      }

      // 清空錯誤信息，執行跳轉
      orderIdError.value = "";
      console.log("輸入的有效訂單編號:", dynamicOrderId.value);
      goToOrderItem({ orderId: dynamicOrderId.value }); // 傳遞用戶輸入的 orderId
    };


    //轉跳orderitem
    const goToOrderItem = (item) => {
      if (item && item.orderId) {
        console.log("即將跳轉的訂單數據:", item); // 打印行數據
        router.push({ name: "OrderItem", params: { orderId: item.orderId } });
      } else {
        console.error("無效的訂單數據:", item); // 如果無效，打印錯誤信息
      }
    };



    const dynamicOrderId = ref(""); // 用戶動態輸入的訂單編號
    const orderIdError = ref(""); // 用於存儲錯誤信息


    const viewOrderSummary = async (orderId) => {
      try {
        const response = await axios.get(`/api/orderitems/order/${orderId}/summary`);
        if (response.data) {
          orderSummary.value = response.data; // 正確賦值
          summaryDialog.value = true;        // 打開對話框
        } else {
          console.warn('API 返回的數據為空:', response);
        }
      } catch (error) {
        console.error('載入訂單總覽失敗:', error);
      }
    };



    const closeSummary = () => {
      summaryDialog.value = false;
    };

    fetchOrders();

    return {
      orders,
      search,
      statusFilter,
      orderDialog,
      isEditMode,
      order,
      statusOptions,
      headers,
      filteredOrders,
      executeSearch,
      fetchOrders,
      toggleOrderStatus,
      deleteOrder,
      editOrder,
      openNew,
      closeDialog,
      saveOrder,
      detailsDialog,
      selectedOrder,
      showDetails,
      closeDetails,
      paymentStatusDialog,
      paymentStatus,
      paymentStatusOptions,
      openPaymentStatusDialog,
      closePaymentStatusDialog,
      updatePaymentStatus,
      detailHeaders,
      closeSummary,
      viewOrderSummary,
      goToOrderItem,
      goToOrderItemByButton,
      dynamicOrderId,
      orderIdError,
    };
  },
};
</script>


<style scoped>
.elevation-1 {
  margin-bottom: 1rem;
}

.custom-table {
  border-radius: 10px;
  overflow: hidden;
  background-color: #f5e2c6;
}

.custom-table :deep(thead tr th) {
  background-color: #ef8030 !important;
  color: #333 !important;
  font-weight: bold;
  text-align: center;
}

.custom-table :deep(tbody tr:hover) {
  background-color: #f4c682 !important;
  cursor: pointer;
}

.active-status {
  color: green;
  font-weight: bold;
}

.inactive-status {
  color: red;
  font-weight: bold;
}

.deleted-status {
  color: gray;
  font-weight: bold;
}

.black-background {
  background-color: black;
  color: white;
  padding: 16px;
  border-radius: 8px;
}

.orange-text {
  color: rgb(245, 118, 34);
  font-weight: bold;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.left-actions {
  display: flex;
  gap: 10px;
}

.add-order-btn {
  align-self: flex-end;
}

.link {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}

.link:hover {
  color: darkblue;
}

.pending-status {
  color: orange;
  font-weight: bold;
}

.completed-status {
  color: green;
  font-weight: bold;
}

.cancelled-status {
  color: red;
  font-weight: bold;
}

.pending-status {
  color: orange;
  font-weight: bold;
}

.completed-status {
  color: green;
  font-weight: bold;
}

.failed-status {
  color: red;
  font-weight: bold;
}

.go-to-order-btn {
  margin-top: 20px;
}
</style>