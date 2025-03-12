<template>
  <v-infinite-scroll :onLoad="loadMore" class="layout">
    <!-- 左側導覽列 -->
    <nav class="sidebar">
      <ul></ul>
      <!-- 將通知鈴鐺和登出/登入按鈕包在同一個容器內 -->
      <div class="bottom-actions">
        <NotificationBell @show-post="showPostDetail" />
        <i class="fa-solid fa-user profile"></i>

        <div class="auth-action" @click="handleAuthAction">
          <i v-if="isLoggedIn" class="fa-solid fa-right-to-bracket"></i>
          <i v-else class="fa-solid fa-user avatar"></i>
        </div>
      </div>
    </nav>

    <!-- 主內容區 -->
    <div class="post-feed">
      <!-- 新增貼文觸發區塊 -->
      <div v-if="isLoggedIn" class="trigger-add-post" @click="toggleAddPost">
        <div class="avatar-container small">
          <img v-if="currentUser.avatar" :src="currentUser.avatar" :alt="currentUser.username" class="avatar"
            @error="handleAvatarError" />
          <i v-else class="fa-solid fa-user avatar-fallback"></i>
        </div>
        <div class="trigger-text">分享你的想法...</div>
      </div>

      <!-- 貼文列表 -->
      <div v-if="posts.length === 0" class="no-posts">
        <p>目前沒有貼文。</p>
      </div>
      <div v-else>
        <div v-for="post in posts" :key="post.postId" class="post-card">
          <!-- 貼文標題區 -->
          <div class="post-header">
            <div class="user-info">
              <div class="avatar-container">
                <img v-if="post.userAvatar" :src="post.userAvatar" :alt="post.username" class="avatar"
                  @error="handleAvatarError" />
                <i v-else class="fa-solid fa-user avatar-fallback"></i>
              </div>
              <div class="user-details">
                <span class="user-name">{{ post.username }}</span>
                <small class="timestamp">{{ formatTimeAgo(post.createdAt) }}</small>
              </div>
            </div>

            <!-- 選項選單 -->
            <v-menu v-if="currentUser.username === post.username" location="end">
              <template v-slot:activator="{ props }">
                <button v-bind="props" class="more-options-btn">
                  <i class="fa-solid fa-ellipsis"></i>
                </button>
              </template>
              <v-list bg-color="#2e2e2e">
                <v-list-item @click="editPost(post)">
                  <v-list-item-title class="menu-option">
                    <i class="fa-solid fa-pencil"></i>
                    編輯
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="confirmDeletePost(post)">
                  <v-list-item-title class="menu-option delete-option">
                    <i class="fa-solid fa-trash"></i>
                    刪除
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-menu v-else location="end">
              <template v-slot:activator="{ props }">
                <button v-bind="props" class="more-options-btn">
                  <i class="fa-solid fa-ellipsis"></i>
                </button>
              </template>
              <v-list bg-color="#2e2e2e">
                <v-list-item @click="reportPost(post)">
                  <v-list-item-title class="menu-option">
                    <i class="fa-solid fa-flag"></i>
                    檢舉
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <!-- 貼文內容 -->
          <div class="post-content">
            <p>{{ post.content }}</p>
            <div v-if="post.imageUrls && post.imageUrls.length > 0" class="post-images">
              <img v-for="(imageUrl, index) in post.imageUrls" :key="index" :src="`http://localhost:8082${imageUrl}`"
                :alt="`Post image ${index + 1}`" class="post-image" @click="openImagePreview(post, index)"
                @error="handleImageError" />
            </div>
          </div>

          <!-- 貼文操作 -->
          <div class="post-actions">
            <!-- 點讚按鈕 -->
            <button v-if="isLoggedIn" @click="likePost(post.postId)"
              :class="['action-btn', { 'isLiked': post.isLiked }]">
              <i :class="post.isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
              <span>{{ post.likesCount }}</span>
            </button>
            <div v-else class="action-btn disabled-action-btn">
              <i class="fa-regular fa-heart"></i>
              <span>{{ post.likesCount }}</span>
            </div>

            <!-- 評論按鈕 -->
            <button class="action-btn" @click.stop="showPostDetail(post.postId)">
              <i class="fa-regular fa-comment"></i>
              <span>{{ post.commentsCount }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #empty>
      <div class="no-more-posts">沒有更多貼文了</div>
    </template>
  </v-infinite-scroll>

  <div v-if="isAddPostVisible" class="modal-overlay" @click.self="toggleAddPost">
    <div class="modal-content">
      <h2 class="modal-title">{{ isEditMode ? '編輯貼文' : '新增貼文' }}</h2>
      <div class="modal-header">
        <div class="avatar-container">
          <img v-if="currentUser.avatar" :src="currentUser.avatar" :alt="currentUser.username" class="avatar"
            @error="handleAvatarError" />
          <i v-else class="fa-solid fa-user avatar-fallback"></i>
        </div>
        <span>{{ currentUser.username }}</span>
      </div>

      <textarea v-model="newPostContent" placeholder="分享你的想法..." class="add-post-input" rows="4"
        @input="adjustHeight"></textarea>

      <div v-if="imagePreviewUrls && imagePreviewUrls.length > 0" class="image-preview-container">
        <div v-for="(url, index) in imagePreviewUrls" :key="index" class="image-preview-wrapper">
          <img :src="url" class="image-preview" />
          <button @click="removeImage(index)" class="remove-image-btn">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
      </div>

      <div class="add-post-actions">
        <label for="image-upload" class="upload-label">
          <i class="fa-regular fa-images"></i>
        </label>
        <input id="image-upload" type="file" @change="handleImageUpload" accept="image/*" multiple class="file-input" />
        <button @click="submitPost" class="submit-post-btn">發佈</button>
        <button @click="toggleAddPost" class="cancel-post-btn">取消</button>
      </div>
    </div>
  </div>
  <!-- 貼文詳情對話框 -->
  <div v-if="isPostDetailVisible" class="modal-overlay" @click.self="closePostDetail">
    <div class="modal-content post-detail">
      <div class="post-detail-header">
        <div class="post-header">
          <div class="avatar-container">
            <img v-if="selectedPost.userAvatar" :src="selectedPost.userAvatar" :alt="selectedPost.username"
              class="avatar" @error="handleAvatarError" />
            <i v-else class="fa-solid fa-user avatar-fallback"></i>
          </div>
          <div class="user-details">
            <span class="user-name">{{ selectedPost.username }}</span>
            <small class="timestamp">{{ formatTimeAgo(selectedPost.createdAt) }}</small>
          </div>
        </div>
        <button @click="closePostDetail" class="close-btn">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="post-detail-content">
        <p>{{ selectedPost.content }}</p>
        <div v-if="selectedPost.imageUrls && selectedPost.imageUrls.length > 0" class="post-images">
          <img v-for="(imageUrl, index) in selectedPost.imageUrls" :key="index"
            :src="`http://localhost:8082${imageUrl}`" :alt="`Post image ${index + 1}`" class="post-image"
            @click="openImagePreview(selectedPost, index)" @error="handleImageError" />
        </div>
        <div class="post-actions">
          <button v-if="isLoggedIn" @click="likePost(selectedPost.postId)"
            :class="['action-btn', { 'isLiked': selectedPost.isLiked }]">
            <i :class="selectedPost.isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
            <span>{{ selectedPost.likesCount }}</span>
          </button>
          <div v-else class="action-btn disabled-action-btn">
            <i class="fa-regular fa-heart"></i>
            <span>{{ selectedPost.likesCount }}</span>
          </div>
        </div>
      </div>

      <div class="post-detail-comments" ref="commentsSection">
        <h3>回覆</h3>
        <div v-if="selectedPost.comments && selectedPost.comments.length > 0" class="comments-list">
          <div v-for="comment in selectedPost.comments" :key="comment.commentId" class="comment-item">
            <div class="comment-header">
              <div class="comment-user">
                <div class="avatar-container small">
                  <img v-if="comment.userAvatar" :src="comment.userAvatar" :alt="comment.username" class="avatar"
                    @error="handleAvatarError" />
                  <i v-else class="fa-solid fa-user avatar-fallback"></i>
                </div>
                <div class="comment-info">
                  <span class="comment-username">{{ comment.username }}</span>
                  <span class="comment-time">{{ formatTimeAgo(comment.createdAt) }}</span>
                  <p class="comment-content">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <button v-if="isLoggedIn" @click="likeComment(comment)"
                      :class="['like-btn', { 'liked': comment.liked }]">
                      <i :class="comment.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
                      <span>{{ comment.likesCount }}</span>
                    </button>
                    <button v-if="isLoggedIn" @click="showReplyInput(comment)" class="reply-btn">
                      <i class="fa-solid fa-reply"></i> 回覆
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 回覆輸入框 -->
            <div v-if="comment.showReplyInput" class="reply-input-section">
              <div class="reply-input-header">
                <div class="avatar-container small">
                  <img v-if="currentUser.avatar" :src="currentUser.avatar" :alt="currentUser.username" class="avatar"
                    @error="handleAvatarError" />
                  <i v-else class="fa-solid fa-user avatar-fallback"></i>
                </div>
                <textarea v-model="comment.replyContent" placeholder="回覆留言..." class="reply-input"
                  @input="adjustReplyHeight"></textarea>
              </div>
              <div class="reply-input-actions">
                <button class="cancel-reply-btn" @click="comment.showReplyInput = false">取消</button>
                <button class="submit-reply-btn" @click="submitReply(comment)"
                  :disabled="!comment.replyContent?.trim()">發送</button>
              </div>
            </div>

            <!-- 回覆列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-section">
              <div v-for="reply in comment.replies" :key="reply.commentId" class="reply-item">
                <div class="reply-user">
                  <div class="avatar-container small">
                    <img v-if="reply.userAvatar" :src="reply.userAvatar" :alt="reply.username" class="avatar"
                      @error="handleAvatarError" />
                    <i v-else class="fa-solid fa-user avatar-fallback"></i>
                  </div>
                  <div class="reply-info">
                    <span class="reply-username">{{ reply.username }}</span>
                    <span class="reply-time">{{ formatTimeAgo(reply.createdAt) }}</span>
                    <p class="reply-content">{{ reply.content }}</p>
                    <!-- 回覆的點讚按鈕 -->
                    <button v-if="isLoggedIn" @click="likeComment(reply)"
                      :class="['like-btn', { 'liked': reply.liked }]">
                      <i :class="reply.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
                      <span>{{ reply.likesCount }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-comments">暫無回覆</div>

        <!-- 主留言輸入區 -->
        <div v-if="isLoggedIn" class="comment-input-section">
          <textarea v-model="newComment" placeholder="寫下你的留言..." class="comment-input"
            @keyup.enter.exact="submitComment" @input="adjustCommentHeight"></textarea>
          <button @click="submitComment" class="submit-comment-btn" :disabled="!newComment.trim()">發布</button>
        </div>
      </div>
    </div>
  </div>
  <v-dialog v-model="showImageDialog" fullscreen transition="dialog-bottom-transition" :scrim="false">
    <div class="image-preview-dialog">
      <div class="preview-header">
        <v-btn icon="mdi-close" size="large" color="#ff961e" variant="text" @click="showImageDialog = false"></v-btn>
      </div>
      <v-carousel v-model="currentImageIndex" hide-delimiter-background height="100%" show-arrows="hover"
        hide-delimiters>
        <template v-slot:prev="{ props }">
          <v-btn v-bind="props" color="#ff961e" icon="mdi-chevron-left" variant="flat" class="custom-arrow-btn"></v-btn>
        </template>
        <template v-slot:next="{ props }">
          <v-btn v-bind="props" color="#ff961e" icon="mdi-chevron-right" variant="flat"
            class="custom-arrow-btn"></v-btn>
        </template>
        <v-carousel-item v-for="(imageUrl, index) in currentPostImages" :key="index">
          <div class="image-container">
            <v-img :src="imageUrl" max-height="90vh" :width="'auto'" contain class="preview-image"></v-img>
          </div>
        </v-carousel-item>
      </v-carousel>
    </div>
  </v-dialog>

  <v-dialog v-model="showReportDialog" max-width="500px">
    <v-card class="report-dialog">
      <v-card-title>
        <span class="text-h5">檢舉貼文</span>
      </v-card-title>
      <v-card-text>
        <v-radio-group v-model="reportReason">
          <v-radio v-for="(reason, index) in reportReasons" :key="index" :label="reason" :value="reason"></v-radio>
        </v-radio-group>
        <v-textarea v-if="reportReason === '其他'" v-model="otherReasonText" label="請說明原因" rows="3" required></v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="closeReportDialog">
          取消
        </v-btn>
        <v-btn color="orange-darken-1" variant="text" @click="submitReport" :disabled="!isValidReport">
          送出
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import { ref, onMounted, nextTick, computed } from "vue";
import axios from 'axios';
import apiClient from "@/api/apiClient";
import { useRouter } from 'vue-router';
import NotificationBell from "./NotificationBell.vue";
export default {
  components: {
    NotificationBell,
  },
  setup() {

    const router = useRouter();
    const isLoggedIn = ref(false);
    const currentUser = ref({
      username: '',
      avatar: null
    });
    const posts = ref([]); // 貼文數據
    const newPostContent = ref(""); // 新貼文內容
    const selectedFiles = ref(null);
    const imagePreviewUrls = ref([]);
    const isAddPostVisible = ref(false); // 控制新增貼文區塊顯示狀態
    const error = ref(null); // 用於顯示錯誤訊息
    const MAX_IMAGES = 4;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const selectedPost = ref(null);
    const isPostDetailVisible = ref(false);
    const newComment = ref('');
    const commentsSection = ref(null);
    const showImageDialog = ref(false);
    const currentImageIndex = ref(0);
    const currentPostImages = ref([]);
    const showReportDialog = ref(false);
    const selectedPostForReport = ref(null);
    const reportReason = ref('');
    const reportReasons = [
      '垃圾訊息',
      '色情內容',
      '暴力或危險內容',
      '騷擾或霸凌',
      '仇恨言論',
      '虛假資訊',
      '其他'
    ];
    const otherReasonText = ref('');
    const isEditMode = ref(false);
    const selectedPostForEdit = ref(null);

    const checkLoginStatus = async () => {
      try {
        const response = await apiClient.get('/check', { withCredentials: true });
        if (response.data && response.data.isLoggedIn) {
          isLoggedIn.value = true;
          currentUser.value = response.data.user;
        } else {
          isLoggedIn.value = false;
          currentUser.value = { username: '', avatar: null };
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        isLoggedIn.value = false;
      }
    };
    // 處理登入/登出操作
    const handleAuthAction = async () => {
      if (isLoggedIn.value) {
        try {
          await apiClient.post('/logout', {}, { withCredentials: true });
          isLoggedIn.value = false;
          currentUser.value = { username: '', avatar: null };
          router.push('/login');
        } catch (error) {
          console.error('Logout error:', error);
        }
      } else {
        router.push({
          path: '/login',
          query: { redirect: '/community' }  // 指定要返回的頁面
        });
      }
    };

    // 切換新增貼文浮出區塊
    const toggleAddPost = () => {
      if (!isLoggedIn.value) {
        handleAuthAction();
        return;
      }

      // 重置表單
      if (!isAddPostVisible.value) {
        isEditMode.value = false;
        selectedPostForEdit.value = null;
        newPostContent.value = '';
        selectedFiles.value = null;
        imagePreviewUrls.value = [];
      }

      // 切換顯示狀態
      isAddPostVisible.value = !isAddPostVisible.value;

      // 如果是開啟模態框，確保它顯示在最上層
      if (isAddPostVisible.value) {
        nextTick(() => {
          const textarea = document.querySelector('.add-post-input');
          if (textarea) {
            textarea.focus();
          }
        });
      }
    };

    const showPostDetail = async (postId) => {
      try {
        const response = await axios.get(
          `http://localhost:8082/api/posts/${postId}`,
          {
            params: {
              currentUserId: currentUser.value?.id  // 傳入當前用戶 ID
            }
          }
        );
        selectedPost.value = response.data;
        isPostDetailVisible.value = true;

        // 使用 nextTick 確保 DOM 已更新
        await nextTick();
        // 滾動到留言區
        if (commentsSection.value) {
          commentsSection.value.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error fetching post detail:', error);
      }
    };

    const closePostDetail = () => {
      isPostDetailVisible.value = false;
      selectedPost.value = null;
    };

    const handleAvatarError = (event) => {
      event.target.style.display = 'none';
      // 修改這一行
      const nextElement = event.target.nextElementSibling;
      if (nextElement) {
        nextElement.style.display = 'flex';
      }
    };
    const handleImageUpload = (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const existingFiles = selectedFiles.value ? Array.from(selectedFiles.value) : [];
      const newFiles = Array.from(files).filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`檔案 ${file.name} 超過 5MB 限制`);
          return false;
        }
        return true;
      });

      if (newFiles.length === 0) return;

      if (existingFiles.length + newFiles.length > MAX_IMAGES) {
        alert(`最多只能上傳 ${MAX_IMAGES} 張圖片`);
        return;
      }

      const dataTransfer = new DataTransfer();
      [...existingFiles, ...newFiles].forEach(file => {
        dataTransfer.items.add(file);
      });
      selectedFiles.value = dataTransfer.files;

      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            imagePreviewUrls.value.push(e.target.result);
          }
        };
        reader.readAsDataURL(file);
      });

      event.target.value = '';
    };

    const removeImage = (index) => {
      // 移除預覽圖片
      imagePreviewUrls.value.splice(index, 1);

      // 移除實際文件
      const newFiles = Array.from(selectedFiles.value).filter((_, i) => i !== index);

      // 創建新的 FileList
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => {
        dataTransfer.items.add(file);
      });
      selectedFiles.value = dataTransfer.files;

      // 如果已經沒有文件，重置 input
      if (newFiles.length === 0) {
        const input = document.getElementById('image-upload');
        if (input) input.value = '';
      }
    };

    const handleImageError = (event) => {
      event.target.src = 'https://dummyimage.com/300x400/000/fff'; // 設置預設圖片
    };

    const submitPost = async () => {
      try {
        if (!newPostContent.value.trim()) {
          alert("內容不能為空");
          return;
        }

        const formData = new FormData();
        formData.append("username", currentUser.value.username);
        formData.append("content", newPostContent.value.trim());
        formData.append("reviewStatus", "正常");

        if (selectedFiles.value && selectedFiles.value.length > 0) {
          for (let i = 0; i < selectedFiles.value.length; i++) {
            formData.append("images", selectedFiles.value[i]);
          }
        }

        let response;
        if (isEditMode.value && selectedPostForEdit.value) {
          // 編輯模式：需要記錄被刪除的圖片
          response = await axios.put(
            `http://localhost:8082/api/posts/${selectedPostForEdit.value.postId}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        } else {
          // 新增模式
          response = await axios.post(
            'http://localhost:8082/api/posts',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );
        }

        // 重置表單
        newPostContent.value = "";
        selectedFiles.value = null;
        imagePreviewUrls.value = [];

        // 重置分頁參數並重新獲取貼文
        paginationParams.page = -1;
        posts.value = [];  // 清空現有貼文
        await fetchPosts();  // 重新獲取第一頁

        toggleAddPost();
        alert(isEditMode.value ? '貼文已更新！' : '貼文已發布！');

      } catch (error) {
        console.error('Error saving post:', error);
        alert(error.response?.data || '操作失敗！請稍後再試。');
      }
    };

    const adjustHeight = (event) => {
      const target = event.target;
      target.style.height = "auto"; // 重置高度
      target.style.height = `${target.scrollHeight}px`; // 根据内容调整高度
    };



    const likePost = async (postId) => {
      if (!isLoggedIn.value) {
        handleAuthAction();
        return;
      }

      try {
        const post = posts.value.find(p => p.postId === postId);
        const isCurrentlyLiked = post?.isLiked;

        const response = await axios.post(
          `http://localhost:8082/api/posts/${postId}/like`,
          {},
          {
            params: {
              unlike: isCurrentlyLiked,
              userId: currentUser.value.id
            },
            withCredentials: true
          }
        );

        if (response.data) {
          // 更新列表中的貼文
          const postIndex = posts.value.findIndex(p => p.postId === postId);
          if (postIndex !== -1) {
            posts.value[postIndex].likesCount = response.data.likesCount;
            posts.value[postIndex].isLiked = response.data.isLiked;
          }

          // 更新詳情頁中的貼文
          if (selectedPost.value && selectedPost.value.postId === postId) {
            selectedPost.value.likesCount = response.data.likesCount;
            selectedPost.value.isLiked = response.data.isLiked;
          }
        }
      } catch (error) {
        console.error('Error liking post:', error);
        alert('按讚失敗，請稍後再試');
      }
    };

    // 評論貼文
    const commentPost = (postId) => {
      console.log(`Commented on post ${postId}`);
    };

    const adjustCommentHeight = (event) => {
      const target = event.target;
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    };
    const submitComment = async () => {
      if (!newComment.value.trim()) return;

      try {
        // 發送留言到後端
        const response = await axios.post(
          `http://localhost:8082/api/comments`,
          {
            postId: selectedPost.value.postId,
            userId: currentUser.value.id,
            content: newComment.value.trim()
          },
          { withCredentials: true }
        );

        if (response.data) {
          // 更新當前選中貼文的留言和留言數
          selectedPost.value.comments = selectedPost.value.comments || [];
          selectedPost.value.comments.push(response.data.comment);
          selectedPost.value.commentsCount = response.data.commentsCount;

          // 更新貼文列表中對應貼文的留言數
          const postIndex = posts.value.findIndex(p => p.postId === response.data.postId);
          if (postIndex !== -1) {
            posts.value[postIndex].commentsCount = response.data.commentsCount;
          }
        }

        // 清空輸入
        newComment.value = '';

      } catch (error) {
        console.error('Error submitting comment:', error);
        alert('留言失敗，請稍後再試');
      }
    };

    const fetchPosts = async (reset = true) => {
      try {
        if (reset) {
          paginationParams.page = 0;
          posts.value = [];
        } else {
          paginationParams.page += 1;
        }

        const response = await axios.get('http://localhost:8082/api/posts', {
          params: {
            ...paginationParams,
            currentUserId: currentUser.value?.id
          }
        });

        if (response.data.content) {
          const newPosts = response.data.content;
          if (reset) {
            posts.value = newPosts;
          } else {
            posts.value.push(...newPosts);
          }
          return newPosts;
        }
        return [];
      } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
      }
    };

    const loadMore = async ({ done }) => {
      const result = await fetchPosts(false);  // 傳入 false 表示這是加載更多，不是重置

      if (result.length === 0) {
        done('empty');
        return;
      }

      done('ok');
    };

    const openImagePreview = (post, index) => {
      currentPostImages.value = post.imageUrls.map(url => `http://localhost:8082${url}`);
      currentImageIndex.value = index;
      showImageDialog.value = true;
    };

    const formatTimeAgo = (dateString) => {
      if (!dateString) return '';  // 添加空值檢查

      const now = new Date();
      const targetDate = new Date(dateString);
      const diff = Math.floor((now - targetDate) / 1000); // 轉換為秒

      if (diff < 60) {
        return `${diff}秒前`;
      } else if (diff < 3600) {
        return `${Math.floor(diff / 60)}分鐘前`;
      } else if (diff < 86400) {
        return `${Math.floor(diff / 3600)}小時前`;
      } else if (diff < 7 * 86400) { // 七天內
        return `${Math.floor(diff / 86400)}天前`;
      } else {
        // 超過七天就顯示完整日期
        return targetDate.toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
    };

    const showReplyInput = (comment) => {
      comment.showReplyInput = !comment.showReplyInput;
      comment.replyContent = '';
    };

    const submitReply = async (comment) => {
      try {
        const response = await axios.post(
          `http://localhost:8082/api/comments/${comment.commentId}/reply`,
          {
            postId: selectedPost.value.postId,
            userId: currentUser.value.id,
            content: comment.replyContent.trim()
          },
          { withCredentials: true }
        );

        if (response.data) {
          // 更新評論列表
          comment.replies = comment.replies || [];
          comment.replies.push(response.data.comment);
          comment.showReplyInput = false;
          comment.replyContent = '';

          // 更新評論數
          selectedPost.value.commentsCount = response.data.commentsCount;
        }
      } catch (error) {
        console.error('回覆失敗:', error);
        alert('回覆失敗，請稍後再試');
      }
    };

    const likeComment = async (comment) => {
      if (!isLoggedIn.value) return;

      try {
        const response = await axios.post(
          `http://localhost:8082/api/comments/${comment.commentId}/like`,
          null,
          {
            params: {
              userId: currentUser.value.id
            }
          }
        );

        if (response.data) {
          comment.liked = response.data.isLiked;  // 前端使用 liked 屬性
          comment.likesCount = response.data.likesCount;
        }
      } catch (error) {
        console.error('點讚失敗:', error);
      }
    };

    const reportPost = async (post) => {
      if (!isLoggedIn.value) {
        router.push('/login');
        return;
      }
      selectedPostForReport.value = post;
      showReportDialog.value = true;
    };

    const isValidReport = computed(() => {
      if (reportReason.value === '其他') {
        return otherReasonText.value.trim().length > 0;
      }
      return reportReason.value !== '';
    });

    const closeReportDialog = () => {
      showReportDialog.value = false;
      reportReason.value = '';
      otherReasonText.value = '';
      selectedPostForReport.value = null;
    };

    const submitReport = async () => {
      const finalReason = reportReason.value === '其他'
        ? otherReasonText.value.trim()
        : reportReason.value;

      try {
        const response = await axios.post(
          `http://localhost:8082/api/posts/${selectedPostForReport.value.postId}/report`,
          null,
          {
            params: {
              reason: finalReason,
              reportedBy: currentUser.value.id
            }
          }
        );

        if (response.data) {
          const postIndex = posts.value.findIndex(
            p => p.postId === selectedPostForReport.value.postId
          );
          if (postIndex !== -1) {
            posts.value[postIndex].reported = true;
            // 更新前端貼文的審核狀態
            posts.value[postIndex].reviewStatus = '待審核';
          }

          closeReportDialog();
          alert('檢舉已送出，管理員將進行審核');
        }
      } catch (error) {
        console.error('Error reporting post:', error);
        alert('檢舉失敗，請稍後再試');
      }
    };

    const editPost = (post) => {
      isEditMode.value = true;
      selectedPostForEdit.value = post;
      newPostContent.value = post.content;

      // 設置圖片預覽
      if (post.imageUrls && post.imageUrls.length > 0) {
        imagePreviewUrls.value = post.imageUrls.map(url =>
          `http://localhost:8082${url}`
        );
      }

      isAddPostVisible.value = true;
    };

    const confirmDeletePost = (post) => {
      if (confirm('確定要刪除這篇貼文嗎？')) {
        deletePost(post.postId);
      }
    };

    const deletePost = async (postId) => {
      try {
        await axios.delete(`http://localhost:8082/api/posts/${postId}`);
        await fetchPosts(true);  // 傳入 true 表示要重置

      } catch (error) {
        console.error('Error deleting post:', error);
        alert('刪除失敗，請稍後再試');
      }
    };

    const paginationParams = {
      page: -1,
      size: 5,
      direction: "DESC",
      sort: "createdAt",
    };


    onMounted(async () => {
      await checkLoginStatus();
      await fetchPosts(true);
    });

    return {
      isLoggedIn,
      currentUser,
      posts,
      newPostContent,
      selectedFiles,
      isAddPostVisible,
      handleAuthAction,
      toggleAddPost,
      handleImageUpload,
      handleImageError,
      imagePreviewUrls,
      removeImage,
      submitPost,
      likePost,
      commentPost,
      adjustHeight,
      handleAvatarError,
      selectedPost,
      isPostDetailVisible,
      showPostDetail,
      closePostDetail,
      newComment,
      commentsSection,
      submitComment,
      adjustCommentHeight,
      showImageDialog,
      currentImageIndex,
      currentPostImages,
      openImagePreview,
      showReplyInput,
      submitReply,
      formatTimeAgo,
      showReplyInput,
      likeComment,
      submitReport,
      reportPost,
      showReportDialog,
      selectedPostForReport,
      reportReason,
      reportReasons,
      otherReasonText,
      isValidReport,
      closeReportDialog,
      editPost,
      confirmDeletePost,
      deletePost,
      isEditMode,
      selectedPostForEdit,
      paginationParams,
      loadMore,
    };
  },
};
</script>

