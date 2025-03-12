<template>
    <div>
        <v-container>
            <!-- 篩選欄 -->
            <v-row class="search-bar" justify="end" align="center">
                <v-col cols="auto" class="sort-buttons">
                    <button v-for="option in sortOptions" :key="option.value"
                        :class="['sort-button', { active: sortOption === option.value }]"
                        @click="setSortOption(option.value)">
                        {{ option.label }}
                    </button>
                </v-col>
                <!-- 搜尋欄 -->
                <v-col cols="auto" class="search-col">
                    <div class="search-container">
                        <input type="text" v-model="searchTerm" placeholder="搜尋商品" class="search-input"
                            @keyup.enter="searchProducts" />
                        <button class="search-button" @click="searchProducts">
                            <v-icon>mdi-magnify</v-icon>
                        </button>
                    </div>
                </v-col>
                <v-col cols="auto" class="cart-col">
                    <!-- 點擊購物車圖標後跳轉到購物車頁面 -->
                    <v-btn icon color="red" class="shopping-cart-btn" @click="viewCart">
                        <v-icon>mdi-cart</v-icon>
                    </v-btn>
                </v-col>

            </v-row>

            <!-- 新增分隔線 -->
            <v-divider class="custom-divider"></v-divider>

            <!-- 主體區域 -->
            <v-row>
                <!-- 商品分類 -->
                <v-col cols="3">
                    <v-select v-model="selectedCategory" :items="categories" label="商品分類" outlined dense
                        class="custom-input" @change="filterByCategory"></v-select>
                </v-col>

                <!-- 商品列表 -->
                <v-col cols="9">
                    <v-row>
                        <v-col v-for="product in paginatedProducts" :key="product.id" cols="12" md="4">
                            <v-card outlined class="custom-card">
                                <!-- 點擊卡片的其他區域跳轉詳情頁 -->
                                <div @click="viewProduct(product.productId)" class="card-clickable">
                                    <!-- 顯示第一張圖片，若無圖片則顯示佔位符 -->
                                    <v-img v-if="product.images && product.images.length > 0"
                                        :src="product.images[0].imageUrl" class="card-img" alt="商品圖片"></v-img>

                                    <v-card-title>{{ product.name }}</v-card-title>
                                    <v-card-subtitle>NT{{ product.price }}</v-card-subtitle>
                                </div>

                                <!-- 加入購物車按鈕 -->
                                <v-btn color="green" @click="addToCart(product)">加入購物車</v-btn>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>

            </v-row>
        </v-container>

        <!-- 分頁按鈕 (新的 footer) -->
        <footer class="pagination-footer">
            <v-row justify="center" class="pagination-container">
                <v-pagination v-model="currentPage" :length="pageCount" class="custom-pagination" @input="changePage">
                </v-pagination>
            </v-row>
        </footer>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
