<template>
  <div>
    <div v-if="adh_config.length != 0" class="pa-3">
      <v-card>
        <v-toolbar dark dense color="red">
          ADH Configurations
          <v-spacer></v-spacer>
          <!-- <v-btn small @click="openUpdateAdhDialog" outlined>
            Update
            <v-icon class="pl-2">mdi-update</v-icon>
          </v-btn> -->
        </v-toolbar>
        <v-card-text>
          <v-form>
            <v-row dense>
              <v-col cols="12" sm="6" v-if="adh_config[0]">
                <v-text-field v-model="adh_config[0].stream_id" color="red" readonly label="Stream" outlined></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="adh_config[0]">
                <v-text-field v-model="adh_config[0].name" color="red" readonly label="Name" outlined></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="adh_config[0]">
                <v-text-field v-model="adh_config[0].descriptions" color="red" readonly label="Descriptions" outlined></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" v-if="adh_config[0]">
                <v-text-field v-model="adh_config[0].type" color="red" readonly label="Type" outlined></v-text-field>
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
          <v-btn :disabled="adh_loading" depressed color="blue" text apend-icon="mdi-content-save-plus-outline" elevation="3" small @click="updateConfig">
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
              <v-icon color="orange" class="icon ml-3 mt-3"> mdi-alert-circle-outline </v-icon>
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
  </div>
</template>
<style scope>
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
      adh_config: [], // Initialize as an empty array
      newAdhconfig: {},
      updatedAdhconfig: {},
      validation_dialog: false,
      dialogMessage:'',
    };
  },

  mounted() {
  let store = JSON.parse(localStorage.getItem("user"));
  // axios({
  //   url: process.env.VUE_APP_BASEURL + '/adh-config',
  //   method: "GET",
  //   headers: {
  //     Authorization: "Bearer " + store.token,
  //   },
  //   // If you need to send data with GET request, use params instead
  //   params: {
  //     // Example of sending data as query parameters
  //     // Replace 'paramName' with your actual parameter names and values
  //     user_id: store.user.id
  //   }
  // }).then((response) => {
  //   this.adh_config = response.data;
  //   // console.log(this.adh_config);
  // }).catch((err) => {
  //   this.validation_dialog = true;
  //   this.dialogMessage = 'Unauthorized';
  // });
  let test = JSON.parse(localStorage.getItem("token_expiry"));
  if (store && store.token && new Date(test.tokenExpiry) > new Date()) {
    // Token is valid, make the request

    // console.log(store.token);
    this.makeAuthenticatedRequest(store.token, store.user.id);
  } else {
    // Token is expired, refresh it
    this.refreshTokenAndMakeRequest(store.user.id);
  }

},


  methods: {

    async makeAuthenticatedRequest(token, userId) {
    try {
      const response = await axios({
        url: process.env.VUE_APP_BASEURL + '/adh-config',
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
        params: {
          user_id: userId
        }
      });
      this.adh_config = response.data;
    } catch (err) {
      this.validation_dialog = true;
      this.dialogMessage = 'Unauthorized';
    }
  },
  async refreshTokenAndMakeRequest(userId) {
    try {
      await this.acquireTokens(); // This will refresh the token
      let store = JSON.parse(localStorage.getItem("user")); // Re-fetch the user store
      if (store && store.token) {
        this.makeAuthenticatedRequest(store.token, userId);
      } else {
        this.validation_dialog = true;
        this.dialogMessage = 'Unauthorized';
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      this.validation_dialog = true;
      this.dialogMessage = 'Unauthorized';
    }
  },
  async acquireTokens() {
    try {
      const account = msalInstance.getAllAccounts()[0];
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["user.read", "offline_access"],
        account: account
      });
      const tokenExpiry = response.expiresOn; // Update the expiry time
      const user = {
        token: response.accessToken,
        user: response.account,
        tokenExpiry: tokenExpiry
      };
      localStorage.setItem("user", JSON.stringify(user));
    } catch (error) {
      console.error('Error acquiring tokens:', error);
      await msalInstance.loginRedirect({
        scopes: ["user.read", "offline_access"]
      });
    }
  },
    addConfig() {
      this.adh_loading = true;
      this.user = JSON.parse(localStorage.getItem("user")).user;
      this.newAdhconfig.company_id = this.user.company.id;
      this.newAdhconfig.stream_id = this.user.company.company_name + "_DGA";
      axios({
        url: process.env.VUE_APP_BASEURL + '/adh-config/save',
        method: "POST",
        data: this.newAdhconfig,
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      }).then((response) => {
        this.adh_loading = false;
        this.adh_config = [response.data.new_adh];  // Update the config
        // console.log(this.adh_config);
      }).catch((err) => {
        alert(err.response);
        this.adh_loading = false;
      });
    },
    openUpdateAdhDialog() {
      this.updatedAdhconfig = { ...this.adh_config[0] }; // Pre-fill the dialog with the current config
      this.updateAdhDialog = true;
    },
    closeUpdateAdhDialog() {
      this.updateAdhDialog = false;
    },
    updateConfig() {
      this.adh_loading = true;
      axios({
        url: process.env.VUE_APP_BASEURL + '/adh-config/update/' + this.updatedAdhconfig.id, // Adjust the endpoint as necessary
        method: "PUT",
        data: this.updatedAdhconfig,
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      }).then((response) => {
        this.adh_loading = false;
        this.updateAdhDialog = false;
        this.adh_config = [response.data]; // Update the local config
        console.log(this.adh_config);
      }).catch((err) => {
        alert(err.response.message);
        console.log(err.response)
        this.adh_loading = false;
        this.updateAdhDialog = false;
      });
    }
  }
};
</script>
