/**
 * API Module - Handles all communication with Strava API
 */
import { CONFIG } from './config.js';

export async function fetchActivities(accessToken, startOfYear, endOfYear, onProgress) {
    let allActivities = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        if (onProgress) onProgress(page);

        const response = await fetch(`${CONFIG.API_URL}/athlete/activities?after=${startOfYear}&before=${endOfYear}&per_page=200&page=${page}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const data = await response.json();

        if (!Array.isArray(data)) {
            if (data.errors || data.message) {
                throw new Error(data.message || JSON.stringify(data.errors));
            }
            hasMore = false;
        } else if (data.length === 0) {
            hasMore = false;
        } else {
            allActivities = [...allActivities, ...data];
            page++;
        }
    }

    return allActivities;
}

export async function exchangeToken(code) {
    const isLocalToken = CONFIG.TOKEN_URL.startsWith('http');
    const body = {
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: CONFIG.REDIRECT_URI
    };

    if (CONFIG.CLIENT_SECRET) {
        body.client_id = CONFIG.CLIENT_ID;
        body.client_secret = CONFIG.CLIENT_SECRET;
    }

    const response = await fetch(CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': isLocalToken ? 'application/x-www-form-urlencoded' : 'application/json'
        },
        body: isLocalToken ? new URLSearchParams(body) : JSON.stringify(body)
    });
    return await response.json();
}

export async function refreshToken(token) {
    const isLocalToken = CONFIG.TOKEN_URL.startsWith('http');
    const body = {
        refresh_token: token,
        grant_type: 'refresh_token'
    };

    if (CONFIG.CLIENT_SECRET) {
        body.client_id = CONFIG.CLIENT_ID;
        body.client_secret = CONFIG.CLIENT_SECRET;
    }

    const response = await fetch(CONFIG.TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': isLocalToken ? 'application/x-www-form-urlencoded' : 'application/json'
        },
        body: isLocalToken ? new URLSearchParams(body) : JSON.stringify(body)
    });
    return await response.json();
}