export default {
    setup() {
        const products = ref([]); // 全部商品
        const filteredProducts = ref([]); // 過濾後的商品
        const categories = ref(["全部"]);
        const selectedCategory = ref("全部");
        const searchTerm = ref("");
        const sortOption = ref("default");
        const sortOptions = ref([
            { value: "default", label: "綜合排序" },
            { value: "priceLowToHigh", label: "價格由低到高" },
            { value: "priceHighToLow", label: "價格由高到低" },
            { value: "sales", label: "銷量" },
            { value: "date", label: "新舊日期" },
        ]);
        const cartItems = ref([]); // 購物車內容
        const router = useRouter();
        const itemsPerPage = 9;
        const currentPage = ref(1);

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

        const fetchProducts = async () => {
            try {
                const response = await axios.get("/shop/status/1");
                console.log("後端返回的商品數據：", response.data);

                const rawProducts = response.data.map((product) => ({
                    id: product.id || product.productId || 0, // 統一為 id
                    name: product.name || "未命名商品",
                    price: product.price || 0,
                    images: product.images || [],
                }));
                console.log("處理後的商品數據：", rawProducts);

                products.value = rawProducts;
                filteredProducts.value = rawProducts;
            } catch (error) {
                console.error("無法加載商品數據：", error.message || error);
            }
        };


        // 跳轉到商品詳情頁
        const viewProduct = (productId) => {
            if (!productId) {
                console.error("商品 ID 無效！");
                return;
            }
            router.push(`/product/${productId}`);
        };




        const pageCount = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage));

        const paginatedProducts = computed(() => {
            const start = (currentPage.value - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            return filteredProducts.value.slice(start, end);
        });

        const fetchActiveProducts = async () => {
            try {
                const response = await axios.get("/shop/status/1");
                products.value = response.data.map(product => ({
                    ...product,
                    images: product.images || [], // 確保圖片為陣列
                }));
                console.log("商品圖片列表：", products.value);
                filteredProducts.value = products.value;
            } catch (error) {
                console.error("無法加載上架商品：", error.message || error);
            }
        };



        // 跳轉到購物車頁面
        const viewCart = () => {
            // 使用 Vue Router 的導航功能跳轉到購物車頁面
            window.location.href = "/cart"; // 替換為實際購物車頁面路由
        };


        const fetchCategories = async () => {
            try {
                const response = await axios.get("/shop/categories");
                if (response.status === 200 && Array.isArray(response.data)) {
                    categories.value = ["全部", ...response.data];
                } else {
                    console.warn("分類資料格式不正確");
                    categories.value = ["全部"];
                }
            } catch (error) {
                console.error("分類加載失敗:", error.message || error);
                categories.value = ["全部"];
            }
        };

        const filterByCategory = () => {
            if (selectedCategory.value === "全部") {
                filteredProducts.value = [...products.value]; // 顯示所有商品
            } else {
                filteredProducts.value = products.value.filter(
                    (product) => product.category === selectedCategory.value
                );
            }
            applySort(); // 篩選後按當前排序方式排序
        };

        const searchProducts = () => {
            filteredProducts.value = products.value.filter(product =>
                product.name.includes(searchTerm.value)
            );
            applySort();
            currentPage.value = 1;
        };

        const applySort = () => {
            if (sortOption.value === "priceLowToHigh") {
                filteredProducts.value = [...filteredProducts.value].sort((a, b) => a.price - b.price);
            } else if (sortOption.value === "priceHighToLow") {
                filteredProducts.value = [...filteredProducts.value].sort((a, b) => b.price - a.price);
            } else if (sortOption.value === "sales") {
                filteredProducts.value = [...filteredProducts.value].sort((a, b) => b.sales - a.sales);
            } else if (sortOption.value === "date") {
                filteredProducts.value = [...filteredProducts.value].sort((a, b) => new Date(b.date) - new Date(a.date));
            }
        };

        const setSortOption = (option) => {
            sortOption.value = option;
            applySort(); // 每次設置排序選項後執行排序
        };

        const changePage = (page) => {
            currentPage.value = page;
        };



        watch([selectedCategory, sortOption], () => {
            filterByCategory(selectedCategory.value);
            applySort();
        });

        onMounted(() => {
            fetchActiveProducts(); // 載入上架商品
            fetchCategories(); // 載入分類
        });

        return {
            products,
            categories,
            selectedCategory,
            searchTerm,
            filteredProducts,
            paginatedProducts,
            currentPage,
            pageCount,
            sortOption,
            sortOptions,
            filterByCategory,
            searchProducts,
            applySort,
            changePage,
            viewCart,
            addToCart,
            fetchProducts,
            cartItems,
            fetchActiveProducts,
            viewProduct,
            setSortOption,
            getCartId,
            fetchUserId
        };
    },
};
</script>

<style>
html,
body {
    background-color: #1e1e1e;
    color: #fff;
    margin: 0;
    padding: 0;
    height: 100%;
}
</style>

<style scoped>
/* 卡片樣式 */
.custom-card {
    background-color: #333;
    color: #fff;
    border-radius: 10px;
    border: 1px solid #444;
    height: 350px;
    /* 固定卡片高度 */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    /* 防止內容溢出 */
}

.custom-card .v-card-title,
.custom-card .v-card-subtitle {
    color: #fff;
}

