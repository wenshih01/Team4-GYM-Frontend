// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import PostFeed from '../components/PostFeed.vue';
import GymIndex from '../components/GymIndex.vue';
import AdminLayout from '../components/Admin/AdminLayout.vue';
import PostManager from '../components/Admin/PostManager.vue';
import WorkoutsAction from '../components/Admin/WorkoutsAction.vue';
import AdminDashboard from '../components/Admin/AdminDashboard.vue';
import PlanDetail from '../components/Admin/PlanDetail.vue';
import TrainingPlan from '../components/Admin/TrainingPlan.vue';
import Products from '../components/Admin/Products.vue';
import User from '../components/Admin/User.vue';
import Order from '../components/Admin/Order.vue';
import Shop from '../components/Shop.vue';
import TrainingRecord from '../components/Admin/TrainingRecord.vue';
import ProductDetails from '../components/ProductDetails.vue';
import OrderItem from '../components/Admin/OrderItem.vue';
import Cart from '../components/Cart.vue';
import ProfileDashboard from '../components/Profile/profileDashboard.vue';
import Member from '../components/Profile/Member.vue';
import Profile from '../components/Profile/profile.vue';
import Workouts from '../components/Workouts.vue';
import Coach from '../components/Admin/Coach.vue';
import Calendar from '../components/Admin/Calendar.vue';
import Course from '../components/Admin/Course.vue';
import Schedule from '../components/Admin/Schedule.vue';
import Member2 from '../components/Profile/Member2.vue';
import Forgotpassword from '../components/forgotpassword.vue';
import ResetPassword from '../components/ResetPassword.vue';
import OrderList from '../components/OrderList.vue';
import MembershipLevel from '../components/Admin/membershipLevel.vue';
import UserLevel from '../components/Admin/UserLevel.vue';


import Booking1 from '../components/Profile/Booking1.vue';
import Booking2 from '../components/Profile/Booking2.vue';
import Booking from '../components/Admin/Booking.vue';
import BookingEnded from '../components/Admin/BookingEnded.vue';
import ScheduleEnded from '../components/Admin/ScheduleEnded.vue';
import CoachDetails from '../components/CoachDetails.vue';
import CoachProfile from '../components/CoachProfile.vue';





const routes = [
    { path: '/', name: "Home", component: GymIndex },
    { path: '/community', name: "Community", component: PostFeed },
    { path: '/login', name: "Login", component: LoginForm },
    { path: '/shop', name: "Shop", component: Shop },
    { path: "/product/:id", name: "ProductDetails", component: ProductDetails },
    { path: '/cart', name: "Cart", component: Cart },
    { path: "/workouts", name: "Workouts", component: Workouts },
    { path: '/forgotpassword', name: 'forgotPassword', component: Forgotpassword },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword },
    { path: '/orderlist', name: 'orderlist', component: OrderList },
    { path: '/coach', name: 'coach', component: CoachDetails },
    {
        path: '/coach-profile/:empno',
        name: 'CoachProfile',
        component: CoachProfile
      },
      
    

    
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            {
                path: '',
                name: 'AdminDashboard',
                component: AdminDashboard
            },
            {
                path: 'community',
                name: 'AdminCommunity',
                component: PostManager
            },
            {
                path: 'workouts',
                name: 'workouts',
                component: WorkoutsAction
            },
            {
                path: 'plan-detail',
                name: 'PlanDetail',
                component: PlanDetail
            },
            {
                path: 'training-plan',
                name: 'TrainingPlan',
                component: TrainingPlan
            },
            {
                path: "training-record",
                name: "TrainingRecord",
                component: TrainingRecord,
            },
            {
                path: 'products',
                name: 'Products',
                component: Products
            },
            {
                path: 'user',
                name: 'User',
                component: User
            },

            {
                path: 'order',
                name: 'Order',
                component: Order
            },
            {
                path: "/order/:orderId",
                name: "OrderItem",
                component: OrderItem
            },
            {
                path: "coaches",
                name: "Coaches",
                component: Coach
            },
            {
                path: "calendar",
                name: "Calendar",
                component: Calendar
            },
            {
                path: "courses",
                name: "Courses",
                component: Course
            },
            {
                path: "schedule",
                name: "Schedule",
                component: Schedule
            },
            {
                path: "scheduleEnded",
                name: "ScheduleEnded",
                component: ScheduleEnded
            },

            {
                path: "membershipLevel",
                name: "membershipLevel",
                component: MembershipLevel
            },
            {
                path: "userLevel",
                name: "userLevel",
                component: UserLevel
            },
            {
                path: "booking",
                name: "booking",
                component: Booking

            },
            {
                path: "bookingEnded",
                name: "bookingEnded",
                component: BookingEnded

            },
        ]


    },
    {
        path: '/profile',
        component: Profile,
        children: [
            {
                path: 'member',
                name: 'Member',
                component: Member
            },
            {
                path: '',
                name: 'profileDashboard',
                component: ProfileDashboard
            },
            {
                path: 'member2',
                name: 'Member2',
                component: Member2
            },
            {
                path: 'booking1',
                name: 'booking1',
                component: Booking1
            },
            {
                path: 'booking2',
                name: 'booking2',
                component: Booking2 
            }

        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../components/NotFound.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    try {
        const response = await apiClient.get("/check", { withCredentials: true });
        const isAuthenticated = response.data?.isLoggedIn;

        if (isAuthenticated) {
            if (to.path === '/login') {
                next('/');
            } else {
                next();
            }
        } else {
            next();
        }
    } catch (error) {
        next();
    }
});

export default router;