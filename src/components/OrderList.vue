<template>
    <v-container class="d-flex align-center justify-center min-height-screen">
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card class="order-card">
                    <v-card-title>
                        <h3 class="order-title">訂單資訊</h3>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <!-- 商品資訊 -->
                        <p class="order-text"><strong>商品資訊：</strong></p>
                        <v-row v-if="cartItems.length > 0">
                            <v-col
                                v-for="(item, index) in cartItems"
                                :key="index"
                                cols="12"
                                md="12"
                                class="cart-item"
                            >
                                <v-row align="center">
                                    <!-- 商品圖片 -->
                                    <v-col cols="2">
                                        <v-img
                                            :src="item.imageUrl"
                                            alt="商品圖片"
                                            class="cart-item-image"
                                        ></v-img>
                                    </v-col>
                                    <!-- 商品名稱與價格 -->
                                    <v-col cols="6">
                                        <h4 class="product-name">{{ item.productName }}</h4>
                                        <p class="product-price">NT{{ item.price }}</p>
                                    </v-col>
                                    <!-- 商品數量 -->
                                    <v-col cols="2">
                                        <p class="product-quantity">x {{ item.quantity }}</p>
                                    </v-col>
                                </v-row>
                                <v-divider></v-divider>
                            </v-col>
                        </v-row>
                        <p v-else class="order-text">您的購物車是空的</p>

                        <!-- 總金額 -->
                        <p class="order-text">
                            <strong>總金額：</strong> <span class="total-price">NT{{ totalPrice }}</span>
                        </p>

                        <!-- 配送地址 -->
                        <p class="order-text"><strong>收貨地址：</strong></p>
                        <v-text-field
                            v-model="deliveryAddress"
                            label="請輸入收貨地址"
                            outlined
                            dense
                            class="address-input"
                        ></v-text-field>

                        <!-- 付款方式 -->
                        <p class="order-text"><strong>付款方式：</strong></p>
                        <v-radio-group v-model="paymentMethod">
                            <v-radio label="貨到付款" value="cash_on_delivery"></v-radio>
                            <v-radio label="信用卡 (ECPay)" value="credit_card"></v-radio>
                        </v-radio-group>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions class="d-flex justify-end gap-4">
                        <v-btn
                            color="red darken-1"
                            class="rounded-pill px-4 py-2 text-lg font-semibold"
                            @click="cancelOrder"
                        >
                            <v-icon left>mdi-close-circle</v-icon>
                            取消
                        </v-btn>
                        <v-btn
                            color="orange darken-1"
                            class="rounded-pill px-4 py-2 text-lg font-semibold"
                            @click="confirmPayment"
                        >
                            <v-icon left>mdi-cash</v-icon>
                            確認付款
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default {
    setup() {
        const router = useRouter();
        const cartItems = ref([]);
        const userId = ref(null);
        const deliveryAddress = ref(""); // 配送地址
        const totalPrice = computed(() =>
            cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
        );
        const paymentMethod = ref("credit_card"); // 預設付款方式

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

        // 獲取購物車 ID
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

        // 加載購物車內容
        const loadCart = async () => {
            try {
                // 獲取用戶 ID
                const user = await fetchUserId();
                userId.value = user;

                // 獲取購物車 ID
                const cartId = await fetchCartId(userId.value);

                // 加載購物車內容
                const response = await axios.get(`/cartItems/cart/${cartId}`);
                if (response.status === 200) {
                    cartItems.value = response.data.map((item) => ({
                        id: item.id,
                        quantity: item.quantity || 1,
                        price: item.price || 0,
                        productName: item.productName || "未命名商品",
                        imageUrl: item.images?.length > 0
                            ? item.images[0].imageUrl
                            : "/no-image.png", // 如果沒有圖片，顯示預設圖片
                    }));
                    console.log("加載的購物車內容：", cartItems.value);
                } else {
                    console.warn("購物車內容為空！");
                }
            } catch (error) {
                console.error("加載購物車內容失敗：", error.response?.data || error.message);
                alert("無法加載購物車內容，請稍後再試！");
            }
        };

        // 付款確認邏輯
        const confirmPayment = async () => {
            if (paymentMethod.value === "credit_card") {
                confirmECPayPayment();
            } else {
                confirmCashOnDelivery();
            }
        };

        //  貨到付款邏輯
        const confirmCashOnDelivery = async () => {
            if (!deliveryAddress.value) {
                alert("請輸入收貨地址！");
                return;
            }

            try {
                const response = await axios.post("/api/orders", {
                    userId: userId.value,
                    totalPrice: totalPrice.value,
                    deliveryAddress: deliveryAddress.value,
                    status: "Pending",
                    paymentStatus: "Pending",
                });
                //訂單成功後，存入訂單明細
                await saveOrderItems(response.data.orderId);
                alert("訂單已成功建立！");
                router.push("/order-success");
            } catch (error) {
                console.error("建立訂單失敗：", error.response?.data || error.message);
                alert("建立訂單時發生錯誤！");
            }
        };

        //  信用卡 (ECPay) 付款邏輯
        const confirmECPayPayment = async () => {
    if (!deliveryAddress.value) {
        alert("請輸入收貨地址！");
        return;
    }

    if (!userId.value) {
        try {
            userId.value = await fetchUserId();
        } catch (error) {
            alert("無法獲取用戶 ID，請重新登入！");
            return;
        }
    }

    console.log("發送 ECPay 付款請求", {
        userId: userId.value,
        totalPrice: totalPrice.value,
        deliveryAddress: deliveryAddress.value,
    });

    try {
        const response = await axios.post("/api/ecpay/checkout", {
            userId: userId.value,
            totalPrice: totalPrice.value,
            deliveryAddress: deliveryAddress.value,
        }, {
            headers: { "Content-Type": "application/json" }
        });

        if (response.status === 200) {
            const paymentForm = response.data;
            const form = document.createElement("div");
            form.innerHTML = paymentForm;
            document.body.appendChild(form);
            form.querySelector("form").submit();

            console.log("📌 ECPay 付款跳轉成功，開始輪詢訂單狀態...");

            // ✅ 確保 orderId 正確
            pollOrderStatus(userId.value);
        } else {
            alert("無法獲取付款資訊！");
        }
    } catch (error) {
        console.error("發起 ECPay 付款失敗：", error.response?.data || error.message);
        alert("付款失敗，請稍後再試！");
    }
};




const pollOrderStatus = (userId) => {
    let attempts = 0;
    const maxAttempts = 12; // 最多輪詢 1 分鐘 (5 秒 * 12 次)

    const interval = setInterval(async () => {
        if (attempts >= maxAttempts) {
            clearInterval(interval);
            alert("❌ 訂單確認超時，請聯繫客服！");
            return;
        }
        attempts++;

        try {
            const response = await axios.get(`/api/orders/latest?userId=${userId}`);

            if (response.data && response.data.status === "Completed") {
                clearInterval(interval);
                console.log("✅ 訂單付款完成，開始存入 OrderItem...");

                // ✅ 確保 orderId 存在
                const orderId = response.data.orderId;
                if (!orderId) {
                    console.error("❌ 找不到 orderId，無法存入 OrderItem！");
                    return;
                }

                await saveOrderItems(orderId);
                alert("✅ 訂單已完成！");
                router.push("/order-success");
            } else {
                console.log("⏳ 訂單仍未完成，繼續輪詢...");
            }
        } catch (error) {
            console.error("❌ 查詢訂單狀態失敗:", error.response?.data || error.message);
        }
    }, 5000);
};





const saveOrderItems = async (orderId) => {
    if (!orderId) {
        console.error("❌ orderId 為 null，無法存入 OrderItem！");
        return;
    }

    try {
        console.log("📌 嘗試存入 OrderItem，Order ID:", orderId);

        for (const item of cartItems.value) {
            if (!item.id || !item.quantity || !item.price) {
                console.error("❌ 缺少必要的商品資訊:", { orderId, item });
                alert("❌ 訂單明細存入失敗，缺少必要的商品資訊！");
                continue;
            }

            const productId = item.id.productId || item.id;

            const payload = {
                id: { orderId, productId },
                order: { orderId },
                product: { productId },
                quantity: item.quantity,
                price: item.price,
            };

            console.log("📌 發送 OrderItem 請求:", payload);

            const response = await axios.post("/api/orderitems", payload, {
                headers: { "Content-Type": "application/json" }
            });

            console.log("✅ 訂單明細存入成功:", response.data);
        }
    } catch (error) {
        console.error("❌ 訂單明細存入失敗:", error.response?.data || error.message);
        alert("❌ 訂單明細存入失敗，請檢查商品資訊或後端 API 格式！");
    }
};




        const cancelOrder = () => {
            router.push("/cart");
        };

        // 初始化時加載購物車內容
        onMounted(loadCart);

        return {
            cartItems,
            totalPrice,
            paymentMethod,
            deliveryAddress,
            confirmPayment,
            cancelOrder,
            saveOrderItems,
        };
    },
};
</script>

<style scoped>
.order-card {
    background-color: #1e1e1e !important;
    color: white;
    padding: 20px;
}

.order-title {
    color: orange;
    font-size: 28px;
    text-align: center;
    font-weight: bold;
}

.order-text {
    font-size: 22px;
}

.total-price {
    color: #ff9800;
    font-size: 24px;
    font-weight: bold;
}

.cart-item-image {
    width: 100%;
    height: auto;
    border-radius: 4px;
}

.product-name {
    font-size: 20px;
    font-weight: bold;
}

.product-price,
.product-quantity {
    font-size: 18px;
}

.address-input {
    font-size: 18px;
}
</style>
