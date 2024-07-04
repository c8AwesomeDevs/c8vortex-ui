import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import GAuth from "vue-google-oauth2";
import { default as msalPlugin } from "vue-msal-browser";
const msalConfig = {
  auth: {
    clientId: "f585ce38-5e47-475a-b71c-45ce41ed6e7b",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:8080",
    // redirectUri: "https://c8vortexui.azurewebsites.net",
    scopes: ["User.Read"],
  },

  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },

  graph: {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
    scopes: ["User.Read"],
    response_type: "blob",
  },
  mode: "poup",
};

Vue.use(msalPlugin, msalConfig);

const gAuthOptions = {
  //For Deployment
  // clientId: "198378287573-aukr99qrcbqa64mq73j5kho2hh6sc1dv.apps.googleusercontent.com",
  // plugin_name: "Google Authentication",
  //For Testing
  clientId: "812363864518-72u43pul4m01nkmj6185j2is3hkju9jf.apps.googleusercontent.com",
  plugin_name: "Google Sign in",
  scope: "email",
  prompt: "select_account",
};

Vue.use(GAuth, gAuthOptions);

Vue.config.productionTip = false;
new Vue({
  router,
  store,
  vuetify,
  render: function (h) {
    return h(App);
  },
}).$mount("#app");
