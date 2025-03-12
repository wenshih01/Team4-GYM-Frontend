<template>
    <v-container class="d-flex align-center justify-center min-height-screen">
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title>
                        <h3>購物車</h3>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-row v-if="cartItems.length > 0">
                            <v-col v-for="(item, index) in cartItems" :key="item.id.productId || index" cols="12"
                                md="12" class="cart-item">
                                <v-row align="center">
                                    <!-- 商品圖片 -->
                                    <v-col cols="2">
                                        <v-img :src="item.imageUrl" alt="商品圖片" class="cart-item-image"></v-img>
                                    </v-col>
                                    <!-- 商品資訊 -->
                                    <v-col cols="6">
                                        <h4>{{ item.productName }}</h4>
                                        <p>NT{{ item.price }}</p>
                                    </v-col>
                                    <!-- 商品數量 -->
                                    <v-col cols="2">
                                        <v-text-field v-model.number="item.quantity" type="number" min="1" label="數量"
                                            outlined dense class="quantity-input"
                                            @change="updateCartItem(item)"></v-text-field>
                                    </v-col>
                                    <!-- 刪除按鈕 -->
                                    <v-col cols="2">
                                        <v-btn icon color="red"
                                            @click="removeCartItem(item.id.cartId, item.id.productId)">
                                            <v-icon>mdi-delete</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>



                        <!-- 如果購物車為空 -->
                        <v-row v-else justify="center">
                            <h4>您的購物車是空的！</h4>
                        </v-row>
                    </v-card-text>

                    <!-- 購物車總價格 -->
                    <v-card-text v-if="cartItems.length > 0" class="total-price">
                        <h4>總金額：NT{{ totalPrice }}</h4>
                    </v-card-text>

                    <v-card-actions class="d-flex justify-end gap-4">
                        <!-- 結帳按鈕 -->
                        <v-btn color="orange darken-1" :elevation="2" :disabled="cartItems.length === 0"
                            class="rounded-pill px-4 py-2 text-lg font-semibold" @click="goToOrderList">
                            <v-icon left>mdi-cash</v-icon>
                            結帳
                        </v-btn>

                        <!-- 清空購物車按鈕 -->
                        <v-btn color="red darken-1" :elevation="2" class="rounded-pill px-4 py-2 text-lg font-semibold"
                            @click="clearCartItems(userId)">
                            <v-icon left>mdi-delete</v-icon>
                            清空購物車
                        </v-btn>
                    </v-card-actions>

                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