<style scoped>
body {
  background-color: #000;
}

.post-feed {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
  padding-top: 50px;
  background-color: #1e1e1e;
  border-radius: 25px;
  color: #ffffff;
}

.scrollable-content {
  height: 100% !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 20px;
}

.no-more-posts {
  text-align: center;
  padding: 20px;
  color: #aaaaaa;
}

.trigger-add-post {
  display: flex;
  align-items: center;
  padding: 10px;
  background: #2e2e2e;
  border-radius: 8px;
  margin-bottom: 20px;
  cursor: pointer;
}

.trigger-add-post .avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #2e2e2e;
  font-size: 20px;
  color: #ffffff;
  /* border: 1px solid #ff961e; */
}

.trigger-add-post .avatar-container.small {
  width: 35px;
  height: 35px;
  min-width: 35px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #2e2e2e;
}

.trigger-add-post .avatar-container.small .avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.trigger-add-post .avatar-container.small .avatar-fallback {
  font-size: 18px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2e2e2e;
  border: 1.5px solid #ffffff;
}

.trigger-text {
  color: #aaaaaa;
  margin-left: 15px;
}

/* 浮出層 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #2e2e2e;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1001;
}

.modal-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 15px;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 5px;
}

.modal-header .avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #2e2e2e;
  font-size: 20px;
  color: #ff961e;
  border: 1.5px solid #ff961e
}

.modal-header span {
  font-size: 16px;
  color: white;
  line-height: 1;
}

.add-post-input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: none;
  background: #1e1e1e;
  color: #ffffff;
  resize: none;
  box-sizing: border-box;
  margin-bottom: 10px;
  overflow: hidden;
}

.add-post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.add-post-actions label {
  cursor: pointer;
}

.add-post-actions label:hover i {
  color: #ff961e;
}

.image-preview-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin: 10px 0;
}

.image-preview-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  /* 保持正方形比例 */
  overflow: hidden;
}

