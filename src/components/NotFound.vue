<template>
    <div class="not-found">
        <v-container class="d-flex flex-column align-center">
            <h1>404</h1>
            <p>找不到頁面，請檢查網址是否正確。</p>
            <v-btn color="orange" to="/" variant="elevated" size="large" prepend-icon="mdi-home">
                回首頁
            </v-btn>
        </v-container>
    </div>
</template>

<script>
export default {
    name: "NotFound"
};
</script>

<style scoped>
.not-found {
    text-align: center;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #2c2c2c;
}

.not-found h1 {
    font-size: 8rem;
    font-weight: bold;
    color: #ef8030;
    margin-bottom: 2rem;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
    font-family: 'Montserrat', sans-serif;
}

.not-found p {
    font-size: 1.5rem;
    margin: 20px 0 40px 0;
    color: #ffffff;
    font-family: 'LXGW WenKai TC', sans-serif;
}

/* 按鈕懸停效果 */
:deep(.v-btn:hover) {
    transform: translateY(-2px);
    transition: transform 0.3s ease;
}

/* 確保背景色覆蓋整個頁面 */
:deep(.v-container) {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>