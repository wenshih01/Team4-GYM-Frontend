import apiClient from "./apiClient";

// 用戶登入
export const login = async (username, password) => {
    return apiClient.post("/auth/login", { username, password });
};

// 獲取用戶資料
export const getUserProfile = async () => {
    return apiClient.get("/profile", { withCredentials: true }); // 確保請求攜帶 Session
};
