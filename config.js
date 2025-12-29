/**
 * App Configuration
 * In a production environment, use environment variables or a serverless proxy.
 */
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const CONFIG = {
    CLIENT_ID: '192457',
    // Use origin for both local and prod. 
    // IMPORTANT: Make sure this matches your 'Authorization Callback Domain' in Strava
    REDIRECT_URI: window.location.origin,
    AUTH_URL: 'https://www.strava.com/oauth/authorize',
    // Use the direct Strava URL for local dev, and our secure proxy for production
    TOKEN_URL: isLocal ? 'https://www.strava.com/oauth/token' : '/api/token',
    API_URL: 'https://www.strava.com/api/v3',
    // Local secret for development only. In production, this is ignored.
    CLIENT_SECRET: isLocal ? '71697e56128eee5e66ae04958451894805ee722d' : null
};
