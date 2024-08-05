import Vue from "vue";
import VueRouter from "vue-router";
import DashboardLayout from "../views/layouts/DashboardLayout.vue";
import Home from "../views/Home.vue";
import Login from "@/views/LoginView.vue";
import Welcome from "@/views/misc/Welcome.vue";
import Subscription from "@/views/Subscriptions.vue";
import ManualLogger from "@/views/ManualLogger.vue";
import Assets from "@/views/Assets.vue";
import ThankYou from "@/views/ThankYou.vue";
import Users from "@/views/Users.vue";
import ADHConfig from "@/views/ADHConfig.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome,
    meta: { title: 'Welcome' },
  },
  {
    path: '/thank-you',
    name: 'ThankYou',
    component: ThankYou,
    meta: { title: 'ThankYou' },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardLayout,
    children: [
      {
        path: "manual-logger",
        name: "ManualLogger",
        component: ManualLogger,
      },
      {
        path: 'assets',
        name: 'Assets',
        component: Assets,
        meta: { title: 'Assets' },
      },
      {
        path: 'subscriptions-dialog',
        name: 'SubscriptionsDialog',
        component: Assets,
        meta: { title: 'subscriptions-dialog'},
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { title: 'Users' },
      },
      {
        path: 'adh-config',
        name: 'ADH Configurations',
        component: ADHConfig,
        meta: { title: 'ADH Configurations' },
      },
    ]
  }
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = JSON.parse(localStorage.getItem("user"));

  // Check for user role access control
  if (to.matched.some(record => record.name === "Users")) {
    const userRole = isAuthenticated ? isAuthenticated.user.account_level : null;

    if (userRole === "company_user") {
      // Redirect if the user role is 'company_user'
      return next("/dashboard/assets");
    }
  }

  // Authentication and access control
  if (!isAuthenticated && to.name !== 'Welcome' && to.name !== 'Login') {
    // Redirect to Welcome if not authenticated and trying to access other pages
    return next({ name: 'Welcome' });
  } else if (isAuthenticated && (to.name === 'Welcome' || to.name === 'Login')) {
    // Redirect authenticated users from Welcome or Login to Assets
    return next({ name: 'Assets' });
  }

  // Proceed with the navigation
  next();
});

export default router;
