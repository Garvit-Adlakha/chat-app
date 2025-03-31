/**
 * Validates that required environment variables are present in the client app
 */
export const validateClientEnv = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_GOOGLE_CLIENT_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !import.meta.env[varName] || import.meta.env[varName] === ''
  );
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(varName => console.error(`- ${varName}`));
    console.error('Please check your .env file and rebuild the application.');
    
    // Don't crash the app, but log clearly to console
    return false;
  }
  
  // Log current origin for easy addition to Google Cloud Console
  if (typeof window !== 'undefined') {
    const allowedOrigins = ['http://localhost:3000', 'http://localhost:5001'];
    const currentOrigin = window.location.origin;
    
    if (!allowedOrigins.includes(currentOrigin)) {
      console.warn(
        `Current origin "${currentOrigin}" is not in the list of allowed origins for Google OAuth.\n` +
        'You may need to add it to your Google Cloud Console project.'
      );
    }
  }
  
  return true;
};

export default validateClientEnv;