export default {
    setup() {
        const router = useRouter();
        const cartItems = ref([]);
        const userId = ref(null);

        // 獲取用戶 ID
        const fetchUserId = async () => {
            try {
                const response = await axios.get("/api/profile", { withCredentials: true });
                if (response.data && response.data.id) {
                    console.log("從 session 獲取的 userId：", response.data.id);
                    return response.data.id;
                }
                throw new Error("未登入或無法獲取用戶 ID");
            } catch (error) {
                console.error("無法從 session 獲取用戶 ID：", error.response?.data || error.message);
                alert("請先登入以查看購物車！");
                throw error;
            }
        };




        // 加載購物車內容
        const loadCart = async () => {
            try {
                // 從 session 獲取用戶 ID
                const userId = await fetchUserId();
                console.log("成功從 session 獲取 userId：", userId);

                // 從後端獲取 cartId
                const cartId = await fetchCartId(userId);
                console.log("成功從後端獲取 cartId：", cartId);

                // 從後端加載購物車內容
                const response = await axios.get(`/cartItems/cart/${cartId}`);
                if (response.status === 200) {
                    cartItems.value = response.data.map((item) => ({
                        id: item.id,
                        quantity: item.quantity || 1,
                        price: item.price || 0,
                        productName: item.productName || "未命名商品",
                        imageUrl: item.images?.length > 0
                            ? item.images[0].imageUrl // 提取第一張圖片
                            : "/no-image.png", // 如果沒有圖片，顯示佔位符
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                    }));

                    console.log("加載的購物車內容：", cartItems.value);
                } else {
                    console.log("購物車內容為空");
                }
            } catch (error) {
                console.error("無法加載購物車內容：", error.response?.data || error.message);

            }
        };


        const fetchCartId = async (userId) => {
            try {
                const response = await axios.get(`/cart/user/${userId}`);
                if (response.status === 200 && response.data.cartId) {
                    console.log("成功從後端獲取 cartId：", response.data.cartId);
                    return response.data.cartId;
                }
                throw new Error("無法獲取 cartId，購物車可能為空！");
            } catch (error) {
                console.error("無法從後端獲取 cartId：", error.response?.data || error.message);
                throw error;
            }
        };




        // 計算總價格
        const totalPrice = computed(() =>
            cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
        );

        const updateCartItem = async (item) => {
            if (!item || !item.id || !item.id.cartId || !item.id.productId) {
                console.error("無效的商品數據：", item);
                alert("無法更新商品，因為提供的商品數據無效！");
                return;
            }

            if (item.quantity <= 0) {
                console.error("無效的商品數量：", item.quantity);
                alert("商品數量必須大於 0！");
                return;
            }

            try {
                console.log("開始更新商品，Cart ID：", item.id.cartId, "Product ID：", item.id.productId);

                // 構建更新數據
                const updatedData = {
                    quantity: item.quantity,
                    price: item.price, // 確保包含價格
                    updatedAt: new Date().toISOString(),
                };

                const response = await axios.put(`/cartItems/${item.id.cartId}/${item.id.productId}`, updatedData);

                if (response.status === 200) {

                    console.log("更新後的商品數據：", response.data);

                    // 更新本地數據
                    const index = cartItems.value.findIndex(
                        (cartItem) =>
                            cartItem.id.cartId === item.id.cartId && cartItem.id.productId === item.id.productId
                    );
                    if (index !== -1) {
                        cartItems.value[index].quantity = item.quantity;
                        cartItems.value[index].updatedAt = updatedData.updatedAt;
                        console.log("本地商品數據已更新：", cartItems.value[index]);
                    }
                } else {
                    console.warn("更新商品數量時後端返回非 200 狀態碼：", response.status);
                }
            } catch (error) {
                const errorMessage = error.response?.data || error.message;
                console.error("更新商品數量失敗：", errorMessage);
                alert(`更新商品數量時發生錯誤：${errorMessage}`);
            }
        };




        // 刪除購物車商品
        const removeCartItem = async (cartId, productId) => {
            // 檢查參數有效性
            if (!cartId || !productId) {
                console.error("無效的 cartId 或 productId：", { cartId, productId });
                alert("無法刪除商品，因為 cartId 或 productId 無效！");
                return;
            }

            try {
                const response = await axios.delete(`/cartItems/${cartId}/${productId}`);
                if (response.status === 200) {
                    alert(`商品已成功刪除！`);
                    await loadCart(); // 刷新購物車
                } else {
                    console.warn("刪除商品時後端返回非 200 狀態碼：", response.status);
                }
            } catch (error) {
                console.error("刪除商品失敗：", error.response?.data || error.message);
                alert("刪除商品時發生錯誤，請稍後再試！");
            }
        };


        // 清空購物車內商品
        const clearCartItems = async () => {
            if (!userId.value) {
                console.error("無法清空購物車，因為 userId 無效！");
                alert("無法清空購物車，請先登入！");
                return;
            }

            try {
                console.log("嘗試獲取 cartId，User ID：", userId.value);
                const cartId = await fetchCartId(userId.value);

                if (!cartId) {
                    console.error("無法獲取 cartId，清空購物車失敗！");
                    alert("無法清空購物車，因為無法獲取有效的 cartId！");
                    return;
                }

                console.log("開始清空購物車內商品，Cart ID：", cartId);

                // 調用後端 API 清空購物車內商品
                const response = await axios.delete(`/cartItems/cart/${cartId}/items`);
                if (response.status === 200) {
                    alert(`購物車內所有商品已成功清空！`);
                    console.log(`清空購物車內商品成功，Cart ID：${cartId}`);

                    // 更新本地購物車數據
                    cartItems.value = []; // 清空本地購物車商品列表
                } else {
                    console.warn("清空購物車內商品時後端返回非 200 狀態碼：", response.status);
                    alert("清空購物車內商品失敗，請稍後再試！");
                }
            } catch (error) {
                const errorMessage = error.response?.data || error.message;
                console.error("清空購物車內商品失敗：", errorMessage);
                alert(`清空購物車內商品時發生錯誤：${errorMessage}`);
            }
        };



        // 結帳功能
        const checkout = async () => {
            if (cartItems.value.length === 0) {
                alert("購物車是空的，無法結帳！");
                return;
            }
            try {
                const cartId = await fetchCartId(); // 獲取購物車 ID
                const response = await axios.post(`/cart/checkout`, { cartId });
                if (response.status === 200) {
                    alert(`結帳成功！總金額：NT${totalPrice.value}`);
                    cartItems.value = []; // 清空購物車
                } else {
                    console.warn("結帳時後端返回非 200 狀態碼：", response.status);
                }
            } catch (error) {
                console.error("結帳失敗：", error.response?.data || error.message);
                alert("結帳時發生錯誤！");
            }
        };

        // 初始化時加載購物車數據
        onMounted(async () => {
            try {
                userId.value = await fetchUserId(); // 初始化 userId
                console.log("成功初始化 userId：", userId.value);
                loadCart(); // 組件加載時調用
            } catch (error) {
                console.error("初始化 userId 失敗：", error.message);
            }
        });
        function goToOrderList() {
            router.push("/orderlist");
        }


        return {
            cartItems,
            totalPrice,
            updateCartItem,
            removeCartItem,
            clearCartItems,
            checkout,
            goToOrderList,
        };
    },
};
</script>

<style scoped>
.v-card {
    background-color: #1e1e1e !important;
    color: white;
    /* 確保文字可讀 */
}

/* 設定最小高度，讓內容置中 */
.min-height-screen {
    min-height: 80vh;
    /* 讓購物車內容向下移動，使其不會貼齊上方 */
}

/* 調整購物車項目間距 */
.cart-item {
    margin-bottom: 16px;
}

/* 商品圖片調整 */
.cart-item-image {
    width: 100%;
    height: auto;
    border-radius: 4px;
}

/* 調整數量輸入框寬度 */
.quantity-input {
    width: 80px;
}

.cart-item {
    margin-bottom: 16px;
}

.cart-item-image {
    width: 100%;
    height: auto;
    border-radius: 4px;
}

.quantity-input {
    width: 80px;
}

/* 設定總金額的字體大小與顏色 */
.total-price h4 {
    font-size: 24px;
    /* 讓字體變大 */
    font-weight: bold;
    /* 讓字體變粗 */
    color: #FF9800 !important;
    /* 橘色 */
    text-align: right;
    /* 讓總金額靠右對齊（可選） */
    margin-top: 10px;
}
</style>
