<template>
    <div class="table-container">
        <div class="top-bar">
            <v-text-field v-model="search" label="以使用者搜尋" append-icon="mdi-magnify" outlined clearable
                @keyup.enter="executeSearch" @click:append="executeSearch" @click:clear="showAllPosts"
                style="max-width: 300px;"></v-text-field>

            <v-btn color="primary" @click="openNew">
                新增貼文
            </v-btn>
        </div>

        <!-- DataTable -->
        <v-data-table :headers="headers" :items="posts" item-value="postId" class="elevation-1 custom-table" dense
            fixed-header alternate-row @click:row="(event, { item }) => viewPostDetails(item)">
            <template v-slot:[`item.actions`]="{ item }">
                <div class="actions-container">
                    <v-btn icon color="primary" size="small" class="btnEdit" @click.stop="editPost(item)">
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon color="red" size="small" @click.stop="deletePost(item.postId)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </div>
            </template>
        </v-data-table>

        <template>
            <v-dialog v-model="postDialog" max-width="800px">
                <v-card class="post-dialog">
                    <v-card-title class="dialog-title">
                        {{ isEditMode ? (post.postId ? "編輯貼文" : "新增貼文") : "貼文詳細資訊" }}
                    </v-card-title>

                    <v-card-text class="dialog-content">
                        <!-- 會員ID -->
                        <div class="info-block">
                            <strong class="info-label">會員 ID:</strong>
                            <span class="info-text">{{ post.username }}</span>
                        </div>

                        <!-- 內容 -->
                        <div class="info-block">
                            <strong class="info-label">內容:</strong>
                            <v-textarea v-if="isEditMode" v-model="post.content" rows="4" variant="outlined"
                                class="content-textarea"></v-textarea>
                            <p v-else class="content-text">{{ post.content }}</p>
                        </div>

                        <!-- 狀態選擇 (編輯模式且有 postId) -->
                        <div class="info-block status-block" v-if="isEditMode && post.postId">
                            <strong class="info-label">狀態:</strong>
                            <v-select v-model="post.reviewStatus" :items="reviewStatusOptions" variant="outlined"
                                class="status-select"></v-select>
                        </div>

                        <!-- 狀態顯示 (查看模式且有 postId) -->
                        <div class="info-block" v-if="!isEditMode && post.postId">
                            <strong class="info-label">狀態:</strong>
                            <span class="info-text">{{ post.reviewStatus || '正常' }}</span>
                        </div>

                        <div class="info-block" v-if="!isEditMode && post.postId && post.reported">
                            <div class="report-info">
                                <strong class="info-label">檢舉資訊:</strong>
                                <div class="report-details">
                                    <div class="report-item">
                                        <span class="report-label">檢舉人:</span>
                                        <span class="report-text">{{ post.reportedByUsername }}</span>
                                    </div>
                                    <div class="report-item">
                                        <span class="report-label">檢舉原因:</span>
                                        <span class="report-text">{{ post.reportReason }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 圖片區塊 -->
                        <div class="info-block">
                            <strong class="info-label">圖片:</strong>
                            <div v-if="isEditMode" class="image-container">
                                <!-- 圖片預覽 -->
                                <div v-for="(url, index) in imagePreviews" :key="index" class="image-item">
                                    <v-img :src="url" width="150" height="150" cover class="image-preview">
                                    </v-img>
                                    <v-btn icon="mdi-close" size="small" color="error" variant="text"
                                        class="delete-image-btn" @click="removeImage(index)">
                                    </v-btn>
                                </div>

                                <!-- 上傳按鈕改為帶有預覽的版本 -->
                                <div class="upload-container">
                                    <v-file-input v-model="selectedFiles" label="選擇圖片" multiple accept="image/*"
                                        @change="handleImageUpload" hide-details class="file-upload" variant="outlined"
                                        prepend-icon="" :show-size="true">
                                        <template v-slot:selection="{ fileNames }">
                                            <template v-for="fileName in fileNames" :key="fileName">
                                                <v-chip size="small" label color="orange" class="me-2">
                                                    {{ fileName }}
                                                </v-chip>
                                            </template>
                                        </template>
                                    </v-file-input>
                                </div>
                            </div>
                            <!-- 查看模式圖片 -->
                            <div v-else class="image-container">
                                <div v-for="(url, index) in post.imageUrls" :key="index" class="image-item">
                                    <v-img :src="url.startsWith('http') ? url : `${baseUrl}${url}`" width="150"
                                        height="150" cover class="image-preview">
                                    </v-img>
                                </div>
                            </div>
                        </div>

                        <template v-if="post.postId"> <!-- 只在有 postId 時才顯示留言區塊 -->
                            <div v-if="post.comments && post.comments.length > 0" class="info-block">
                                <strong class="info-label">留言:</strong>
                                <div class="comments-container">
                                    <ul>
                                        <li v-for="(comment, index) in post.comments" :key="index">
                                            <div class="comment-header">
                                                <strong class="comment-user">{{ comment.username }}</strong>
                                                <!-- 添加刪除按鈕 -->
                                                <v-btn v-if="isEditMode" icon="mdi-delete" size="small" color="error"
                                                    variant="text" @click="deleteComment(comment.commentId)"
                                                    class="delete-comment-btn"></v-btn>
                                            </div>
                                            <div class="comment-content">{{ comment.content }}</div>
                                            <div class="comment-meta">
                                                {{ new Date(comment.createdAt).toLocaleString() }}
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </template>
                    </v-card-text>

                    <v-card-actions class="dialog-actions">
                        <v-spacer></v-spacer>
                        <v-btn color="white" variant="text" @click="hideDialog">關閉</v-btn>
                        <v-btn v-if="isEditMode" color="orange" variant="text" @click="savePost">儲存</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </template>
    </div>

    <v-snackbar v-model="deleteConfirmation" :timeout="-1" color="error" location="bottom center">
        確定要刪除這篇貼文嗎？

        <template v-slot:actions>
            <v-btn color="white" variant="text" @click="deleteConfirmation = false">
                取消
            </v-btn>
            <v-btn color="white" variant="text" @click="confirmDelete">
                確定
            </v-btn>
        </template>
    </v-snackbar>

    <v-snackbar v-model="snackbar" :timeout="2000" :color="snackbarColor" location="bottom center">
        {{ snackbarMessage }}
    </v-snackbar>
</template>

<script>
import { ref } from 'vue';
import axios from 'axios';

export default {
    setup() {
        const posts = ref([]);
        const post = ref({});
        const postDialog = ref(false);
        const isEditMode = ref(false); // 控制查看/編輯模式
        const search = ref(""); // 搜尋欄的內容
        const headers = ref([
            { title: 'Post ID', value: 'postId' },
            { title: '使用者', value: 'username' },
            { title: '內容', value: 'content' },
            { title: '按讚數', value: 'likesCount' },
            { title: '留言數', value: 'commentsCount' },
            { title: '狀態', value: 'reviewStatus' },
            { title: '操作', value: 'actions', sortable: false },
        ]);
        const selectedFiles = ref([]); // 存儲選中的文件
        const imagePreviews = ref([]); // 存儲預覽圖片的 URL
        const baseUrl = 'http://localhost:8082';

        const reviewStatusOptions = [
            { title: '正常', value: '正常' },
            { title: '待審核', value: '待審核' },
            { title: '已審核', value: '已審核' },
            { title: '已駁回', value: '已駁回' }
        ];
        const snackbar = ref(false);
        const snackbarMessage = ref('');
        const snackbarColor = ref('success');
        const deleteConfirmation = ref(false);
        const pendingDeleteId = ref(null);

        const fetchPosts = async () => {
            try {

                const response = await axios.get('http://localhost:8082/api/posts', {
                    params: {
                        page: 0,    // 從第0頁開始
                        size: 1000,   // 改為 20 筆資料
                        sort: 'createdAt',
                        direction: 'DESC'
                    }
                });

                if (response.data && response.data.content) {
                    posts.value = response.data.content.map(post => ({
                        ...post,
                        comments: post.comments || []
                    }));
                } else if (Array.isArray(response.data)) {
                    posts.value = response.data.map(post => ({
                        ...post,
                        comments: post.comments || []
                    }));
                } else {
                    posts.value = [];
                    console.error('意外的數據格式:', response.data);
                }
            } catch (error) {
                console.error('獲取貼文錯誤:', error.response || error);
                posts.value = [];
            } finally {

            }
        };
        const fetchPostDetails = async (postId) => {
            try {
                const response = await axios.get(`http://localhost:8082/api/posts/${postId}`);
                post.value = response.data;
                imagePreviews.value = post.value.imageUrls || []; // 初始化圖片
            } catch (error) {
                console.error("Error fetching post details:", error);
            }
        };

        const executeSearch = async () => {
            try {
                if (!search.value.trim()) {
                    await fetchPosts();
                    return;
                }

                const response = await axios.get(`http://localhost:8082/api/posts/search`, {
                    params: { username: search.value.trim() }
                });

                if (Array.isArray(response.data)) {
                    posts.value = response.data;
                } else {
                    posts.value = [];
                    console.error('Unexpected data format:', response.data);
                }
            } catch (error) {
                console.error('Error fetching filtered posts:', error);
                posts.value = [];
            }
        };

        const openNew = () => {
            post.value = {
                username: 'admin',  // 預設會員ID
                content: '',     // 清空內容
                imageUrls: []    // 清空圖片陣列
            };
            imagePreviews.value = [];    // 清空圖片預覽
            selectedFiles.value = null;  // 清空已選檔案
            isEditMode.value = true;
            postDialog.value = true;
        };


        const editPost = (selectedPost) => {
            post.value = { ...selectedPost };
            imagePreviews.value = selectedPost.imageUrls
                ? selectedPost.imageUrls.map(url =>
                    url.startsWith('http') ? url : `${baseUrl}${url}`)
                : [];
            selectedFiles.value = null;
            isEditMode.value = true;
            postDialog.value = true;
        };

        const viewPostDetails = async (selectedPost) => {
            try {
                const response = await axios.get(`http://localhost:8082/api/posts/${selectedPost.postId}`);
                post.value = response.data;
                // 處理圖片 URL
                imagePreviews.value = response.data.imageUrls
                    ? response.data.imageUrls.map(url => url.startsWith('http') ? url : `${baseUrl}${url}`)
                    : [];
                isEditMode.value = false;
                postDialog.value = true;
            } catch (error) {
                console.error('Error fetching post details:', error);
            }
        };
        const showAllPosts = async () => {
            search.value = ''; // 清空搜尋欄
            await fetchPosts(); // 重新獲取所有貼文
        };

        const hideDialog = () => {
            postDialog.value = false;
        };
        const savePost = async () => {
            try {
                const formData = new FormData();
                formData.append("username", post.value.username || 'admin'); // 改為 username
                formData.append("content", post.value.content || '');
                formData.append("reviewStatus", post.value.reviewStatus || '正常');

                // 添加被刪除的圖片 URL 列表
                if (post.value.postId) {
                    const originalUrls = post.value.imageUrls || [];
                    const currentUrls = imagePreviews.value
                        .filter(url => url.startsWith('http://localhost:8082'))
                        .map(url => url.replace('http://localhost:8082', ''));

                    const deletedUrls = originalUrls.filter(url => !currentUrls.includes(url));
                    deletedUrls.forEach(url => {
                        formData.append('deletedImages', url);
                    });
                }

                // 添加新上傳的圖片
                if (selectedFiles.value) {
                    Array.from(selectedFiles.value).forEach((file) => {
                        formData.append(`images`, file);
                    });
                }

                let response;
                if (post.value.postId) {
                    response = await axios.put(
                        `http://localhost:8082/api/posts/${post.value.postId}`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                    snackbarMessage.value = '更新成功！';
                } else {
                    response = await axios.post(
                        'http://localhost:8082/api/posts',
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );
                    snackbarMessage.value = '新增成功！';
                }

                snackbarColor.value = 'success';
                snackbar.value = true;
                await fetchPosts();
                hideDialog();
            } catch (error) {
                console.error('Error saving post:', error);
                snackbarColor.value = 'error';
                snackbarMessage.value = '操作失敗！';
                snackbar.value = true;
            }
        };

        const deletePost = (postId) => {
            pendingDeleteId.value = postId;
            deleteConfirmation.value = true;
        };

        const confirmDelete = async () => {
            try {
                await axios.delete(`http://localhost:8082/api/posts/${pendingDeleteId.value}`);
                deleteConfirmation.value = false;
                snackbarColor.value = 'success';
                snackbarMessage.value = '刪除成功！';
                snackbar.value = true;
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                snackbarColor.value = 'error';
                snackbarMessage.value = '刪除失敗！';
                snackbar.value = true;
            }
        };

        const deleteComment = async (commentId) => {
            try {
                // 顯示確認對話框
                if (!window.confirm('確定要刪除這則留言嗎？')) {
                    return;
                }

                await axios.delete(`http://localhost:8082/api/comments/${commentId}`);

                // 更新貼文詳細資訊以刷新留言列表
                if (post.value.postId) {
                    await fetchPostDetails(post.value.postId);
                }
            } catch (error) {
                console.error('Error deleting comment:', error);
                alert('刪除留言失敗');
            }
        };

        const handleImageUpload = (files) => {
            if (!files) {
                return;
            }

            // 清除舊的預覽
            imagePreviews.value = [];

            // 生成新的預覽
            Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreviews.value.push(e.target.result);
                };
                reader.readAsDataURL(file);
            });
        };

        const removeImage = (index) => {
            imagePreviews.value.splice(index, 1);
            //因為 selectedFiles.value 可能是 null
            if (selectedFiles.value) {
                const files = Array.from(selectedFiles.value);
                files.splice(index, 1);

                // 重新建立 FileList
                const dataTransfer = new DataTransfer();
                files.forEach(file => {
                    dataTransfer.items.add(file);
                });
                selectedFiles.value = dataTransfer.files;
            }
        };

        fetchPosts(); // 初始化載入貼文

        return {
            posts,
            post,
            postDialog,
            isEditMode,
            headers,
            search,
            executeSearch,
            openNew,
            editPost,
            viewPostDetails,
            imagePreviews,
            hideDialog,
            savePost,
            deletePost,
            deleteComment,
            handleImageUpload,
            removeImage,
            selectedFiles,
            reviewStatusOptions,
            showAllPosts,
            baseUrl,
            snackbar,
            snackbarMessage,
            snackbarColor,
            deleteConfirmation,
            confirmDelete,
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

.table-container {
    width: 100%;

    margin: 0;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    width: 100%;
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



.btnEdit {
    padding: 4px;
    font-size: 12px;
}

.btnDelete {
    padding: 4px;
    font-size: 12px;
}

.actions-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;
}

/* Dialog 樣式 */
.v-dialog :deep(.v-card) {
    background-color: #2c2c2c !important;
    color: white !important;
}

.v-dialog :deep(.v-card-title) {
    color: rgb(245, 118, 34) !important;
    background-color: #3c3c3c !important;
}

.v-dialog :deep(.v-card-text) {
    color: #e0e0e0 !important;
}

.v-dialog :deep(.v-field__input) {
    color: white !important;
    background-color: #3c3c3c !important;
    resize: none;
}

.v-dialog :deep(.v-label) {
    color: #e0e0e0 !important;
}

.v-input--horizontal {
    margin-bottom: 15px;
    flex: 1;
    max-width: 400px;
    height: 50px;
}



.image-preview img {
    max-width: 150px;
    height: auto;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.image-preview .mdi-close {
    position: absolute;
    top: 0;
    right: 0;
    background-color: red;
    color: white;
    border-radius: 50%;
    cursor: pointer;
}

.image-preview-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 16px;
}

.image-preview {
    position: relative;
    width: 150px;
    height: 150px;
}

.remove-image-btn {
    position: absolute !important;
    top: 4px;
    right: 4px;
    z-index: 1;
}

/* 上傳按鈕樣式 */
.v-file-input {
    width: 100%;
    max-width: 300px;
}

/* 搜尋欄位樣式 */
.v-text-field :deep(.v-field__input) {
    color: #fffefd !important;
    /* 使用相同的橘色 */
    font-weight: 500;
    /* 稍微加粗 */
}

/* 搜尋 icon 的顏色 */
.v-text-field :deep(.v-icon) {
    color: #ec6606 !important;
}


.v-text-field :deep(.v-field__input::placeholder) {
    color: rgba(254, 254, 253, 0.7) !important;
    /* 較淡的橘色 */
}

/* label 顏色 */
.v-text-field :deep(.v-label) {
    color: #f8f5f3 !important;
}

/* 添加留言區塊的樣式 */
ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

li {
    padding: 12px 16px;
    margin-bottom: 10px;
    border-radius: 8px;
    background-color: #3c3c3c;
    transition: background-color 0.2s;
}

li:hover {
    background-color: #454545;
}

.comment-meta {
    font-size: 0.8em;
    color: #999;
    margin-top: 4px;
}

/* 如果需要滾動條 */
.comments-container {
    max-height: 300px;
    overflow-y: auto;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.comment-user {
    color: #ef8030;
    font-size: 1rem;
}

.delete-comment-btn {
    opacity: 0.7;
    transition: opacity 0.2s;
}

.delete-comment-btn:hover {
    opacity: 1;
}

.post-dialog {
    padding: 0;
    background-color: #2c2c2c !important;
}

.dialog-title {
    padding: 16px 24px;
    background-color: #3c3c3c !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dialog-content {
    padding: 24px !important;
}

.info-block {
    margin-bottom: 30px;
}

.info-label {
    display: block;
    color: #ef8030;
    margin-bottom: 8px;
    font-size: 1rem;
}

.info-text {
    color: #e0e0e0;
}

.content-textarea {
    background-color: #3c3c3c;
    border-radius: 8px;
    margin-top: 8px;
}

.content-text {
    color: #e0e0e0;
    line-height: 1.6;
    margin: 8px 0;
}

.image-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
    margin-top: 8px;
}


.image-item {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #3c3c3c;
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.delete-image-btn {
    position: absolute !important;
    top: 4px;
    right: 4px;
    z-index: 2;
    background-color: rgba(255, 0, 0, 0.7) !important;
}

:deep(.v-file-input) {
    .v-field__field {
        min-height: 44px;
        padding-top: 0;
    }

    .v-field__input {
        min-height: 44px;
        padding: 8px 12px;
    }
}

.file-upload {
    grid-column: 1 / -1;
    margin-top: 16px;
}

.dialog-actions {
    padding: 16px 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 確保輸入框文字顏色 */
:deep(.v-field__input) {
    color: white !important;
}

:deep(.v-field--variant-outlined .v-field__outline) {
    color: rgba(255, 255, 255, 0.2);
}

:deep(.v-field--variant-outlined:hover .v-field__outline) {
    color: #ef8030;
}

:deep(.v-select__selection-text) {
    color: #000
}

/* 狀態選擇下拉框樣式 */


.status-block {
    margin-top: 40px;
    /* 增加上方間距 */
}

.status-select {
    max-width: 200px;
    margin-top: 16px;
    /* 增加選擇器與標籤之間的間距 */
}

/* 確保下拉選單的文字顏色 */
:deep(.v-select .v-field__input) {
    color: rgb(255, 255, 255) !important;
}

:deep(.v-select .v-select__selection) {
    color: white !important;
}

:deep(.v-select .v-select__item-title) {
    color: #ffffff !important;
}

.report-info {

    border-radius: 8px;
    padding: 0px;
    margin-top: 8px;
}

.report-details {
    margin-top: 8px;
}

.report-item {
    margin-bottom: 8px;
    display: flex;
    align-items: flex-start;
}

.report-label {
    color: #999;
    min-width: 80px;
    display: inline-block;
}

.report-text {
    color: #e0e0e0;
    flex: 1;
}

/* 最後一個 report-item 不需要底部間距 */
.report-item:last-child {
    margin-bottom: 0;
}
</style>