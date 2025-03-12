<template>
    <v-card class="plan-card" elevation="5">
        <div class="d-flex flex-column h-100">
            <!-- 圖標和標題 -->
            <div class="icon-section">
                <v-icon :icon="icon" class="plan-icon" size="50"></v-icon>
                <h3 class="text-h5 font-weight-bold mt-2 title-text">{{ title }}</h3>
            </div>

            <!-- 價格 -->
            <div class="price-section">
                <span class="text-h5 font-weight-bold price-text">{{ price }}</span>
            </div>

            <!-- 描述 -->
            <v-card-text class="description-section">
                <p class="text-body-1 description-text">{{ description }}</p>
            </v-card-text>

            <!-- 詳細資訊 -->
            <v-card-text class="details-section">
                <div class="details-list">
                    <div v-for="(detail, index) in displayDetails" :key="index" class="detail-item">

                        <v-icon v-if="detail !== '\u00A0'" color="orange" size="small" class="mr-2">
                            mdi-check-circle
                        </v-icon>

                        <div v-else class="icon-placeholder"></div>
                        <span>{{ detail }}</span>
                    </div>
                </div>
            </v-card-text>

            <!-- 按鈕區域 -->
            <v-card-actions class="button-section mt-auto justify-center">
                <v-btn color="orange" variant="elevated" class="learn-more-btn text-capitalize" width="200"
                    @click="$emit('learn-more')">
                    Learn More
                    <v-icon end icon="mdi-arrow-right" class="ml-2"></v-icon>
                </v-btn>
            </v-card-actions>
        </div>
    </v-card>
</template>

<script>
export default {
    name: "PlanCard",
    props: {
        icon: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        details: {
            type: Array,
            required: true,
        },
    },
    computed: {
        displayDetails() {
            // 固定顯示5個項目，如果不足則填充空字串
            const filledDetails = [...this.details];
            while (filledDetails.length < 4) {
                filledDetails.push('\u00A0'); // 使用空白字符填充
            }
            return filledDetails;
        }
    }
};
</script>

<style scoped>
.plan-card {
    height: 500px;
    width: 300px;
    background-color: #2c2c2c !important;
    transition: transform 0.3s ease;
    border-radius: 10px;
}


.plan-card:hover {
    transform: translateY(-8px);
}

.icon-section {
    text-align: center;
    padding: 1.5rem 1rem 0.5rem;
}

.plan-icon {
    color: #ef8030 !important;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.price-section {
    text-align: center;
    padding: 0.5rem;
}

.description-section {
    text-align: center;
    padding: 0.5rem 1rem;

}

.description-text {
    color: #646160 !important;
}

.details-section {
    padding: 0 2rem;

}

.details-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    color: #e0e0e0;
    font-size: 0.9rem;
    line-height: 1.4;
    padding-left: 20px;

}

.button-section {
    display: flex;
    justify-content: center;
    padding: 1.25rem;
    margin-top: auto;
}

.learn-more-btn {
    text-transform: none !important;
    font-size: 1rem !important;
    letter-spacing: 0.5px;
    font-weight: 500;
    width: 200px !important;
}


:deep(.v-card-text) {
    color: #e0e0e0 !important;
}

:deep(.text-h5) {
    color: #ffffff;
}

/* 確保內容不會溢出 */
.h-100 {
    height: 100%;
}

.title-text {
    color: #ef8030 !important;
    font-family: "Goldman", serif;
    font-weight: 700;
    font-style: normal;

}

.price-text {
    color: #ef8030 !important;
}

.icon-placeholder {
    width: 24px;
    margin-right: 8px;
    min-width: 24px;
}

:deep(.v-icon) {
    min-width: 24px;
}
</style>