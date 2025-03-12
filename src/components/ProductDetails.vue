<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" md="8">
                <v-card class="vcard">
                    <v-card-title>
                        <h2 class="h2">{{ product.name }}</h2>
                    </v-card-title>
                    <v-card-text>
                        <!-- 圖片輪播 -->
                        <v-carousel v-if="product.images.length > 0" :show-arrows="false">
                            <v-carousel-item v-for="(image, index) in product.images" :key="index">
                                <v-img :src="image" class="carousel-img" alt="商品圖片"></v-img>
                            </v-carousel-item>
                        </v-carousel>
                        <p>{{ product.description }}</p>
                        <p><strong>價格：</strong> NT{{ product.price }}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn class="large-text-btn" color="success" @click="addToCart(product)">加入購物車</v-btn>
                        <v-btn class="large-text-btn" text color="red" @click="goBack">返回</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

export default {
    setup() {
        const route = useRoute(); // 獲取路由參數
        const router = useRouter(); // 路由導航
        const product = ref({
            name: "",
            description: "",
            price: 0,
            images: [],
        });

        // 加載商品詳情
        const fetchProduct = async () => {
            const productId = route.params.id;

            if (!productId) {
                console.error("未獲取到商品 ID，無法加載商品詳情！");
                return;
            }

            try {
                const response = await axios.get(`/shop/gym/${productId}`);
                product.value = {
                    ...response.data,
                    images: response.data.images.map(img => img.imageUrl), // 提取圖片 URL
                };
            } catch (error) {
                console.error("無法加載商品詳情：", error.message || error);
            }
        };


        // 返回上一頁
        const goBack = () => {
            router.push("/Shop"); // 返回到主頁
        };

        // 從 session 獲取用戶 ID
        const fetchUserId = async () => {
            try {
                const response = await axios.get("api/profile", {
                    withCredentials: true,
                });
                if (response.data && response.data.id) {
                    console.log("從 session 獲取的 userId：", response.data.id);
                    return response.data.id;
                }
                throw new Error("未登入或無法獲取用戶 ID");
            } catch (error) {
                console.error("無法從 session 獲取用戶 ID：", error);
                alert("請先登入以使用購物車功能！");
                throw error;
            }
        };



        const getCartId = async () => {
            try {
                const userId = await fetchUserId(); // 從 session 獲取 userId
                console.log("成功從 session 獲取 userId：", userId);

                // 查詢用戶的購物車
                try {
                    const response = await axios.get(`/cart/user/${userId}`);
                    if (response.status === 200 && response.data.cartId) {
                        console.log("從後端獲取的購物車 ID：", response.data.cartId);
                        return response.data.cartId;
                    }
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        console.warn("購物車不存在，準備創建新的購物車...");
                        // 如果購物車不存在，創建一個新的購物車
                        const newCartResponse = await axios.post("/cart", {
                            userId: userId,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });
                        console.log("創建新購物車成功：", newCartResponse.data);
                        return newCartResponse.data.cartId;
                    }
                    throw error; // 如果是其他錯誤，向上拋出
                }
            } catch (error) {
                console.error("獲取購物車 ID 失敗：", error.response || error.message);
                throw error;
            }
        };


        // 加入購物車
        const addToCart = async (product) => {
            try {
                const productId = product.id || product.productId;
                console.log("檢查商品 ID：", productId);

                if (!productId || productId === 0) {
                    alert("商品 ID 無效，無法加入購物車！");
                    throw new Error("無效的商品 ID");
                }

                const cartId = await getCartId();
                console.log("準備加入購物車的 cartId：", cartId);

                const cartItem = {
                    id: {
                        cartId: cartId,
                        productId: productId,
                    },
                    quantity: 1,
                    price: product.price.toFixed(2),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                const response = await axios.post("/cartItems", cartItem);
                console.log("加入購物車成功：", response.data);

                if (response.status === 200) {
                    alert(`${product.name} 已成功加入購物車！`);
                }
            } catch (error) {
                console.error("加入購物車失敗：", error.response?.data || error.message);
                alert("加入購物車時發生錯誤！");
            }
        };

        onMounted(() => {
            fetchProduct();
        });

        return {
            product,
            goBack,
            addToCart,
        };
    },
};
</script>
<style scoped>
.carousel-img {
    height: 300px;
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
}

.vcard {
    background-color: #1e1e1e;
}

.h2 {
    color: #ef8030;

}


/* 圖片輪播內的圖片樣式 */
.carousel-img {
    height: 400px;
    /* 固定高度，根據需求調整 */
    object-fit: cover;
    /* 圖片比例保持一致 */
    border-radius: 8px;
    /* 與背景一致的圓角 */

}

.v-card-text {
    color: white;
    font-size: 24px;
}

:deep(.v-carousel__controls) {
    background: transparent !important;
}

.large-text-btn {
    font-size: 20px;
    /* 設置按鈕字體大小 */
    font-weight: bold;
    /* 可選：加粗文字 */
}
</style>
