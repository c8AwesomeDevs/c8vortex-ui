import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed

export async function refreshGoogleToken(refreshToken) {
  const clientId = process.env.VUE_APP_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.VUE_APP_GOOGLE_CLIENT_SECRET;

  const data = {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  };

  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams(data));
    const { access_token, id_token} = response.data;

    // Decode the ID token to get the expiration time
    const decodedToken = jwtDecode(id_token);
    const tokenExpiry = new Date(decodedToken.exp * 1000); // Convert to milliseconds
    const token_expiry = tokenExpiry.toISOString();
    // Update local storage
    let user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      user.token_expiry = token_expiry
      user.token = id_token;
      localStorage.setItem("user", JSON.stringify(user));
    }

    // console.log('Google token refreshed successfully');
    return { access_token, id_token, token_expiry };

  } catch (error) {
    console.error('Error refreshing Google token:', error);
    throw error;
  }
}
