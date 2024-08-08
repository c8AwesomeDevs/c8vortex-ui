<template>
  <div>
    <div v-if="adh_config.length != 0" class="pa-3">
      <v-card>
        <v-toolbar dark dense color="red">
          ADH Configurations
          <v-spacer></v-spacer>
        </v-toolbar>
        <v-card-text>
          <v-form>
            <v-row dense>
              <v-col v-for="(field, index) in adhFields" :key="index" cols="12" sm="6">
                <!-- Access the first object of the array -->
                <v-text-field
                  v-model="adh_config[0][field.key]"
                  color="red"
                  readonly
                  :label="field.label"
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
    <v-container v-if="adh_config.length == 0" style="position: relative;">
      <v-btn :disabled="adh_loading" block depressed color="red darken-3" dark @click="addConfig">
        <v-icon>mdi-database-settings</v-icon>
        {{ adh_loading ? "Generating..." : "Generate ADH Configurations" }}
      </v-btn>
    </v-container>

    <v-dialog v-model="updateAdhDialog" persistent max-width="500px">
      <v-card>
        <v-card-actions>
          <v-card-title>Update ADH Configurations</v-card-title>
          <v-spacer></v-spacer>
          <v-btn @click="closeUpdateAdhDialog" text>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="12">
              <v-text-field v-model="updatedAdhconfig.tenants" color="red darken-2" label="Tenants" dense outlined hide-details></v-text-field>
            </v-col>
            <v-col cols="12" sm="12">
              <v-text-field v-model="updatedAdhconfig.namespace" color="red darken-2" label="Namespace" dense outlined hide-details></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn :disabled="adh_loading" depressed color="blue" text append-icon="mdi-content-save-plus-outline" elevation="3" small @click="updateConfig">
            {{ adh_loading ? "Updating..." : "Update" }}
            <v-icon v-if="!adh_loading" right dark>mdi-content-save-plus-outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="validation_dialog" max-width="450" min-width="400">
      <template>
        <v-card>
          <div>
            <span>
              <v-icon color="orange" class="icon ml-3 mt-3">mdi-alert-circle-outline</v-icon>
              <span class="demo-check">
                {{ dialogMessage }}
              </span>
            </span>
          </div>
          <v-card-actions class="justify-end">
            <v-btn dark small color="red" text @click="validation_dialog = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
    <v-dialog v-model="success_dialog" max-width="450" min-width="400">
      <template>
        <v-card>
          <div>
            <span>
              <v-icon color="green" class="icon ml-3 mt-3">mdi-check-circle-outline</v-icon>
              <span class="demo-check">
                {{ dialogMessage }}
              </span>
            </span>
          </div>
          <v-card-actions class="justify-end">
            <v-btn dark small color="red" text @click="success_dialog = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
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
</style>

<script>
import axios from "axios";
import { refreshGoogleToken } from '@/utils/authUtils';
import { msalInstance } from "vue-msal-browser";
import { jwtDecode } from 'jwt-decode';

