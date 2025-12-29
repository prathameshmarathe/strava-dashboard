/**
 * Auth Module - Handles session, persistence, and OAuth redirection
 */
import { CONFIG } from './config.js';
import * as API from './api.js';

export const Session = {
    get: () => ({
        accessToken: localStorage.getItem('strava_access_token'),
        refreshToken: localStorage.getItem('strava_refresh_token'),
        expiresAt: localStorage.getItem('strava_expires_at'),
    }),
    save: (data) => {
        localStorage.setItem('strava_access_token', data.access_token);
        localStorage.setItem('strava_refresh_token', data.refresh_token);
        localStorage.setItem('strava_expires_at', data.expires_at);
    },
    clear: () => {
        localStorage.clear();
    },
    isExpired: (expiresAt) => {
        const now = Math.floor(Date.now() / 1000);
        return expiresAt && now > (expiresAt - 300);
    }
};

export function redirectToStrava() {
    const scope = 'activity:read_all';
    const authUrl = `${CONFIG.AUTH_URL}?client_id=${CONFIG.CLIENT_ID}&redirect_uri=${CONFIG.REDIRECT_URI}&response_type=code&scope=${scope}`;
    window.location.href = authUrl;
}

export async function handleCallback(code) {
    const data = await API.exchangeToken(code);
    if (data.access_token) {
        Session.save(data);
        window.history.replaceState({}, document.title, window.location.pathname);
        return Session.get(); // Return unified object
    }
    throw new Error(data.message || 'Token exchange failed');
}

export async function refreshSession(refreshToken) {
    const data = await API.refreshToken(refreshToken);
    if (data.access_token) {
        Session.save(data);
        return Session.get(); // Return unified object
    }
    throw new Error('Refresh failed');
}
