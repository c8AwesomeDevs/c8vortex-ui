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
              </v-col>
              <v-divider vertical></v-divider>
              <v-col col="12" md="7">
                <v-list-item-content class="text-center pt-0">
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click="closeLogin()" text><v-icon>mdi-close</v-icon></v-btn>
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
  .vortex {
    font-family: 'century gothic';
    letter-spacing: 0.7rem;
    font-size: larger;
  }
  .login-logo {
    margin-right: 5px;
    transition: 1s ease-in-out;
    transform-origin: center;
  }
  .rotate {
    animation: rotateAnimation .5s linear forwards;
  }
  .small {
    transform: scale(0.2);
  }
  @keyframes rotateAnimation {
    from {
      transform: rotate(0deg) scale(0);
    }
    to {
      transform: rotate(360deg) scale(1);
    }
  }
</style>

<script>
import axios from 'axios';
import { msalInstance } from "vue-msal-browser"
export default {
  props: ['show', 'googleLoading', 'microsoftLoading'],
  data() {
    return {
      rotate: false,
      small: {},
      authCode: '',
      accessToken: '',
      id_token:'',
      refreshToken: '',
    };
  },
  watch: {
    'show'() {
      setTimeout(() => {
        this.rotate = this.show ? true : false;
      }, 1);
    }
  },
  methods: {
    closeLogin() {
      this.$emit('update:login_dialog', false);
    },
    async signInWithGoogle() {
      this.googleLoading = true;
      const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
      const redirectUri = process.env.VUE_APP_GOOGLE_REDIRECT_URI;
      const scope = process.env.VUE_APP_GOOGLE_SCOPE;
      const responseType = process.env.VUE_APP_GOOGLE_RESPONSE_TYPE;
      const accessType = process.env.VUE_APP_GOOGLE_ACCESS_TYPE;

      const url = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}`;
      window.location.href = url;
    },
    async handleGoogleCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        this.authCode = code;
        await this.generateTokensAndProfile();
      }
    },
    async generateTokensAndProfile() {
      const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.VUE_APP_GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.VUE_APP_GOOGLE_REDIRECT_URI;
      const code = this.authCode;

      const data = {
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      };

      try {
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', data);
        this.accessToken = tokenResponse.data.access_token;
        this.id_token = tokenResponse.data.id_token;
        this.refreshToken = tokenResponse.data.refresh_token;
        // Emit the authenticate event
        this.$emit('authenticate', 'google', {
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          id_token: this.id_token,
        });

        // console.log( this.id_token);
      } catch (error) {
        console.error('Error generating tokens or fetching profile:', error);
      }
    },

    async signInWithMicrosoft() {
      await msalInstance.loginRedirect({
        scopes: ["user.read" , "offline_access"]

        
      });
    },
    // async handleMicrosoftCallback() {
    //   const response = await msalInstance.handleRedirectPromise();
     
    //   if (response) {
    //     this.$emit('authenticate', 'microsoft', response);
    //   } else {
    //     // Handle the case where the response is not present
    //     console.error('No response after redirect');
    //   }
    // },

    async handleMicrosoftCallback() {
      const response = await msalInstance.handleRedirectPromise();
      if (response) {
        const tokenExpiry = response.expiresOn; // Store the expiry time of the token
        const token_expiry = {
          // token: response.accessToken,
          // user: response.account,
          tokenExpiry: tokenExpiry
        };
        
        localStorage.setItem("token_expiry", JSON.stringify(token_expiry));

        let test = JSON.parse(localStorage.getItem("token_expiry"));
        console.log(test);
        this.$emit('authenticate', 'microsoft', response);
      } else {
        console.error('No response after redirect');
      }
    },
    // async acquireTokens() {
    //   try {
    //     const account = msalInstance.getAllAccounts()[0];
    //     const response = await msalInstance.acquireTokenSilent({
    //       scopes: ["user.read", "offline_access"],
    //       account: account
    //     });
    //   } catch (error) {
    //     console.error('Error acquiring tokens:', error);
    //   }
    // }
  },

  // async generateCodeChallenge() {
  //     // Generate a random string (code verifier)
  //     const codeVerifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
  //       .map(byte => byte.toString(16).padStart(2, '0'))
  //       .join('');

  //     // Encode the code verifier to base64url
  //     const encoder = new TextEncoder();
  //     const data = encoder.encode(codeVerifier);
  //     const hash = await crypto.subtle.digest('SHA-256', data);
  //     const base64Url = btoa(String.fromCharCode(...new Uint8Array(hash)))
  //       .replace(/\+/g, '-')
  //       .replace(/\//g, '_')
  //       .replace(/=+$/, '');

  //     return {
  //       codeChallenge: base64Url,
  //       codeVerifier: codeVerifier
  //     };
  //   },

  //   async signInWithMicrosoft() {
  //     this.microsoftLoading = true;
  //     const clientId = process.env.VUE_APP_MICROSOFT_CLIENT_ID;
  //     const redirectUri = 'http://localhost:8080/';
  //     const scope = process.env.VUE_APP_MICROSOFT_SCOPE;
  //     const responseType = 'code';
  //     const responseMode = 'query';
  //     const state = '12345';
  //     const ssoReload = 'true';

  //     // Generate code challenge and verifier
  //     const { codeChallenge, codeVerifier } = await this.generateCodeChallenge();
      
  //     // Save the code verifier for later use
  //     localStorage.setItem('code_verifier', codeVerifier);

  //     // Construct the authorization URL
  //     const url = `https://login.microsoftonline.com/${process.env.VUE_APP_MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=${responseType}&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=${responseMode}&scope=${encodeURIComponent(scope)}&state=${state}&sso_reload=${ssoReload}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  //     // Redirect to the authorization URL
  //     window.location.href = url;
  //   },

  //   async handleMicrosoftCallback() {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const code =  urlParams.get('code');
      
  //     if (code) {
  //       this.authCode = code;
  //       await this.generateTokensAndProfile();
  //     } else {
  //       console.error('Authorization code not found in the URL');
  //     }
  //   },

  //   async generateTokensAndProfile() {
  //     const clientId = process.env.VUE_APP_MICROSOFT_CLIENT_ID;
  //     const redirectUri = 'http://localhost:8080/';
  //     const code = this.authCode;
  //     const codeVerifier = localStorage.getItem('code_verifier');
  //     const url = `https://login.microsoftonline.com/${process.env.VUE_APP_MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
      
  //     const params = new URLSearchParams();
  //     params.append('client_id', clientId);
  //     params.append('scope', 'user.read openid profile offline_access');
  //     params.append('code', code);
  //     params.append('redirect_uri', redirectUri);
  //     params.append('grant_type', 'authorization_code');
  //     params.append('code_verifier', codeVerifier);

  //     try {
  //       const tokenResponse = await axios.post(url, params.toString(), {
  //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //       });

  //       // Handle the token response
  //       this.accessToken = tokenResponse.data.access_token;
  //       this.id_token = tokenResponse.data.id_token;
  //       this.refreshToken = tokenResponse.data.refresh_token || null;

  //       // Emit the authenticate event
  //       this.$emit('authenticate', 'microsoft', {
  //         accessToken: this.accessToken,
  //         refreshToken: this.refreshToken,
  //         id_token: this.id_token
  //       });

  //     } catch (error) {
  //       console.error('Error generating tokens or fetching profile:', error.response ? error.response.data : error.message);
  //     }
  //   }
  // },
  mounted() {
    this.handleGoogleCallback();
    this.handleMicrosoftCallback();
  }
  
};
</script>