/* 調整圖片大小並加圓角 */
.card-img {
    height: 200px;
    /* 自適應卡片高度 */
    width: 100%;
    /* 填滿卡片寬度 */
    object-fit: cover;
    /* 圖片按比例裁剪，避免變形 */
    border-bottom: 1px solid #444;
    /* 添加下邊框作為分隔 */
    border-top-left-radius: 10px;
    /* 與卡片圓角一致 */
    border-top-right-radius: 10px;
    /* 與卡片圓角一致 */
    display: block;
}

.custom-card .v-card-actions {
    margin-top: auto;
    /* 確保按鈕區域位於卡片底部 */
    padding: 8px;
    /* 增加內邊距 */
}

/* 分頁按鈕樣式 */
.pagination-footer {
    background-color: transparent;
    /* 使背景變透明 */
    padding: 5px 0;
    /* 減少內距，避免邊界過於明顯 */
    display: flex;
    justify-content: center;
    border: none;
    box-shadow: none;
    margin-bottom: -1px;
}

.pagination-container {
    background-color: #1e1e1e;
    /* 可以使用與內容區背景一致的顏色 */
    padding: 8px 16px;
    /* 控制內距 */
    display: inline-flex;
    /* 讓按鈕容器更緊湊 */
}

.custom-pagination .v-btn {
    background-color: #444;
    color: #fff;
    border-radius: 50%;
    /* 圓形按鈕 */
    margin: 0 4px;
    transition: background-color 0.3s, transform 0.3s;
}

/* 固定商品列表大小 */
.v-container {
    min-height: 1000px;
    /* 保證容器固定高度 */
}

.search-bar {
    margin-top: 30px;
    /* 與 header 保持距離 */
    display: flex;
    gap: 12px;
    /* 調整欄位間距 */
    justify-content: flex-end;
    /* 將內容靠右排列 */
    width: 100%;
    /* 撐滿父容器 */
}

/* 購物車按鈕樣式 */
.shopping-cart-btn {
    background-color: red;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    /* 移除額外間距 */

}

/* 購物車徽章樣式 */
.cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: white;
    color: red;
    font-weight: bold;
    border-radius: 50%;
    padding: 2px 8px;
    font-size: 12px;
    display: inline-block;
}

.custom-card {
    background-color: #333;
    color: #fff;
    border-radius: 10px;
    border: 1px solid #444;
    cursor: pointer;
    /* 鼠標懸停顯示為手形 */
}

.card-img {
    height: 200px;
    width: 100%;
    object-fit: cover;
    border-bottom: 1px solid #444;
}

.custom-card:hover {
    background-color: #444;
    /* 鼠標懸停時的背景色 */
    transition: background-color 0.3s ease;
}

.custom-divider {
    margin: 16px 0;
    /* 上下留白 */
    border-color: #444;
    /* 分隔線顏色 */
    opacity: 0.6;
    /* 調整透明度 */
}

.search-container {
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 50px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: auto;
    /* 自適應內容寬度 */
    max-width: 300px;
    /* 限制最大寬度 */
}

.search-input {
    flex: 1;
    border: none;
    padding: 10px 15px;
    font-size: 16px;
    color: #333;
    border-radius: 0;
    /* 確保無圓角干擾 */
    margin: 0;
    outline: none;
}

.search-input::placeholder {
    color: #aaa;
}

.search-button {
    background-color: #ff5722;
    /* 橘色 */
    color: white;
    border: none;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0;
    cursor: pointer;
    transition: background-color 0.3s;
    margin: 0;
    /* 確保按鈕和輸入框無間隙 */
    box-shadow: none;
}

.search-button:hover {
    background-color: #e64a19;
}

.filter-bar {
    margin-top: 20px;
    display: flex;
    gap: 8px;
    /* 按鈕間距 */
}

.sort-buttons {
    display: flex;
    gap: 12px;
    /* 調整按鈕之間的距離 */
}

/* 篩選欄格式 */
.sort-button {
    padding: 8px 16px;
    border: 1px solid white;
    border-radius: 4px;
    background-color: transparent;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
}

.sort-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.sort-button.active {
    background-color: #ff5722;
    /* 選中按鈕背景顏色 */
    color: white;
    border-color: #ff5722;
}
</style>
