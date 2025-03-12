<script setup>
import { ref } from "vue";

const open = ref(["Features"]);

const menuItems = [
	{
		title: "會員資料",
		icon: "mdi-chart-box",
		isRouter: true,
		link: "/profile/member2",
	},
	{
		title: "訂單管理",
		icon: "mdi-receipt-text", // 發票/訂單圖示
		isRouter: true,
		link: "/admin/orders",
	},
	{
		title: "留言管理",
		icon: "mdi-message-text", // 訊息/留言圖示
		isRouter: true,
		link: "/admin/messages",
	},
	{
		title: "健身菜單",
		icon: "mdi-food-variant", // 食物/菜單圖示
		isRouter: true,
		link: "/admin/menu",
	},
	{
		title: "運動日誌",
		icon: "mdi-calendar-text", // 日誌/日曆圖示
		isRouter: true,
		link: "/admin/logs",
	},
	{
		title: "課程管理",
		icon: "mdi-dumbbell", // 重訓/健身圖示
		isRouter: true,
		link: "/profile/booking1",
	},
	{
		title: "健身方案",
		icon: "mdi-package-variant", // 方案/訂閱圖示
		isRouter: true,
		link: "/admin/plans",
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
		<v-container class="rounded-layout">
			<!-- <v-navigation-drawer permanent class="sidebar" width="300">
				<v-list>
					<v-list-item prepend-icon="mdi-view-dashboard" title="功能選單" class="sidebar-title"></v-list-item>

					<template v-for="item in menuItems" :key="item.title">
						<v-list-group v-if="item.children" :value="item.title">
							<template v-slot:activator="{ props }">
								<v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title"
									class="sidebar-item"></v-list-item>
							</template>

<v-list-item v-for="child in item.children" :key="child.title" :title="child.title"
	:to="child.isRouter ? child.link : undefined" :href="!child.isRouter ? child.link : undefined"
	class="sidebar-sub-item"></v-list-item>
</v-list-group>

<v-list-item v-else :prepend-icon="item.icon" :title="item.title" :to="item.isRouter ? item.link : undefined"
	:href="!item.isRouter ? item.link : undefined" class="sidebar-item"></v-list-item>
</template>
</v-list>
</v-navigation-drawer> -->

			<v-list class="sidebar">
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

			<v-main app class="main-content">
				<div class="content">
					<div class="content-header" id="contentHeader">歡迎回來,</div>
					<div class="dynamic-content" id="link-container">
						<router-view></router-view>
					</div>
				</div>
			</v-main>
		</v-container>
	</v-app>
</template>


<style lang="css" scoped>
.v-application {
	/* height: 100vh; */
	background: transparent !important;
}

.rounded-layout {
	height: 100%;
	width: 100%;
	/*上方歡迎回來*/
	margin: 50px auto 20px;	
	padding: 0px;
	background-color: #1e1e1e !important;
	box-shadow: 1px 0.5px 10px 10px rgba(0, 0, 0, 0.1);
	border-radius: 15px;
	/* overflow: hidden; */
	overflow: hidden auto;
	position: relative;

	display: flex;

}

.sidebar {
	background-color: #333 !important;
	color: #a79990 !important;
	/* border-right: 1px solid rgba(255, 255, 255, 0.1);
	position: absolute;
	height: 100%;
	top: 0;
	left: 0;
	margin-top: 50px; */
}

.main-content {
	/* margin-left: 300px; */
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
	/* overflow-y: auto; */
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