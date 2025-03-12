<script setup>
import { ref, onMounted } from "vue";
import { getUserProfile } from '@/api/auth'

const open = ref(["Features"]);
const username = ref('');

const getUserData = async () => {
	try {
		const response = await getUserProfile();
		username.value = response.data.username;
	} catch (err) {
		console.error('獲取用戶資料失敗:', err);
	}
};

onMounted(() => {
	getUserData();
});

const menuItems = [
	{
		title: "後台總覽",
		icon: "mdi-chart-box",
		isRouter: true,
		link: "/admin",
	},
	{
		title: "訓練教學",
		icon: "mdi-dumbbell",
		children: [
			{
				title: "動作管理",
				isRouter: true,
				link: "/admin/workouts",
			},
			{
				title: "方案管理",
				isRouter: true,
				link: "/admin/training-plan",
			},
			{
				title: "方案細則",
				isRouter: true,
				link: "/admin/plan-detail",
			},
			{
				title: "訓練紀錄",
				isRouter: true,
				link: "/admin/training-record",
			},
		],
	},
	{
		title: "教練及預約",
		icon: "mdi-account-tie",
		children: [
			{
				title: "教練管理",
				isRouter: true,
				link: "/admin/coaches",
			},
			{
				title: "課程管理",
				isRouter: true,
				link: "/admin/courses",
			},
			{
				title: "課程安排",
				isRouter: true,
				link: "/admin/schedule",
			},
			{
				title: "課程日曆",
				isRouter: true,
				link: "/admin/calendar",
			},
			{
				title: "等級設定",
				isRouter: true,
				link: "/admin/membershipLevel",
			},
			{
				title: "會員等級",
				isRouter: true,
				link: "/admin/userLevel",
			},
			{
				title: "預約",
				isRouter: true,
				link: "/admin/booking",
			},


		],
	},
	{
		title: "線上商店",
		icon: "mdi-shopping",
		children: [
			{
				title: "商品管理",
				isRouter: true,
				link: "/admin/products",
			},
			{
				title: "訂單管理",
				isRouter: true,
				link: "/admin/order",
			},
		],
	},
	{
		title: "社群管理",
		icon: "mdi-account-group",
		isRouter: true,
		link: "/admin/community",
	},
	{
		title: "健康管理系統",
		icon: "mdi-heart-pulse",
		isRouter: true,
		link: "/admin/health",
	},
	{
		title: "會員中心",
		icon: "mdi-account",
		isRouter: true,
		link: "/admin/user",
	},
	{
		title: "回到首頁",
		icon: "mdi-home",
		link: "/",
	},
];
</script>

<template>
	<v-app>
		<v-layout class="rounded-layout">
			<v-navigation-drawer permanent class="sidebar" width="300">
				<v-list>
					<v-list-item prepend-icon="mdi-view-dashboard" title="功能選單" class="sidebar-title"></v-list-item>

					<template v-for="item in menuItems" :key="item.title">
						<v-list-group v-if="item.children" :value="item.title">
							<template v-slot:activator="{ props }">
								<v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title"
									class="sidebar-item"></v-list-item>
							</template>

							<v-list-item v-for="child in item.children" :key="child.title" :title="child.title"
								:to="child.isRouter ? child.link : undefined"
								:href="!child.isRouter ? child.link : undefined" class="sidebar-sub-item"></v-list-item>
						</v-list-group>

						<v-list-item v-else :prepend-icon="item.icon" :title="item.title"
							:to="item.isRouter ? item.link : undefined" :href="!item.isRouter ? item.link : undefined"
							class="sidebar-item"></v-list-item>
					</template>
				</v-list>
			</v-navigation-drawer>

			<v-main class="amain-content">
				<div class="content">
					<div class="content-header" id="contentHeader">歡迎回來, {{ username }}</div>
					<div class="dynamic-content" id="link-container">
						<router-view></router-view>
					</div>
				</div>
			</v-main>
		</v-layout>
	</v-app>
</template>

<style lang="css" scoped>
.v-application {
	height: 100vh;
	background: transparent !important;
}

.rounded-layout {
	height: 95%;
	width: 95%;
	margin: 20px auto;
	background-color: #1e1e1e !important;
	box-shadow: 1px 0.5px 10px 10px rgba(0, 0, 0, 0.1);
	border-radius: 15px;
	overflow: hidden;
	position: relative;
}

.sidebar {
	background-color: #333 !important;
	color: #a79990 !important;
	border-right: 1px solid rgba(255, 255, 255, 0.1);
	position: absolute;
	height: 100%;
	top: 0;
	left: 0;
}

.amain-content {
	margin-left: 5px;
	background-color: #525050;
	height: 100%;
	flex: 1;
}

.sidebar-title {
	color: #f36c0b !important;
	font-size: 1.5em;
	font-weight: bold;
	margin-bottom: 20px;
}

.sidebar-item {
	margin: 8px 0;
	color: white !important;
	transition: color 0.3s;
}

.sidebar-item:hover {
	color: #f36c0b !important;
}

.sidebar-sub-item {
	padding-left: 32px !important;
	color: #a79990 !important;
	transition: color 0.3s;
}

.sidebar-sub-item:hover {
	color: #f36c0b !important;
}

.content {
	height: 100%;
	display: flex;
	flex-direction: column;
	font-size: 15px;
	overflow-y: auto;
}

.content-header {
	border-bottom: 2px solid #353434;
	width: 100%;
	padding: 10px;
	flex-shrink: 0;
	color: #fff;
	font-size: 1.5em;
}

.dynamic-content {
	margin: 10px;
	flex-grow: 1;
}

:deep(.v-list-group__items) {
	background-color: rgba(0, 0, 0, 0.1) !important;
}
</style>