.image-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.remove-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
}

.remove-image-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.upload-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
}

.upload-label i {
  font-size: 1.5em;
  color: #ffffff;
}

.upload-label:hover i {
  color: #ff961e;
}

.file-input {
  display: none;
}

.submit-post-btn {
  padding: 10px 15px;
  background-color: #3b3c3ba5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-post-btn:hover {
  background-color: #1e1d1d;
}

.cancel-post-btn {
  padding: 10px 10px;
  background-color: #2e2e2e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-post-btn:hover {
  background-color: #2e2e2e;
}


.post-card {
  background: #2e2e2e;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  position: relative;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.post-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.post-image:hover {
  opacity: 0.9;
}

.avatar-container {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #2e2e2e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-container .avatar {
  font-size: 40px;
  color: #ffffff;
  text-align: center;
  line-height: 50px;
}


.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  font-size: 24px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #2e2e2e;
  border: 1.5px solid #ffffff;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 10px;
}

.user-name {
  font-weight: 500;
  font-size: 16px;
}

.timestamp {
  font-size: 12px;
  color: #aaaaaa;
  margin-left: 0px;
}

.post-actions .disabled-action-btn {
  cursor: default !important;
  /* 使用 !important 確保覆蓋 */
  opacity: 0.7;
  pointer-events: none;
  /* 完全禁用點擊事件 */
}

