/**
 * App Configuration
 * In a production environment, use environment variables or a serverless proxy.
 */
export const CONFIG = {
    CLIENT_ID: '192457',
    REDIRECT_URI: window.location.origin,
    AUTH_URL: 'https://www.strava.com/oauth/authorize',
    TOKEN_URL: '/api/token',
    API_URL: 'https://www.strava.com/api/v3'
};
