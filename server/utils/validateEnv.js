/**
 * Validates critical environment variables on server startup
 */
export const validateEnvironmentVariables = () => {
  const requiredVariables = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'JWT_SECRET',
    'CLIENT_URL'
  ];
  
  const missingVariables = requiredVariables.filter(name => !process.env[name]);
  
  if (missingVariables.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ CRITICAL ERROR: Missing required environment variables:');
    missingVariables.forEach(name => {
      console.error(`   - ${name}`);
    });
    console.error('\nPlease add these to your .env file and restart the server.');
    
    // In production, exit the process. In development, keep running with a warning.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default validateEnvironmentVariables;