.post-actions .action-btn {
  margin-top: 12px;
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  background: none;
  color: white;
  font-size: 19px;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
}

.post-actions {
  display: flex;
  gap: 10px;
  /* 按鈕之間的間距 */
  margin-top: 10px;
}

.post-actions .action-btn:hover {
  color: #ff961e;
}

.post-actions .action-btn.isLiked {
  color: #ff961e;

}

.layout {
  display: flex;
  height: calc(100vh - 60px);
  padding-left: 80px;
  /* 加入左側 padding 來留出側邊欄的空間 */
  position: relative;

}

.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 70px;
  height: calc(100vh - 60px);
  color: #fff;
  padding: 20px;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 10;
  background-color: #1e1e1e;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  margin-left: 5px;
}

.sidebar li {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  font-size: 30px;
  cursor: pointer;
}

.sidebar li i {
  color: #838282;
  font-size: 28px;
  transition: color 0.3s;
  align-items: center;
  display: flex;
}

.sidebar li:hover i {
  color: #ff961e;
  background-size: cover;
}

.bottom-actions {
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: center;
  margin-bottom: 10px;
}

.profile {
  font-size: 28px;
  color: #838282;
  transition: color 0.3s;
  cursor: pointer;
}

.profile:hover {
  color: #ff961e;
}


