<template>
    <apexchart type="bar" height="350" :options="chartOptions" :series="series"></apexchart>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
    components: {
        apexchart: VueApexCharts
    },
    data() {
        return {
            series: [{ name: "出勤次數", data: [10, 30, 25, 15, 35, 40, 10, 30, 25, 15, 35] }],
            chartOptions: {
                chart: {
                    type: "bar",
                    background: "transparent", // 讓背景透明，避免黑底影響
                    toolbar: { show: false }
                },
                xaxis: {
                    categories: ["01 Aug", "02 Aug", "03 Aug", "04 Aug", "05 Aug", "06 Aug", "07 Aug", "08 Aug", "09 Aug", "10 Aug", "11 Aug"],
                    labels: { style: { colors: "#FFFFFF", fontSize: "12px" } }, // X 軸文字變白
                    axisBorder: { color: "#666666" },
                    axisTicks: { color: "#666666" }
                },
                yaxis: {
                    labels: { style: { colors: "#FFFFFF", fontSize: "12px" } }, // Y 軸文字變白
                    axisBorder: { color: "#666666" },
                    axisTicks: { color: "#666666" }
                },
                grid: {
                    borderColor: "#444444", // 網格顏色變灰色，提升對比度
                    strokeDashArray: 5
                },
                plotOptions: {
                    bar: {
                        borderRadius: 5, // 加圓角，讓條狀圖更有美感
                        horizontal: false,
                        columnWidth: "60%" // 增加間距，避免條狀圖擠在一起
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: { colors: ["#FFFFFF"] } // 條狀圖內數字變白
                },
                colors: ["#ef8030"], // 設定條狀圖顏色
                fill: {
                    type: "gradient",
                    gradient: {
                        shade: "dark",
                        type: "vertical",
                        gradientToColors: ["#10b981"], // 漸變色
                        stops: [0, 100]
                    }
                },
                tooltip: {
                    theme: "dark", // 讓 tooltip 適應深色主題
                    style: {
                        fontSize: "14px",
                        fontFamily: "Arial, sans-serif"
                    },
                    marker: {
                        fillColors: ["#ef8030"] // 設定 tooltip 點的顏色
                    },
                    y: {
                        formatter: function (value) {
                            return "出勤數: " + value; // 自訂 tooltip 文字格式
                        }
                    },
                    background: "#1e1e1e", // 深色背景
                    borderColor: "#34d399", // 綠色邊框，與條狀圖顏色統一
                    borderWidth: 1,
                    shadow: {
                        enabled: true,
                        color: "#000",
                        opacity: 0.6,
                        blur: 5
                    }
                }
            }
        };
    }
};
</script>

<style scoped>
.chart-container {
    background-color: #1e1e1e;
    /* 圖表區域背景變成更淺的黑灰色 */
    border-radius: 10px;
    padding: 20px;
}
</style>