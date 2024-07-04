<template>
  <v-row justify="center">
    <v-dialog v-model="show" persistent max-width="600">
      <v-card>
        <v-img height="100" src="@/assets/login-bg.jpg"></v-img>
        <v-divider></v-divider>
        <v-form pt="12">
          <v-container>
            <v-row>
              <v-col col="12" md="5">
                <div class="text-center mt-5 mb-2 mt-10">
                  <img v-if="!$vuetify.theme.dark" src="@/assets/c8logo-black.png" alt="" width="90" :class="{ 'login-logo': true, 'rotate': rotate, 'small': small }">
                  <img v-if="$vuetify.theme.dark" src="@/assets/c8logo-white.png" alt="" width="90" :class="{ 'login-logo': true, 'rotate': rotate, 'small': small }">
                  
                  <div>
                    <span class="vortex">VORTEX</span>
                  </div>
                  <div class="mt-3">
                    <small>Transformer Monitoring Analytics</small>
                  </div>
                </div>
                <!-- <v-list-item class="">

                  <v-list-item-content class="custom-content text-center">
                    <v-list-item-subtitle>
                      Dissolved Gas Analysis
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item> -->

              </v-col>
              <v-divider vertical></v-divider>
              <v-col col="12" md="7">
                <v-list-item-content class="text-center pt-0">
                  <v-card-actions>
                    <v-spacer></v-spacer>
                                <v-btn  @click="closeLogin()" text><v-icon>mdi-close</v-icon></v-btn>
                </v-card-actions>           
                  <v-list-item-title class="text-h6">
                    Login or Sign Up
                  </v-list-item-title>
                
                  <v-list-item-subtitle>
                    Using
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-card-text>
                  <div class="my-2">
                    <v-btn block :disabled="googleLoading" color="error" class="darken-2" @click="signInWithGoogle()">
                      <v-icon v-if="!googleLoading" left>mdi-google</v-icon>   {{ googleLoading ? 'Please wait...' : 'Google' }}
                    </v-btn>
                  </div>
                  <div class="my-2">
                    <v-btn block :disabled="microsoftLoading" color="info" class="darken-2" @click="signInWithMicrosoft()">
                      <v-icon v-if="!microsoftLoading" left>mdi-microsoft</v-icon>  {{ microsoftLoading ? 'Please wait...' : 'Microsoft' }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-col>

            </v-row>
          </v-container>
        </v-form>
       
      </v-card>
    </v-dialog>
  </v-row>
</template>
<style scoped>

  .vortex{
    font-family: 'century gothic';
    letter-spacing: 0.7rem;
    font-size: larger;
  }
  .login-logo {
    margin-right: 5px;
    transition: 1s ease-in-out;
    transform-origin: center; /* Set the transformation origin to center for smoother animation */
  }
  .rotate {
    animation: rotateAnimation .5s linear forwards; /* Apply the rotation animation */
  }
  .small {
    transform: scale(0.2); /* Start with a very small size */
  }

  @keyframes rotateAnimation {
    from {
      transform: rotate(0deg) scale(0); /* Starting point: no rotation and very small size */
    }
    to {
      transform: rotate(360deg) scale(1); /* Ending point: full rotation and original size */
    }
  }
</style>
<script>
import { msalInstance } from "vue-msal-browser"
// import axios from 'axios'

export default {
  props: ['show', 'googleLoading', 'microsoftLoading'],
  data(){
    return {
      rotate : false,
      small : {},
    }
  },
  watch: {
    'show'() {
      setTimeout(f => {
        this.rotate = this.show ? true : false;
      }, 1)
      
    }
  },
  methods: {
    closeLogin() {
      this.$emit('update:login_dialog', false)
    },
    async signInWithGoogle() {
     
        this.$gAuth.signIn()
        .then(user => {
           this.$emit('authenticate', 'google', user);
      })
    },

    async signInWithMicrosoft() {

      await msalInstance.authenticatePopup()
      .then(graphResponse => {
          this.$emit('authenticate', 'microsoft', graphResponse);
      });
     
    }
  }
}
</script>