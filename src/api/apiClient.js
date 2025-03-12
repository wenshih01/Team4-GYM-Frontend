import axios from "axios";

// 創建 Axios 實例
const apiClient = axios.create({
    baseURL: "http://localhost:8082/api", // 替換為你的後端 API 基地址
    timeout: 10000, // 超時設置（毫秒）
    headers: {
        "Content-Type": "application/json", // 默認請求頭
    },
    withCredentials: true, // ✅ 讓瀏覽器自動帶上 JSESSIONID
});

// ✅ 刪除 request 攔截器中的 Authorization 設定，因為 Session 已經由後端處理

// ✅ 添加響應攔截器，修正 401 的處理方式
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            console.error("Response error:", error.response);

            if (error.response.status === 401) {
                console.warn("⚠️ Session 無效或未登入");

                // ✅ 只在「非登入頁面」才跳轉，避免無限循環
                if (window.location.pathname !== "/login") {
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