export default {
  name: 'ADHConfig',

  beforeRouteEnter(to, from, next) {
    document.title = `C8 Vortex - ${to.meta.title || ""}`;
    next();
  },
  beforeRouteUpdate(to, from, next) {
    document.title = `C8 Vortex - ${to.meta.title || ""}`;
    next();
  },

  data() {
    return {
      new_adh: {},
      adh_loading: false,
      updateAdhDialog: false,
      user: {},
      adh_config: [],
      newAdhconfig: {},
      updatedAdhconfig: {},
      validation_dialog: false,
      success_dialog: false,
      dialogMessage: '',
      tokenRefreshInterval: null,
      adhFields: [
        { key: 'stream_id', label: 'Stream' },
        { key: 'name', label: 'Name' },
        { key: 'descriptions', label: 'Descriptions' },
        { key: 'type', label: 'Type' }
      ]
    };
  },

  mounted() {
    this.initializeADHconfig();
    // this.startTokenRefreshChecker();
  },
  beforeDestroy() {
    clearInterval(this.tokenRefreshInterval);
  },
  methods: {
    async initializeADHconfig() {
      const storage = this.getStorage();
      if (!storage) return;

      const tokenExp = JSON.parse(localStorage.getItem("token_expiry"));

      if (storage.user.account_type === 'microsoft') {
        await this.handleMicrosoftToken(storage, tokenExp);
      } else if (storage.user.account_type === 'google') {
        await this.handleGoogleToken(storage, tokenExp);
      }
    },

    async handleMicrosoftToken(storage, tokenExp) {
      if (this.isTokenValid(tokenExp.tokenExpiry)) {
        this.makeAuthenticatedRequest(storage.token);
      } else {
        await this.refreshTokenAndMakeRequest('microsoft');
      }
    },

    async handleGoogleToken(storage, tokenExp) {
      if (this.isTokenValid(tokenExp.tokenExpiry)) {
        this.makeAuthenticatedRequest(storage.token);
      } else {
        await this.refreshTokenAndMakeRequest('google');
      }
    },

    isTokenValid(expiry) {
      return new Date(expiry) > new Date();
    },

    async refreshTokenAndMakeRequest(accountType) {
      try {
        if (accountType === 'google') {
          await this.refreshGoogleToken();
        } else if (accountType === 'microsoft') {
          await this.refreshMicrosoftToken();
        }
        const storage = this.getStorage();
        if (storage && storage.token) {
          this.makeAuthenticatedRequest(storage.token);
        } else {
          // this.showUnauthorizedDialog();
        }
      } catch (error) {
        console.error('Error refreshing tokens:', error);
        // this.showUnauthorizedDialog();
      }
    },

    async refreshGoogleToken() {
      const storage = this.getStorage();
      const { id_token } = await refreshGoogleToken(storage.user.refresh_token);
      this.updateTokenStorage(id_token);
    },

    async refreshMicrosoftToken() {
      try {
        const account = msalInstance.getAllAccounts()[0];
        const response = await msalInstance.acquireTokenSilent({
          scopes: ["user.read", "offline_access"],
          account
        });
        this.updateTokenStorage(response.accessToken, response.expiresOn);
        console.log("Token refreshed successfully!");
      } catch (error) {
        console.error('Error acquiring tokens:', error);
        await msalInstance.loginRedirect({ scopes: ["user.read", "offline_access"] });
      }
    },

    async makeAuthenticatedRequest(token) {
      try {
        const response = await axios({
          url: process.env.VUE_APP_BASEURL + '/adh-config',
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        this.adh_config = response.data;
      } catch (err) {
        // this.showUnauthorizedDialog();
      }
    },

    showUnauthorizedDialog() {
      this.validation_dialog = true;
      this.dialogMessage = 'Unauthorized';
    },
    showSuccessDialog() {
      this.success_dialog = true;
      this.dialogMessage = 'ADH config generated successfully!';
    },
    
    startTokenRefreshChecker() {
      this.tokenRefreshInterval = setInterval(() => {
        const storage = this.getStorage();
        const tokenExp = JSON.parse(localStorage.getItem("token_expiry"));
        if (storage && tokenExp) {
          if (!this.isTokenValid(tokenExp.tokenExpiry)) {
            this.refreshTokenAndMakeRequest(storage.user.account_type);
          }
        }
      }, this.refreshInterval);
    },
    
    getStorage() {
      return JSON.parse(localStorage.getItem("user"));
    },
    
    updateTokenStorage(token, expiry) {
      let user = this.getStorage();
      user.token = token;
      localStorage.setItem("user", JSON.stringify(user));

      const decodedToken = jwtDecode(token);
      const tokenExpiry = expiry ? expiry.toISOString() : new Date(decodedToken.exp * 1000).toISOString();
      localStorage.setItem("token_expiry", JSON.stringify({ tokenExpiry }));
    },
    
    async addConfig() {
      this.startTokenRefreshChecker();
      this.adh_loading = true;
      this.user = this.getStorage().user;
      this.newAdhconfig.company_id = this.user.company.id;
      this.newAdhconfig.stream_id = this.user.company.company_name + "_DGA";
      try {
        const response = await axios({
          url: process.env.VUE_APP_BASEURL + '/adh-config/save',
          method: "POST",
          data: this.newAdhconfig,
          headers: {
            Authorization: "Bearer " + this.getStorage().token,
          },
        });
        this.adh_loading = false;
        this.adh_config = [response.data.new_adh];
        this.showSuccessDialog();
      } catch (err) {
        alert(err.response);
        this.adh_loading = false;
      }
    },
    
    openUpdateAdhDialog() {
      this.updatedAdhconfig = { ...this.adh_config[0] };
      this.updateAdhDialog = true;
    },
    
    closeUpdateAdhDialog() {
      this.updateAdhDialog = false;
    },
    
    async updateConfig() {
      this.startTokenRefreshChecker();
      this.adh_loading = true;
      try {
        const response = await axios({
          url: process.env.VUE_APP_BASEURL + '/adh-config/update/' + this.updatedAdhconfig.id,
          method: "PUT",
          data: this.updatedAdhconfig,
          headers: {
            Authorization: "Bearer " + this.getStorage().token,
          },
        });
        this.adh_loading = false;
        this.updateAdhDialog = false;
        this.adh_config = [response.data];
        console.log(this.adh_config);
      } catch (err) {
        alert(err.response.message);
        console.log(err.response);
        this.adh_loading = false;
        this.updateAdhDialog = false;
      }
    }
  }
};
</script>
