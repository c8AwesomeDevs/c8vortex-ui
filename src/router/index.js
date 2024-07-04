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
  // {
  //   path: "/login",
  //   name: "Login",
  //   component: Login,
  // },
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
      // {
      //   path: 'subscription',
      //   name: 'Subscription',
      //   component: Subscription
      // },
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
]

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  // Check if the route being accessed is /dashboard/users
  if (to.matched.some((record) => record.name === "Users")) {
    // Get the user role from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const userRole = user ? user.user.account_level : null;

    // Check if the user's role is 'company_user'
    if (userRole === "company_user") {
      // If the user's role is 'company_user', prevent access and redirect to a different route or show an error message
      next("/dashboard/assets"); // Redirect to the dashboard or another suitable route
    } else {
      // If the user's role is not 'company_user', allow access to the route
      next();
    }
  } else {
    // If the route being accessed is not /dashboard/users, allow access to other routes
    next();
  }


  const isAuthenticated = JSON.parse(localStorage.getItem("user"));
 // If the user is trying to access any route before the dashboard and is already authenticated, redirect them to the dashboard
//  const routesBeforeDashboard = ['Welcome'];

 if (to.name !== 'Welcome' && !isAuthenticated) {
  // Redirect to login if not authenticated and trying to access other pages
  next({ name: 'Welcome' });
} else if (to.name === 'Welcome' && isAuthenticated){
  next({name: 'Assets'});
}else{
  next();
}
//  if (!routesBeforeDashboard.includes(to.name) && !isAuthenticated) {
//    next("Welcome"); // Redirect to the dashboard or another suitable route
//  } else {
//    next(); // Allow access to other routes
//  }

});

export default router;
