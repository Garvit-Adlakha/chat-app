import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

// Create a new instance of the OAuth2 client with your Google client ID
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
});

// Wrapper function to verify ID tokens with better error handling
export const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    return ticket.getPayload();
  } catch (error) {
    // Log detailed error for debugging
    console.error('Google token verification error:', error.message);
    
    // Check for specific error types and provide helpful messages
    if (error.message.includes('origin')) {
      throw new Error('Authentication failed: Your domain is not authorized for Google Sign-In. Please add your domain to the allowed origins in Google Cloud Console.');
    }
    
    throw new Error('Google authentication failed: ' + error.message);
  }
};

export default client;
