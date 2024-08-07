<template>
  <div>
    <div class="pa-3">
      <v-card>
        <v-toolbar dark dense color="red">
          Users List
          <v-spacer></v-spacer>
          <v-btn v-if="subscription == 'advanced'" small @click="addUsersDialog()" outlined>
            <v-icon>mdi-plus</v-icon>
            Add User
          </v-btn>
        </v-toolbar>
        <!-- big table -->
        <v-data-table :headers="headers" :items="users" item-key="name" class="elevation-1">
          <template v-slot:item="{ item }">
            <tr>
              <td class="font-sm">
                {{ item.name }}
              </td>
              <td class="font-sm">
                {{ item.email }}
              </td>
              <td class="font-sm">
                {{ item.account_type }}
              </td>
              <td class="font-sm">
                {{ item.account_level }}
              </td>
              <td class="font-sm">
                {{ item.created_at }}
              </td>
              <td class="font-sm">
                <v-btn :disabled="item.account_level == 'company_admin'" block small @click="viewAssets(item)" depressed>Assets</v-btn>
              </td>
              <td class="font-sm">
                <v-btn :disabled="item.account_level == 'company_admin'" icon @click="updateUserDialog(item)" depressed>
                  <v-icon small> mdi-square-edit-outline </v-icon>
                </v-btn>
                <v-btn :disabled="item.account_level == 'company_admin'" icon color="red" @click="deleteUserDialog(item)" depressed>
                  <v-icon small> mdi-delete-empty-outline </v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card>
    </div>
    <!-- possible assets -->
    <v-dialog width="600" persistent v-model="assets_dialog">
      <v-card>
        <!-- <v-progress-linear v-if="saving" indeterminate color="red darken-2"> </v-progress-linear> -->
        <v-row no-gutters>
          <v-col>
            <v-card-actions>
              <h3 class="pa-2">
                Select Assets for <span class="red--text uppercase"> {{ user.name }}</span>
              </h3>
              <v-spacer></v-spacer>
              <v-btn @click="assets_dialog = false" text><v-icon>mdi-close</v-icon></v-btn>
            </v-card-actions>

            <v-list dense>
              <!-- <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="text-h6">
                  Select Assets for <span class="red--text uppercase">{{ user.name }}</span>
                  <v-spacer></v-spacer>
          <v-btn @click="updUserDialog = false" text><v-icon>mdi-close</v-icon></v-btn>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item> -->
              <v-divider></v-divider>
              <!-- list elements -->
              <!-- <v-list-item v-for="e in elements" :key="e.id" @click="toggleUserAsset(e.id)">
              <v-btn :color="user_elements.indexOf(e.id) >= 0 ? 'red' : 'grey'" small icon>
                <v-icon>mdi-check-circle</v-icon>
              </v-btn>
              &nbsp;
              <v-list-item-content>
                {{ e.path }}
              </v-list-item-content>
            </v-list-item> -->

              <v-list-item>
                <v-treeview class="pointer" v-if="elements.length > 0" v-model="tree" selected-color="red" :items="elements" selectable item-key="id" dense>
                  <template v-slot:prepend="{ item }">
                    <v-icon class="pointer"> mdi-cube </v-icon>
                  </template>
                </v-treeview>
                <!-- <v-treeview :items="elements" selectable></v-treeview> -->
              </v-list-item>

              <v-divider></v-divider>
              <v-list-item class="pa-2 pb-1">
                <v-spacer></v-spacer>
                <!-- <v-btn class="mx-1" small @click="sendUpdatedAssets" depressed>Save</v-btn> -->
                <v-btn :disabled="loading" depressed color="blue" text apend-icon="mdi-content-save-plus-outline" elevation="3" small @click="sendUpdatedAssets()"
                  >{{ loading ? "Saving..." : "Save" }}<v-icon v-if="!loading" right dark>mdi-content-save-plus-outline</v-icon></v-btn
                >
                <!-- <v-btn class="mx-1" small @click="assets_dialog = false" depressed>Close</v-btn> -->
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
    <!-- validation-->
    <v-dialog v-model="validation_dialog" max-width="350" min-width="300">
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
    <!-- Add new user dialog -->
    <v-dialog v-model="UsersDialog" persistent max-width="500px">
      <v-card>
        <v-card-actions>
          <v-card-title>User Profile</v-card-title>
          <v-spacer></v-spacer>
          <v-btn @click="closeUserdialog()" text><v-icon>mdi-close</v-icon></v-btn>
        </v-card-actions>

        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field v-model="newUser.firstName" color="red darken-2" label="First Name" dense outlined hide-details></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="newUser.lastName" color="red darken-2" label="Last Name" dense outlined hide-details></v-text-field>
            </v-col>
            <v-col cols="12" sm="12">
              <v-text-field v-model="newUser.email" color="red darken-2" label="Work Email" dense outlined hide-details></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn :disabled="loading" depressed color="blue" text apend-icon="mdi-content-save-plus-outline" elevation="3" small @click="addUser()"
            >{{ loading ? "Saving..." : "Save" }}<v-icon v-if="!loading" right dark>mdi-content-save-plus-outline</v-icon></v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Update User dialog -->
    <v-dialog v-model="updUserDialog" persistent max-width="500px">
      <v-card>
        <v-card-actions>
          <v-card-title>Update User Details</v-card-title>
          <v-spacer></v-spacer>
          <v-btn @click="updUserDialog = false" text><v-icon>mdi-close</v-icon></v-btn>
        </v-card-actions>

        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="12">
              <v-text-field v-model="user.name" color="red darken-2" label="Name" dense outlined hide-details></v-text-field>
            </v-col>
            <v-col cols="12" sm="12">
              <v-text-field v-model="user.email" color="red darken-2" label="Work Email" dense outlined hide-details></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn :disabled="loading" elevation="1" color="red" text apend-icon="mdi-content-save-plus-outline" small @click="updateUser(user.id)">
            {{ loading ? "Loading..." : "Update" }}
            <v-icon v-if="!loading" right dark>mdi-content-save-plus-outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Delete User dialog -->
    <v-dialog v-model="delUserDialog" persistent max-width="500px">
      <v-card>
        <v-card-actions>
          <v-card-title>Delete User</v-card-title>
          <v-spacer></v-spacer>
          <v-btn @click="delUserDialog = false" text><v-icon>mdi-close</v-icon></v-btn>
        </v-card-actions>

        <v-card-text> You are about to delete User: {{ user.name }} ({{ user.email }}) </v-card-text>
        <v-card-text> Clicking confirm will delete this user's login credentials and access to the company's assets. </v-card-text>
        <v-card-text>Note : This action cannot be undone.</v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn :disabled="loading" x-small depressed color="red" text apend-icon="mdi-content-save-plus-outline" small @click="deleteUser(user.id)">
            {{ loading ? "Loading..." : "Confirm" }}
            <v-icon v-if="!loading" small right dark>mdi-content-save-plus-outline</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.uppercase {
  text-transform: uppercase;
}

