<template>
  <div>
    <v-navigation-drawer v-model="drawer" dark src="@/assets/sidebar-bg.png" app>
      <v-list-item>
        <v-list-item-content class="custom-content text-center mt-5 mb-2">
          <v-list-item-title>
            <img src="@/assets/logo.png" alt="" width="80" />
          </v-list-item-title>
          <v-list-item-subtitle> Dissolved Gas Analysis </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list dense nav>
        <v-list-item-group v-model="page">
          <v-list-item link v-for="(i, idx) in items" :key="idx" :to="{ name: i.link }" @click="title = i.title">
            <v-list-item-icon>
              <v-icon>{{ i.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ i.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>

        <!-- <v-list-item @click="signOut()">
          <v-list-item-icon>
            <v-icon>mdi-power</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>Log-Out</v-list-item-title>
          </v-list-item-content>
        </v-list-item> -->
      </v-list>

      <template v-slot:append>
        <v-list dense nav>
          <!-- subscription plan -->
          <v-list-item v-if="user.account_level == 'company_admin'" @click="showSubscription()">
            <v-list-item-icon>
              <v-icon>mdi-handshake</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Subscription Plan</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <!-- FAQ -->
          <v-list-item @click="toggleHelpDialog()">
            <v-list-item-icon>
              <v-icon>mdi-help</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>FAQ's</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <!-- light/dark mode toggle -->
          <v-list-item @click="darkmode()">
            <v-list-item-icon>
              <v-icon v-if="$vuetify.theme.dark">mdi-weather-night</v-icon>
              <v-icon v-if="!$vuetify.theme.dark">mdi-weather-sunny</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title v-if="$vuetify.theme.dark">Dark</v-list-item-title>
              <v-list-item-title v-if="!$vuetify.theme.dark">Light</v-list-item-title>
            </v-list-item-content>
          </v-list-item>

          <v-list-item @click="signOut()">
            <v-list-item-icon>
              <v-icon>mdi-power</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Log-Out</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>

    <v-app-bar app dark dense class="red app-header">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <router-view></router-view>
    </v-main>

    <!-- Footer -->
    <v-footer absolute class="footer mt-10 mb-1" color="transparent">
      <span class="lighten-2"> {{ new Date().getFullYear() }} — &copy; Calibr8 Systems Inc.</span>
    </v-footer>
    <SubscriptionPlanDialog v-if="user.account_level == 'company_admin'" :dialog="subscriptionplan_dialog" @close="closeSubscriptionsDialog" :user="user"></SubscriptionPlanDialog>
    <FAQDialog @close="toggleHelpDialog" :user="user" :show="showFAQ" />
  </div>
</template>

<style scoped>
.custom-content {
  flex: unset;
}
/* Center the text in the footer */
.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 14px;
}

/* Make the text lighter */
</style>
<script>
import { msalInstance } from "vue-msal-browser";
import FAQDialog from "@/components/popups/FAQDialog.vue";
import SubscriptionPlanDialog from "@/components/popups/SubscriptionPlanDialog.vue";

export default {
  components: {
    SubscriptionPlanDialog,
    FAQDialog,
  },
  data: () => ({
    drawer: null,
    page: 0,
    title: "",
    user: {},
    items: [],
    showFAQ: false,
    subscriptionplan_dialog: false,
  }),
  mounted() {
    this.user = JSON.parse(localStorage.getItem("user")).user;
    // let token = JSON.parse(localStorage.getItem("token_expiry"));

    // let time = token.tokenExpiry;

    // let date = new Date(time)

    // let localdate = date.toLocaleString();

    // console.log(localdate);
    // color theme
    if (localStorage.getItem("dark-mode") === "true") {
      this.$vuetify.theme.dark = true;
    }
    // the pages a user can interact with is based on his account_level
    if (this.user.account_level == "company_admin") {
      this.items = [
        // {
        //   title: "Dashboard",
        //   icon: "mdi-view-dashboard-variant",
        //   link: "Home",
        // },
        {
          title: "Assets",
          icon: "mdi-cube",
          link: "Assets",
        },
        // {
        //   title: "Subscription",
        //   icon: "mdi-handshake",
        //   link: "Subscription",
        // },
        {
          title: "Users",
          icon: "mdi-account",
          link: "Users",
        },
        {
          title: "ADH Configurations",
          icon: "mdi-database-settings-outline",
          link: "ADH Configurations",
        },
      ];
    } else {
      this.items = [
        // {
        //   title: "DGA Dashboard",
        //   icon: "mdi-view-dashboard-variant",
        //   link: "Home",
        // },
        {
          title: "Assets",
          icon: "mdi-cube",
          link: "Assets",
        },
        // {
        //   title: "Subscription",
        //   icon: "mdi-handshake",
        //   link: "Subscription",
        // }
      ];
    }

    // determine if user needs tutorial
    let store = JSON.parse(localStorage.getItem("user"));
    this.showFAQ = store && store.user.is_new === "1" ? true : false;
  },
  watch: {
    "$vuetify.theme.dark": {
      handler: function (val) {
        localStorage.setItem("dark-mode", val);
      },
      deep: true,
    },
  },
  methods: {
    async signOut() {
      if(this.user.account_type == 'microsoft'){
         msalInstance.logoutRedirect();
         localStorage.removeItem("user");
          this.$router.push({ name: "Welcome" });
        }else{
          localStorage.removeItem("user");
          this.$router.push({ name: "Welcome" });
        }
    },
    closeSubscriptionsDialog() {
      this.subscriptionplan_dialog = false;
    },
    toggleHelpDialog() {
      // console.log("help");
      this.showFAQ = !this.showFAQ;
    },
    darkmode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    showSubscription() {
      this.subscriptionplan_dialog = true;
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      // set title based on the route name
      vm.title = to.name;
    });
  },
};
</script>
