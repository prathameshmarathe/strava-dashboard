/**
 * App Module - Orchestrator
 */
import { Session, redirectToStrava, handleCallback, refreshSession } from './auth.js';
import { fetchActivities } from './api.js';
import { processActivities } from './stats.js';
import { startStory, stopStory } from './story.js';
import { showView, updateStatus, renderDashboard, initShareStudio } from './ui.js';

const state = {
    session: Session.get(),
    activities: []
};

// Initial setup
initShareStudio();

document.getElementById('connect-btn').addEventListener('click', redirectToStrava);
document.getElementById('demo-btn').addEventListener('click', loadDemoData);
document.getElementById('logout-btn').addEventListener('click', () => {
    Session.clear();
    window.location.href = window.location.origin + window.location.pathname;
});
document.getElementById('skip-story').addEventListener('click', () => {
    stopStory();
    showView('dashboard');
});

async function initializeApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');

    if (authCode || state.session.accessToken) {
        showView('loading');
    } else {
        showView('landing');
    }

    if (authCode) {
        try {
            state.session = await handleCallback(authCode);
            startDataFlow();
        } catch (err) {
            handleError('Authentication failed: ' + err.message);
        }
    } else if (state.session.accessToken) {
        if (Session.isExpired(state.session.expiresAt) && state.session.refreshToken) {
            try {
                state.session = await refreshSession(state.session.refreshToken);
                startDataFlow();
            } catch (err) {
                handleError('Session expired. Please connect again.');
            }
        } else {
            startDataFlow();
        }
    }
}

async function startDataFlow() {
    try {
        const startOfYear = new Date('2025-01-01').getTime() / 1000;
        const endOfYear = new Date('2026-01-01').getTime() / 1000;

        state.activities = await fetchActivities(
            state.session.accessToken,
            startOfYear,
            endOfYear,
            (page) => updateStatus(`Downloading activities (Page ${page})...`)
        );

        const stats = processActivities(state.activities);
        renderDashboard(stats, () => {
            showView('story-view');
            startStory(stats, () => showView('dashboard'));
        });

    } catch (err) {
        handleError('Data error: ' + err.message);
    }
}

function loadDemoData() {
    showView('loading');
    updateStatus('Generating demo year...');
    setTimeout(() => {
        const mockActivities = [
            { id: 1, type: 'Run', distance: 12000, total_elevation_gain: 150, moving_time: 3600, kudos_count: 5, start_date: '2025-01-10T10:00:00Z' },
            { id: 2, type: 'Run', distance: 5000, total_elevation_gain: 50, moving_time: 1500, kudos_count: 2, start_date: '2025-02-12T10:00:00Z' },
            { id: 3, type: 'Run', distance: 21000, total_elevation_gain: 300, moving_time: 7200, kudos_count: 12, start_date: '2025-03-15T10:00:00Z' },
            { id: 4, type: 'Ride', distance: 50000, total_elevation_gain: 800, moving_time: 7200, kudos_count: 8, start_date: '2025-04-20T10:00:00Z' },
            { id: 12, type: 'Run', distance: 14000, total_elevation_gain: 180, moving_time: 4200, kudos_count: 11, start_date: '2025-12-05T10:00:00Z' },
        ];
        const stats = processActivities(mockActivities);
        renderDashboard(stats, () => {
            showView('story-view');
            startStory(stats, () => showView('dashboard'));
        });
    }, 1500);
}

function handleError(msg) {
    Session.clear();
    alert(msg);
    showView('landing');
}

initializeApp();