.v-application .grey--text {
  color: #d9d9d9 !important;
}

.text-h6 {
  font-size: 16px !important;
}

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
</style>
<script>
import axios from "axios";
import { msalInstance } from "vue-msal-browser"
import { refreshGoogleToken } from '@/utils/authUtils';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed
export default {
  beforeRouteEnter(to, from, next) {
    document.title = `C8 Vortex - ${to.meta.title || ''}`;
    next();
  },
  beforeRouteUpdate(to, from, next) {
    document.title = `C8 Vortex - ${to.meta.title || ''}`;
    next();
  },
  name: "Users",
  data() {
    return {
      loading: false,
      newUser: {},
      elements: [],
      assets_dialog: false,
      validation_dialog: false,
      dialogMessage: "",
      UsersDialog: false,
      delUserDialog: false,
      updUserDialog: false,
      users: [],
      user: {},
      user_elements: [],
      saving: false,
      subscription: "",
      headers: [
        {
          text: "Name",
          align: "start",
          sortable: true,
          value: "name",
        },
        {
          text: "Email",
          align: "start",
          sortable: true,
          value: "email",
        },
        {
          text: "Account Type",
          align: "start",
          sortable: true,
          value: "account_type",
        },
        {
          text: "Access Level",
          align: "start",
          sortable: true,
          value: "account_level",
        },
        {
          text: "Registration Date",
          align: "start",
          sortable: true,
          value: "created_at",
        },
        {
          text: "Assets Permissions",
          align: "start",
          sortable: false,
        },
        {
          text: "Actions",
          align: "start",
          sortable: false,
        },
      ],
      tree: [],
    };
  },
  mounted() {
    this.initializeUsers();
    this.startTokenRefreshChecker();
  },
  beforeDestroy() {
    clearInterval(this.tokenRefreshInterval); // Clear interval when component is destroyed
  },

  methods: {
    async initializeUsers() {
      const storage = JSON.parse(localStorage.getItem("user"));
      if (!storage || !storage.user) return;

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

    async refreshTokenAndMakeRequest(accountType, userId) {
      try {
        if (accountType === 'google') {
          await this.refreshGoogleToken();
        } else if (accountType === 'microsoft') {
          await this.refreshMicrosoftToken();
        }
        const storage = JSON.parse(localStorage.getItem("user"));
        if (storage && storage.token) {
          if (accountType === 'google') {
            this.makeAuthenticatedRequest(storage.token);
          } else {
            this.makeAuthenticatedRequest(storage.token, userId);
          }
        } else {
          this.showUnauthorizedDialog();
        }
      } catch (error) {
        console.error('Error refreshing tokens:', error);
        this.showUnauthorizedDialog();
      }
    },

    async refreshGoogleToken() {
      const storage = JSON.parse(localStorage.getItem("user"));
      const { id_token } = await refreshGoogleToken(storage.user.refresh_token);
      let user = JSON.parse(localStorage.getItem("user"));
      user.token = id_token;
      localStorage.setItem("user", JSON.stringify(user));

      const decodedToken = jwtDecode(id_token);
      const tokenExpiry = new Date(decodedToken.exp * 1000).toISOString();
      localStorage.setItem("token_expiry", JSON.stringify({ tokenExpiry }));
    },

    async refreshMicrosoftToken() {
      try {
        const account = msalInstance.getAllAccounts()[0];
        const response = await msalInstance.acquireTokenSilent({
          scopes: ["user.read", "offline_access"],
          account
        });
        const tokenExpiry = response.expiresOn.toISOString();
        let user = JSON.parse(localStorage.getItem("user"));
        user.token = response.accessToken;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token_expiry", JSON.stringify({ tokenExpiry }));
      } catch (error) {
        console.error('Error acquiring tokens:', error);
        await msalInstance.loginRedirect({ scopes: ["user.read", "offline_access"] });
      }
    },

    async makeAuthenticatedRequest(token) {
      try {
        const response = await axios({
          url: process.env.VUE_APP_BASEURL + '/users',
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        this.subscription = JSON.parse(localStorage.getItem("user")).user.subscription.subscription_type;
        this.users = response.data.map((u) => {
          u.created_at = new Date(u.created_at).toLocaleDateString();
          return u;
        });
      } catch (err) {
        this.showUnauthorizedDialog();
      }
    },

    showUnauthorizedDialog() {
      this.validation_dialog = true;
      this.dialogMessage = 'Unauthorized';
    },

    startTokenRefreshChecker() {
      this.tokenRefreshInterval = setInterval(() => {
        const storage = JSON.parse(localStorage.getItem("user"));
        const tokenExp = JSON.parse(localStorage.getItem("token_expiry"));
        if (storage && storage.user && tokenExp) {
          if (!this.isTokenValid(tokenExp.tokenExpiry)) {
            this.refreshTokenAndMakeRequest(storage.user.account_type);
          }
        }
      }, this.refreshInterval);
    },
    addUsersDialog() {
      this.UsersDialog = true;
    },
    closeUserdialog() {
      this.UsersDialog = false;
      this.newUser = {};
    },
    updateUserDialog(user) {
      console.log(user);
      this.user = user;
      this.updUserDialog = true;
    },
    deleteUserDialog(user) {
      this.user = user;
      this.delUserDialog = true;
    },
    viewAssets(user) {
      this.startTokenRefreshChecker();
      // this.tree = []; // reset tree everytime
      this.user = user;
      this.assets_dialog = true;

      axios({
        url: process.env.VUE_APP_BASEURL + "/users/" + user.id + "/elements",
        method: "GET",
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      }).then((res) => {
        this.elements = res.data.elements;

        // if (this.tree.length === 0) {
        this.tree = res.data.user_elements.map((e) => {
          // console.log(e);
          return parseInt(e.element_id);
        });
        // }

        // console.log(this.user_elements);
      });
    },
    addUser() {
      this.startTokenRefreshChecker();
      if (!this.newUser.firstName) {
        this.validation_dialog = true;
        this.dialogMessage = "First name is required.";
        return;
      }
      if (!this.newUser.lastName) {
        this.validation_dialog = true;
        this.dialogMessage = "Last name is required.";
        return;
      }
      if (!this.newUser.email) {
        this.validation_dialog = true;
        this.dialogMessage = "Work email is required.";
        return;
      }
      this.loading = true;
      // if(!this.newComment.comment){
      //     this.validation_dialog = true;
      //     this.dialogMessage = 'Please add a comment.';
      //     this.loading = false;
      //     return;
      // }
      // Retrieve the JSON data from localStorage
      const userDataJSON = localStorage.getItem("user");
      // Parse the JSON data into a JavaScript object
      const userData = JSON.parse(userDataJSON);

      // Now you can access properties within the userData object
      const accountType = userData.user.account_type;
      const companyId = userData.user.company_id;

      this.newUser.company_id = companyId;
      this.newUser.account_type = accountType;

      axios({
        url: process.env.VUE_APP_BASEURL + "/addUser",
        method: "POST",
        data: this.newUser,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      })
        .then((response) => {
          // Convert the created_at date to a localized date string
          const createdAt = new Date(response.data.user.created_at).toLocaleDateString();
          // Create a copy of the response data with the converted date
          const responseDataWithLocalizedDate = {
            ...response.data.user,
            created_at: createdAt,
          };
          // Push the modified response data into the this.users array
          this.users.push(responseDataWithLocalizedDate);
          this.newUser = {};
          this.loading = false;
          this.UsersDialog = false;
        })
        .catch((err) => {
          // console.log(err);
          // alert(err);
          this.validation_dialog = true;
          this.dialogMessage = err.response.data.error;
          this.loading = false;
        });
    },
    // toggleUserAsset(id) {
    //   this.saving = true;
    //   let idx = this.user_elements.indexOf(id);
    //   console.log("idx =", idx);
    //   if (idx == -1) {
    //     //Add Element
    //     axios({
    //       url: process.env.VUE_APP_BASEURL + "/users/" + this.user.id + "/elements",
    //       method: "POST",
    //       data: {
    //         element_id: id,
    //         action: "add",
    //       },
    //       headers: {
    //         Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
    //       },
    //     })
    //       .then((res) => {
    //         const response = res.data;
    //         console.log("response =", response);
    //         this.user_elements.push(id);
    //         this.saving = false;
    //       })
    //       .catch((err) => {
    //         alert(JSON.stringify(err.response));
    //         this.saving = false;
    //       });
    //   } else {
    //     //Delete Element
    //     axios({
    //       url: process.env.VUE_APP_BASEURL + "/users/" + this.user.id + "/elements",
    //       method: "POST",
    //       data: {
    //         element_id: id,
    //         action: "delete",
    //       },
    //       headers: {
    //         Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
    //       },
    //     })
    //       .then((res) => {
    //         this.user_elements.splice(idx, 1);
    //         this.saving = false;
    //       })
    //       .catch((err) => {
    //         alert(JSON.stringify(err.response));
    //         this.saving = false;
    //       });
    //   }
    // },
    sendUpdatedAssets() {
      this.startTokenRefreshChecker();
      // console.log(this.elements);
      if (this.elements.length == 0) {
        this.validation_dialog = true;
        this.dialogMessage = "There is no available assets.";
        return;
      }
      this.loading = true;
      axios({
        url: process.env.VUE_APP_BASEURL + "/users/" + this.user.id + "/elements",
        method: "POST",
        data: {
          assets: this.tree,
        },
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      })
        .then((res) => {
          // console.log(res.data);
          if (res.status === 201) {
            this.tree = [];
            this.element = [];
            this.loading = false;
            this.assets_dialog = false;
          }
        })
        .catch((err) => {
          // alert(JSON.stringify(err.response));
          this.loading = false;
        });
    },
    deleteUser(userID) {
      this.startTokenRefreshChecker();
      this.loading = true;
      axios({
        url: process.env.VUE_APP_BASEURL + "/deleteUser",
        method: "POST",
        data: {
          delete_user: this.user.id,
        },
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      }).then((res) => {
        // console.log(res);
        if (res.status === 200) {
          // hide the modal if successful
          this.delUserDialog = false;
          // remove the deleted user from the list using splice
          let copy = this.users;
          copy.splice(
            copy.findIndex((el) => el.id === userID),
            1
          );
          this.users = copy;
          this.loading = false;
        }
      });
    },
    updateUser(userID) {
      this.startTokenRefreshChecker();
      this.loading = true;
      let payload = {
        id: this.user.id,
        email: this.user.email,
        name: this.user.name,
      };
      axios({
        url: process.env.VUE_APP_BASEURL + "/updateUser",
        method: "PATCH",
        data: payload,
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      }).then((res) => {
        if (res.status === 200) {
          this.updUserDialog = false;
          this.loading = false;
        }
      });
    },
    click() {
      console.log("click");
    },
  },
};
</script>
