<template>
  <div>
    <div v-if="adh_config.length > 0" class="pa-3">
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
    <v-container v-if="adh_config.length < 0" style="position: relative;">
      <v-btn block depressed color="red darken-3" dark @click="addConfig">
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
  </div>
</template>

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
    };
  },

  mounted() {
    axios({
      url: process.env.VUE_APP_BASEURL + '/adh-config',
      method: "GET",
      headers: {
        Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
      },
    }).then((response) => {
      this.adh_config = response.data;
      console.log(this.adh_config);
    }).catch((err) => {
      alert(err.response);
    });
  },

  methods: {
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
        console.log(this.adh_config);
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
        alert(err.response);
        this.adh_loading = false;
        this.updateAdhDialog = false;
      });
    }
  }
};
</script>