.sidebar .auth-action {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-direction: column;
  gap: 30px;
}


.sidebar .auth-action i {
  font-size: 28px;
  margin-bottom: 10px;
  color: #838282
}

.bottom-actions :deep(.v-btn),
.sidebar .auth-action i {
  font-size: 28px;
  color: #838282;
}

/* 統一 hover 效果 */
.bottom-actions :deep(.v-btn:hover),
.sidebar .auth-action i:hover {
  color: #ff961e;
}

.post-detail {
  width: 95%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.post-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

.post-detail-content {
  padding: 20px 0;
}


.post-detail-comments {
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.comments-list {
  margin-top: 15px;
}

.comment-item {
  padding: 15px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-user {
  display: flex;
  gap: 12px;
}

.comment-info {
  flex: 1;
}

.comment-username {
  font-weight: 500;
  color: #ff961e;
  display: block;
  margin-bottom: 2px;
}

.comment-actions {
  margin-top: 10px;
  display: flex;
  gap: 16px;
}

.comment-time {
  font-size: 12px;
  color: #aaaaaa;
  display: block;
  margin-bottom: 8px;
}

.comment-content {
  margin: 0;
  color: #ffffff;
  line-height: 1.4;
}

.comment-actions {
  margin-top: 8px;
  display: flex;
  gap: 16px;
}

.like-btn,
.reply-btn {
  background: none;
  border: none;
  color: #aaaaaa;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
}

.like-btn.liked {
  color: #ff961e;

}

.like-btn:hover,
.reply-btn:hover {
  color: #ff961e;
}

.no-comments {
  text-align: center;
  color: #aaaaaa;
  padding: 20px;
}

.comment-input-section {
  margin-top: 20px;
  /* padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px; */
}

.comment-input {
  width: 100%;
  min-height: 60px;
  padding: 12px;
  background: #1e1e1e;
  border: none;
  border-radius: 8px;
  color: white;
  resize: none;
  margin-bottom: 10px;
  font-size: 14px;
}

.comment-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 150, 30, 0.3);
}

.submit-comment-btn {
  padding: 8px 16px;
  background-color: #ff961e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.submit-comment-btn:hover {
  background-color: #e88616;
}

.submit-comment-btn:disabled {
  background-color: #666;
  cursor: not-allowed;
}

/* 修改貼文詳情的最大高度和滾動 */
.post-detail {
  max-height: 80vh;
  overflow-y: auto;
}

/* 添加滾動條樣式 */
.post-detail::-webkit-scrollbar {
  width: 8px;
}

.post-detail::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.post-detail::-webkit-scrollbar-thumb {
  background: #ff961e;
  border-radius: 4px;
}

.post-detail::-webkit-scrollbar-thumb:hover {
  background: #e88616;
}

:deep(.scrollable-content::-webkit-scrollbar) {
  width: 8px;
  position: fixed;
  right: 0;
}

:deep(.scrollable-content::-webkit-scrollbar-track) {
  background: #1e1e1e;
}

:deep(.scrollable-content::-webkit-scrollbar-thumb) {
  background: #ff961e;
  border-radius: 4px;
}

:deep(.scrollable-content::-webkit-scrollbar-thumb:hover) {
  background: #e88616;
}

.image-preview-dialog {
  background-color: rgba(0, 0, 0, 0.7);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  background: transparent;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.preview-image {
  margin: auto;
  max-width: 90vw !important;
}

:deep(.v-carousel__controls) {
  background: transparent !important;
}

:deep(.v-carousel-item) {
  background-color: transparent !important;
}



/* 如果需要也可以修改圖片導航點的顏色 */
:deep(.v-carousel__controls__item) {
  color: rgba(255, 150, 30, 0.7) !important;
}

:deep(.v-carousel__controls__item.v-btn--active) {
  color: #ff961e !important;
}

.custom-arrow-btn {
  background: rgba(255, 116, 2, 0.9) !important;
}

.custom-arrow-btn:hover {
  background: rgba(237, 140, 5, 0.5) !important;
  transform: scale(1.1);
}

.reply-btn {
  color: #aaaaaa;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
}

.reply-btn:hover {
  color: #ff961e;
}


.reply-input-section {
  margin: 12px 0 12px 52px;
}


.reply-input {
  flex: 1;
  background: #1e1e1e;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: #ffffff;
  resize: none;
  min-height: 60px;
}

.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.reply-input-header {
  display: flex;
  gap: 12px;
}

.cancel-reply-btn,
.submit-reply-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-reply-btn {
  background: none;
  border: 1px solid #aaaaaa;
  color: #aaaaaa;
}

.submit-reply-btn {
  background: #ff961e;
  border: none;
  color: #ffffff;
}

.submit-reply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.replies-section {
  margin-left: 52px;
  margin-top: 12px;
}

.reply-item {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  margin-bottom: 8px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.reply-username {
  color: #ff961e;
  font-size: 14px;
  font-weight: 500;
  display: block;
  margin-bottom: 2px;
}

.reply-info {
  flex: 1;
}

.reply-user {
  display: flex;
  gap: 12px;
}

.reply-time {
  font-size: 12px;
  color: #aaaaaa;
  display: block;
  margin-bottom: 8px;
}

.reply-content {
  margin: 0;
  color: #ffffff;
  line-height: 1.4;
}

.more-options-btn {
  background: none;
  border: none;
  color: #7b7979;
  cursor: pointer;
  padding: 8px;
  margin: -8px;
  opacity: 0.7;
  transition: opacity 0.2s;
  font-size: 1.2em;
}

.more-options-btn:hover {
  opacity: 1;
  color: #b5b2b2;
}

.report-option {
  color: #fbf9f9;
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-dialog {
  background-color: #2e2e2e;
  color: #ffffff;
}

/* 確保選單顯示在正確的位置 */
.v-menu {
  display: inline-block;

}

.report-dialog :deep(.v-radio-group) {
  gap: 8px;
  display: flex;
  flex-direction: column;
}

.report-dialog :deep(.v-radio) {
  margin-bottom: 8px;
}

.report-dialog :deep(.v-input) {
  margin-top: 16px;
}

/* 選單樣式 */
:deep(.v-list) {
  background-color: #2e2e2e !important;
  color: white !important;
  padding: 8px 0;
}

:deep(.v-list-item) {
  min-height: 40px !important;
}

:deep(.v-list-item:hover) {
  background-color: #3e3e3e !important;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white !important;
  font-size: 14px;
}

.delete-option {
  color: #ff4444 !important;
}

.menu-option i {
  font-size: 16px;
}

.sidebar :deep(.notification-container) {
  display: flex;
  align-items: center;
}

.sidebar :deep(.v-btn) {
  color: #838282;
  transition: color 0.3s;
}

.sidebar :deep(.v-btn:hover) {
  color: #ff961e;
}

.sidebar :deep(.notification-badge) {
  margin-right: 0;
  /* 覆蓋原本的 margin */
}

.sidebar :deep(.v-badge__badge) {
  font-size: 12px;
  height: 20px;
  min-width: 20px;
  padding: 0 4px;
}
</style>