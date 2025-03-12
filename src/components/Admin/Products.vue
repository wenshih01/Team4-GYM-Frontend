<template>
    <div class="product-container">
        <div class="top-bar">
            <div class="left-actions">
                <!-- 搜尋商品 -->
                <v-text-field v-model="search" label="以名稱搜尋" append-icon="mdi-magnify" outlined clearable
                    @keyup.enter="executeSearch" @click:append="executeSearch" style="width: 300px"></v-text-field>

                <!-- 商品狀態篩選 -->
                <v-select v-model="statusFilter" :items="statusOptions" label="商品狀態" item-title="title"
                    item-value="value" outlined dense  style="width: 300px"></v-select>
            </div>
            <!-- 新增商品按鈕 -->
            <v-btn color="primary" @click="openNew" class="add-product-btn">
                新增商品
            </v-btn>
        </div>

        <!-- 商品列表 -->
        <v-data-table :headers="headers" :items="filteredProducts" item-value="productId"
            class="elevation-1 custom-table" dense fixed-header alternate-row>
            <!-- 狀態顯示 -->
            <template v-slot:[`item.status`]="{ item }">
                <span :class="{
                    'active-status': item.status === 1,
                    'inactive-status': item.status === 0,
                    'deleted-status': item.status === 2,
                }">
                    {{ item.status === 1 ? '上架' : item.status === 0 ? '下架' : '假刪除' }}
                </span>
            </template>

            <!-- 操作按鈕 -->
            <template v-slot:[`item.actions`]="{ item }">
                <div class="actions-container">
                    <!-- 編輯商品 -->
                    <v-btn icon color="primary" size="small" @click.stop="editProduct(item)">
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>

                    <!-- 刪除商品 -->
                    <v-btn icon color="red" size="small" @click.stop="deleteProduct(item.productId)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>

                    <!-- 上下架切換 -->
                    <v-btn icon :color="item.status === 1 ? 'warning' : item.status === 0 ? 'success' : 'gray'"
                        size="small" @click.stop="toggleProductStatus(item)">
                        <v-icon>
                            {{ item.status === 1 ? 'mdi-toggle-switch-off' : item.status === 0 ? 'mdi-toggle-switch' :
                                'mdi-trash-can-outline' }}
                        </v-icon>
                    </v-btn>
                </div>
            </template>

            <!-- 商品名稱顯示並點擊查看詳細資訊 -->
            <template v-slot:[`item.name`]="{ item }">
                <span class="link" @click="showDetails(item)">
                    {{ item.name }}
                </span>
            </template>
        </v-data-table>

        <!-- 新增/編輯商品對話框 -->
        <v-dialog v-model="productDialog" max-width="600px">
            <v-card class="black-background">
                <v-card-title class="orange-text">
                    <span>{{ isEditMode ? '編輯商品' : '新增商品' }}</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="product.name" label="名稱" outlined></v-text-field>
                    <v-text-field v-model="product.description" label="描述" outlined></v-text-field>
                    <v-text-field v-model="product.price" label="價格" type="number" outlined></v-text-field>
                    <v-text-field v-model="product.stockQuantity" label="庫存數量" type="number" outlined></v-text-field>
                    <v-select v-model="product.category" :items="categories" label="分類" outlined></v-select>
                    <v-text-field v-model="product.createdAt" label="創建時間" readonly outlined></v-text-field>
                    <v-text-field v-model="product.updatedAt" label="更新時間" readonly outlined></v-text-field>
                    <v-select v-model="product.status" :items="statusOptions" label="狀態" item-title="title"
                        item-value="value" outlined></v-select>

                    <!-- 現有圖片顯示與刪除功能 -->
                    <div v-if="isEditMode">
                        <h4>現有圖片</h4>
                        <v-row>
                            <v-col v-for="(image, index) in product.images" :key="index" cols="12" md="4">
                                <v-card>
                                    <v-img :src="image" max-height="150" alt="商品圖片"></v-img>
                                    <v-card-actions>
                                        <v-btn color="red" text @click="removeImage(index)">刪除</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- 新圖片上傳 -->
                    <v-file-input v-model="product.newImages" label="上傳新圖片" accept="images/*" multiple outlined>
                    </v-file-input>
                </v-card-text>
                <v-card-actions>
                    <v-btn text color="red" @click="closeDialog">取消</v-btn>
                    <v-btn text color="green" @click="saveProduct">儲存</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 商品詳細資訊對話框 -->
        <v-dialog v-model="detailsDialog" max-width="600px">
            <v-card class="black-background">
                <v-card-title class="orange-text">
                    <span>商品詳細資訊</span>
                </v-card-title>
                <v-card-text>
                    <!-- 商品圖片 -->
                    <div v-if="selectedProduct.images && selectedProduct.images.length > 0"
                        class="product-image-container">
                        <v-row>
                            <v-col v-for="(image, index) in selectedProduct.images" :key="index" cols="12" md="4">
                                <v-img :src="image" max-height="150" alt="商品圖片"></v-img>
                            </v-col>
                        </v-row>
                    </div>
                    <div v-else>
                        <p class="text">沒有圖片可顯示</p>
                    </div>

                    <p><strong>商品名稱：</strong> {{ selectedProduct.name }}</p>
                    <p><strong>描述：</strong> {{ selectedProduct.description }}</p>
                    <p><strong>價格：</strong> {{ selectedProduct.price }}</p>
                    <p><strong>庫存數量：</strong> {{ selectedProduct.stockQuantity }}</p>
                    <p><strong>分類：</strong> {{ selectedProduct.category }}</p>
                    <p><strong>狀態：</strong>
                        {{ selectedProduct.status === 1 ? '上架' : selectedProduct.status === 0 ? '下架' : '假刪除' }}
                    </p>
                    <p><strong>創建時間：</strong> {{ selectedProduct.createdAt }}</p>
                    <p><strong>更新時間：</strong> {{ selectedProduct.updatedAt }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-btn text color="red" @click="closeDetails">關閉</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8082'; // 後端 API 基本路徑

export default {
    setup() {
        const products = ref([]);
        const search = ref('');
        const statusFilter = ref(null);
        const productDialog = ref(false);
        const isEditMode = ref(false);
        const product = ref({
            name: '',
            description: '',
            price: null,
            stockQuantity: null,
            category: '',
            images: [],
            createdAt: '',
            updatedAt: '',
            status: null,
        });



        const statusOptions = ref([
            { title: '全部', value: null },
            { title: '上架', value: 1 },
            { title: '下架', value: 0 },
            { title: '隱藏', value: 2 },
        ]);
        const categories = ref(['健身器材', '運動服飾', '健身配件', '運動鞋', '居家健身設備', '瑜伽用品', '訓練輔具', '健身包袋', '運動科技產品', '營養補給品']);
        const headers = ref([
            { title: '商品ID', value: 'productId' },
            { title: '名稱', value: 'name' },
            { title: '描述', value: 'description' },
            { title: '價格', value: 'price' },
            { title: '庫存數量', value: 'stockQuantity' },
            { title: '分類', value: 'category' },
            { title: '狀態', value: 'status' },
            { title: '操作', value: 'actions', sortable: false },
        ]);

        const filteredProducts = computed(() => {
            if (statusFilter.value === null) {
                return products.value;
            }
            return products.value.filter((p) => p.status === statusFilter.value);
        });

        const fetchProducts = async () => {
            try {
                const response = await axios.get('/shop/list');
                console.log("後端返回的商品數據：", response.data);

                products.value = response.data.map((product) => ({
                    ...product,
                    images: product.images
                        ? product.images.map((imageObj) => {
                            // 根據數據結構提取圖片 URL
                            const imageUrl = typeof imageObj === 'string' ? imageObj : imageObj.imageUrl || '';
                            if (!imageUrl) {
                                console.warn("圖片數據無效：", imageObj);
                                return ''; // 無效圖片設置為空字符串
                            }
                            return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8082${imageUrl}`;
                        })
                        : [],
                }));
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };



        const executeSearch = async () => {
            try {
                const response = await axios.get('/shop/search', { params: { name: search.value } });
                products.value = response.data;
            } catch (error) {
                console.error('Error searching products:', error);
            }
        };

        const toggleProductStatus = async (item) => {
    try {
        const nextStatus = item.status === 1 ? 0 : item.status === 0 ? 2 : 1;
        const response = await axios.put(`/shop/product/${item.productId}/status/${nextStatus}`);
        const updatedProduct = response.data;

        const index = products.value.findIndex((p) => p.productId === updatedProduct.productId);
        if (index !== -1) {
            products.value[index] = {
                ...products.value[index], // 保留原有數據（包括圖片）
                ...updatedProduct, // 更新狀態相關字段
                images: products.value[index].images, // 明確保留原始圖片數據
            };
        }
    } catch (error) {
        console.error("Error toggling product status:", error);
    }
};

        const deleteProduct = async (productId) => {
            try {
                await axios.delete(`/shop/delete/${productId}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        };

        const viewDetails = (product) => {
            selectedProduct.value = {
                ...product,
                images: product.images
                    ? product.images.map((imageUrl) =>
                        imageUrl.startsWith('http') ? imageUrl : `http://localhost:8082${imageUrl}`
                    ) // 確保圖片為完整路徑
                    : [], // 如果沒有圖片，初始化為空數組
            };
            console.log("selectedProduct.images:", selectedProduct.value.images); // 調試輸出
            detailsDialog.value = true; // 打開詳細資訊對話框
        };





        const editProduct = (item) => {
    product.value = {
        ...item,
        images: Array.isArray(item.images)
            ? item.images.map((image) => {
                if (typeof image !== "string") {
                    console.warn("圖片數據無效：", image);
                    return ""; // 無效圖片設置為空字串
                }
                return image.startsWith("http") ? image : `http://localhost:8082${image}`;
            })
            : [], // 如果沒有圖片，初始化為空數組
        newImages: [], // 初始化新圖片列表
    };
    isEditMode.value = true;
    productDialog.value = true;
};




        const openNew = () => {
            product.value = {};
            isEditMode.value = false;
            productDialog.value = true;
        };

        const closeDialog = () => {
            productDialog.value = false;
        };

        const detailsDialog = ref(false); // 控制詳細資訊對話框

        const selectedProduct = ref({
            name: '',
            description: '',
            price: null,
            stockQuantity: null,
            category: '',
            images: [], // 初始化為空數組，用於存儲多張圖片
            createdAt: '',
            updatedAt: '',
            status: null,
        });


        // 點擊商品名稱顯示詳細資訊
        const showDetails = (item) => {
            selectedProduct.value = {
                ...item,
                images: item.images
                    ? item.images.map((image) => {
                        if (typeof image !== "string") {
                            console.warn("圖片數據無效：", image);
                            return ""; // 無效圖片設置為空
                        }
                        return image.startsWith("http") ? image : `http://localhost:8082${image}`;
                    })
                    : [], // 如果沒有圖片，初始化為空數組
            };

            detailsDialog.value = true; // 打開對話框
        };




        // 關閉詳細資訊對話框
        const closeDetails = () => {
            detailsDialog.value = false;
        };





        const saveProduct = async () => {
            try {
                const formData = new FormData();

                // 添加商品基本數據
                for (const key in product.value) {
                    if (key !== 'images' && key !== 'newImages') {
                        // 避免提交 images 和 newImages 字段，這些需要單獨處理
                        formData.append(key, product.value[key]);
                    }
                }

                // 添加新圖片
                if (product.value.newImages && product.value.newImages.length > 0) {
                    product.value.newImages.forEach((images) => {
                        formData.append('images', images);
                    });
                }

                const url = product.value.productId ? '/shop/update' : '/shop/save';
                const method = product.value.productId ? 'put' : 'post';

                console.log('Saving product with data:', Object.fromEntries(formData.entries()));

                // 發送請求
                await axios({
                    method,
                    url,
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                // 成功後刷新商品列表並關閉對話框
                await fetchProducts();
                closeDialog();
            } catch (error) {
                // 輸出錯誤信息，方便排查
                console.error('Error saving product:', error);
            }
        };





        const removeImage = async (index) => {
            const confirmDelete = confirm("確定要刪除這張圖片嗎？");
            if (!confirmDelete) return;

            try {
                const imageUrl = product.value.images[index].replace("http://localhost:8082", "");

                const response = await axios.delete(`/shop/images`, {
                    headers: { "Content-Type": "application/json" },
                    data: { productId: product.value.productId, imageUrl },
                });

                if (response.status === 200) {
                    product.value.images.splice(index, 1);
                    alert("圖片刪除成功！");
                } else {
                    alert("刪除圖片可能失敗，請檢查伺服器日誌！");
                }
            } catch (error) {
                console.error("刪除圖片失敗：", error);
                alert(`刪除圖片失敗：${error.response?.data || "未知錯誤"}`);
            }
        };










        fetchProducts();

        return {
            products,
            search,
            statusFilter,
            productDialog,
            isEditMode,
            product,
            statusOptions,
            categories,
            headers,
            filteredProducts,
            executeSearch,
            fetchProducts,
            toggleProductStatus,
            deleteProduct,
            editProduct,
            openNew,
            closeDialog,
            saveProduct,
            detailsDialog,
            selectedProduct,
            showDetails,
            closeDetails,
            viewDetails,
            removeImage
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

.add-product-btn {
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

.product-image-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    margin-bottom: 16px;
}

.product-card {
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: box-shadow 0.3s ease;
}

.product-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.delete-btn {
    color: red;
    font-size: 14px;
    text-transform: uppercase;
    font-weight: bold;
    cursor: pointer;
    padding: 8px;
}

.delete-btn:hover {
    color: darkred;
}

.product-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.text {
    color: red;
}
</style>
