<template>
  <v-dialog v-model="dialog" width="800" :persistent="persistent">
    <v-card>
      <v-card-title>
        Subscription Plans
        <v-spacer></v-spacer>
        <span><v-icon @click="closeSubs()">mdi-close</v-icon></span>
      </v-card-title>
      <v-card-text>
        <!-- <v-alert color="green" outlined text type="info">
          You're currently subscribed to
          <b>{{ subscription_type }}</b
          >.
          <v-btn v-if="subscription_type !== 'demo'" text small color="primary" @click="manageSub()">Manage Subscription</v-btn>
        </v-alert> -->

        <!-- DEMO -->
        <v-card class="mb-4" outlined tile>
          <div class="d-flex align-center justify-space-between">
            <div>
              <h3 class="pa-5 pb-1">C8 Vortex Demo</h3>
              <v-card-text class="pt-1">
                <div class="price">
                  <h1>{{ subscriptions.demo.price }}</h1>
                </div>
              </v-card-text>
            </div>
            <div class="pr-4">
              <div v-if="subscription_type == 'demo'">Expiration: {{ expiration_date }}</div>
            </div>
          </div>
          <v-divider></v-divider>

          <v-row class="pa-2" no-gutters>
            <v-col v-for="n in subscriptions.demo.inclusions" :key="n" cols="12" sm="4">
              <div class="d-flex">
                <v-icon color="green" class="mr-3"> mdi-check </v-icon>
                <div class="pa-2" outlined tile>{{ n }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card>
        <!-- ADVANCE -->
        <v-card class="mb-4" outlined tile>
          <div class="d-flex align-center justify-space-between">
            <div>
              <h3 class="pa-5 pb-1">C8 Vortex Advance</h3>
              <v-card-text class="pt-1">
                <div class="price">
                  <h1>{{ subscriptions.advanced.price }}</h1>
                </div>
              </v-card-text>
            </div>
            <div class="pr-4">
              <!-- <div v-if="subscription_type == 'advanced'">Your next billing date is: asdasdasd</div> -->
              <v-btn v-if="subscription_type == 'advanced'" block :dark="!loading" :disabled="loading" color="orange" @click="manageSub()">{{
                loading ? "Please wait..." : "Manage Subscription"
              }}</v-btn>
              <v-btn v-if="subscription_type != 'advanced'" block dark :disabled="demo_dialog == true" color="orange darken-2" @click="demo_dialog = true;">Get Advance
              </v-btn>
              <div class="pr-4 pt-2">
                <div v-if="subscription_type == 'advanced'">Expiration: {{ expiration_date }}</div>
              </div>
            </div>
          </div>
          <v-divider></v-divider>

          <v-row class="pa-2" no-gutters>
            <v-col v-for="n in subscriptions.advanced.inclusions" :key="n" cols="12" sm="4">
              <div class="d-flex">
                <v-icon color="green" class="mr-3"> mdi-check </v-icon>
                <div class="pa-2" outlined tile>{{ n }}</div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-card-text>
    </v-card>
    <!-- <v-row no-gutters>
      <v-col>
        <v-card outlined tile class="card-demo">
          <v-card-subtitle class="text-center"> C8 VORTEX DEMO </v-card-subtitle>
          <v-card-text>
            <div class="text-center price">
              <h1>{{ subscriptions.demo.price }}</h1>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn block disabled color="orange" class="lighten-2">{{ subscription_type == "demo" ? "Current Subscription" : "Demo" }}</v-btn>
          </v-card-actions>
          <v-list dense class="font-sm">
            <v-list-item v-for="(inclusion, idx) in subscriptions.demo.inclusions" :key="idx">
              <v-icon color="grey" class="mr-3"> mdi-shield-check-outline </v-icon>
              <v-list-item-content>
                {{ inclusion }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col>
        <v-card outlined tile class="card-advanced">
          <v-card-subtitle class="text-center">
            C8 VORTEX ADVANCED
            <span class="right"><v-icon @click="closeSubs()">mdi-close</v-icon></span>
          </v-card-subtitle>
          <v-card-text>
            <div class="text-center price">
              <h1>{{ subscriptions.advanced.price }}</h1>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn v-if="subscription_type == 'advanced'" :disabled="loading" @click="checkSubscription('advanced')" block color="orange darken-2">{{
              loading ? "Checking..." : "Current Subscription"
            }}</v-btn>
            <v-btn v-if="subscription_type == 'demo'" :disabled="loading" block color="orange darken-2" @click="upgrade('advanced')">{{
              loading ? "Loading..." : "Upgrade to Advance"
            }}</v-btn>
          </v-card-actions>
          <v-list dense class="font-sm">
            <v-list-item v-for="(inclusion, idx) in subscriptions.advanced.inclusions" :key="idx">
              <v-icon v-if="subscription_type == 'advanced'" color="green" class="mr-3"> mdi-shield-check </v-icon>
              <v-icon v-if="subscription_type == 'demo'" color="green" class="mr-3"> mdi-shield-check-outline </v-icon>
              <v-list-item-content>
                {{ inclusion }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row> -->
    <template>
      <v-dialog width="350" v-model="current_subscription_dialog">
        <v-card>
          <v-card-title>Your current subscription</v-card-title>
          <v-card-text>
            <div>Your active subscription for this package will expire on {{ expiration_date }}.</div>
            <br />
            <!-- <div>Do you want to renew your subscription instead?</div> -->
            <!-- <div class="red--text">
                            Note : This will be activated once your existing subscription expired.
                        </div> -->
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" class="darken-2" text dark @click="current_subscription_dialog = false">close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <template>
      <v-dialog v-model="validation_dialog" max-width="450" min-width="400">
        <template>
          <v-card>
            <div>
              <span>
                <v-icon color="orange" class="icon ml-3 mt-3"> mdi-alert-circle-outline </v-icon>
                <span class="demo-check"> Advanced subscription is under development. </span>
              </span>
            </div>
            <v-card-actions class="justify-end">
              <v-btn dark small color="red" text @click="validation_dialog = false">OK</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </template>
    <template>
      <v-dialog width="350" v-if="!validation_dialog == true" v-model="demo_dialog" persistent >
        <v-card>
          <v-card-actions>
            <v-card-title>Upgrade to Advance</v-card-title>
            <v-spacer></v-spacer>
            <v-btn @click="demo_dialog = false" text><v-icon>mdi-close</v-icon></v-btn>
          </v-card-actions>
          <v-card-text>
            <div>Note: All of your assets data will be deleted for demo versions.</div>
            <br />
            <!-- <div>Do you want to renew your subscription instead?</div> -->
            <!-- <div class="red--text">
                            Note : This will be activated once your existing subscription expired.
                        </div> -->
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" class="darken-2" :disabled="loading" text  @click="upgrade('advanced')">{{ loading ? 'Loading...' : 'Proceed'}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
    <!-- <template>
      <stripe-checkout
        ref="checkoutRef"
        mode="subscription"
        :pk="key"
        :line-items="items"
        :success-url="success_url"
        :cancel-url="cancel_url"
        :client-reference-id="reference_id"
        :customer-email="email"
        @loading="(v) => (loading = v)"
      />
    </template> -->
  </v-dialog>
</template>

<style scoped>
.demo-check {
  font-size: 13px;
  white-space: pre;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 1em;
  margin-right: 1em;
}

.icon {
  font-size: 25px;
}

.right {
  position: absolute;
  padding-left: 5rem;
  cursor: pointer;
}
.font-sm {
  font-size: 14px;
}
.card-demo {
  height: 570px; /* Set the desired height for the DEMO card */
}

.card-advanced {
  height: 570px; /* Set the desired height for the ADVANCED card */
}
</style>
<script>
import axios from "axios";
import { subscriptionMixin } from "@/mixins/subscriptionMixin.js";
import { StripeCheckout } from "@vue-stripe/vue-stripe";
import { refreshGoogleToken } from '@/utils/authUtils';
import { msalInstance } from "vue-msal-browser"
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed
export default {
  name: "SubscriptionsDialog",
  props: ["dialog"],
  mixins: [subscriptionMixin],
  components: { StripeCheckout },
  data() {
    return {
      persistent: true,
      subscription_type: "",
      current_subscription_dialog: false,
      current_subscription_details: {},
      items: [],
      email: null,
      success_url: null,
      cancel_url: null,
      reference_id: null,
      key: process.env.VUE_APP_STRIPE_KEY,
      loading: false,
      demo_dialog: false,
      validation_dialog: false,
      expiration_date: "",
      user:{},
      tokenRefreshInterval: null,
      refreshInterval: 60000, // Set the interval time for token refresh
    };
  },
  mounted() {
   
    this.user = JSON.parse(localStorage.getItem("user")).user
    this.subscription_type = this.user.subscription.subscription_type;
    this.expiration_date = this.user.subscription.expiration_date;
    // console.log(this.subscription_type);
    // if (this.subscription_type == "demo") {
    //   this.checkSub("demo");
    // } else {
    //   this.checkSub("advanced");
    // }
    this.startTokenRefreshChecker();
  },
  beforeDestroy() {
    clearInterval(this.tokenRefreshInterval); // Clear interval when component is destroyed
  },
  watch: {
    user() {
      // this is needed to dynamically switch the UI elemets
      this.subscription_type = this.user.subscription.subscription_type;
      // listen to this.user prop and check the user's subscription status accordingly
      if (this.user.subscription.subscription_type == "demo") {
        this.checkSub("demo");
      } else {
        this.checkSub("advanced");
      }
    },
  },
  methods: {
    closeSubs() {
      this.$emit("close");
    },
    subscribe(type) {
      this.$emit("subscribe", type, this.subscriptions[type].price_id);
    },
    async upgrade(type) {
      await this.startTokenRefreshChecker();
      this.loading = true;
      try {
        const res = await axios({
          url: process.env.VUE_APP_BASEURL + "/checkout",
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
        window.open(res.data, "_self");
      } catch (error) {
        console.error('Upgrade error:', error);
        this.showErrorDialog(error);
      } finally {
        this.loading = false;
      }
    },
    async manageSub() {
      await this.startTokenRefreshChecker();
      this.loading = true;
      try {
        const res = await axios({
          url: process.env.VUE_APP_BASEURL + "/subscriptions/manage",
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.getToken()}`,
          },
        });
        if (res.data) {
          window.open(res.data, "_self");
        }
      } catch (error) {
        console.error('Manage subscription error:', error);
        this.showErrorDialog(error);
      } finally {
        this.loading = false;
      }
    },
    async checkSub(type) {
      const storage = JSON.parse(localStorage.getItem("user"));
      if (!storage || !storage.user) {
        this.showUnauthorizedDialog();
        return;
      }

      if (this.isTokenValid()) {
        // Token is valid, make the request
        await this.makeCheckSubRequest(type, this.getToken());
      } else {
        // Token is expired, refresh it
        await this.refreshTokenAndCheckSub(type);
      }
    },
    async makeCheckSubRequest(type, token) {
      try {
        const response = await axios({
          url: process.env.VUE_APP_BASEURL + "/subscriptions/check",
          method: "GET",
          params: { type },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.id !== undefined) {
          this.current_subscription_details = response.data;
        }
      } catch (error) {
        console.error('Check subscription error:', error);
        this.showUnauthorizedDialog();
      }
    },
    async refreshTokenAndCheckSub(type) {
      try {
        await this.refreshToken();
        const updatedStorage = JSON.parse(localStorage.getItem("user"));
        if (updatedStorage && updatedStorage.token) {
          await this.makeCheckSubRequest(type, updatedStorage.token);
        } else {
          this.showUnauthorizedDialog();
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        this.showUnauthorizedDialog();
      }
    },
    async refreshToken() {
      const storage = JSON.parse(localStorage.getItem("user"));
      if (storage.user.account_type === 'google') {
        await this.refreshGoogleToken();
      } else if (storage.user.account_type === 'microsoft') {
        await this.refreshMicrosoftToken();
      }
    },
    async refreshGoogleToken() {
      try {
        const storage = JSON.parse(localStorage.getItem("user"));
        const { id_token } = await refreshGoogleToken(storage.user.refresh_token);
        this.updateToken(id_token);
      } catch (error) {
        console.error('Error refreshing Google token:', error);
        this.showUnauthorizedDialog();
      }
    },
    async refreshMicrosoftToken() {
      try {
        const account = msalInstance.getAllAccounts()[0];
        const response = await msalInstance.acquireTokenSilent({
          scopes: ["user.read", "offline_access"],
          account: account,
        });
        this.updateToken(response.accessToken, response.expiresOn);
      } catch (error) {
        console.error('Error acquiring Microsoft token:', error);
        await msalInstance.loginRedirect({ scopes: ["user.read", "offline_access"] });
      }
    },
    isTokenValid() {
      const tokenExp = JSON.parse(localStorage.getItem("token_expiry"));
      return new Date(tokenExp.tokenExpiry) > new Date();
    },
    getToken() {
      const storage = JSON.parse(localStorage.getItem("user"));
      return storage.token;
    },
    updateToken(token, expiryDate = null) {
      const decodedToken = jwtDecode(token);
      const tokenExpiry = expiryDate || new Date(decodedToken.exp * 1000).toISOString();
      let user = JSON.parse(localStorage.getItem("user"));
      user.token = token;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token_expiry", JSON.stringify({ tokenExpiry }));
    },
    showUnauthorizedDialog() {
      this.validation_dialog = true;
      this.dialogMessage = 'Unauthorized';
    },
    showErrorDialog(error) {
      alert(JSON.stringify(error));
    },
    startTokenRefreshChecker() {
      if (!this.tokenRefreshInterval) {
        this.tokenRefreshInterval = setInterval(async () => {
          if (!this.isTokenValid()) {
            await this.refreshToken();
          }
        }, this.refreshInterval);
      }
    },
  },
};
</script>
