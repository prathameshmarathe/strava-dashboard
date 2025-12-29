/**
 * UI Module - Handles DOM manipulation and Dashboard rendering
 */
import { generateInsights } from './stats.js';

export function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
}

export function updateStatus(text) {
    const statusEl = document.getElementById('loading-status');
    if (statusEl) statusEl.innerText = text;
}

export function renderDashboard(stats, onStoryStart) {
    const insights = generateInsights(stats);

    document.getElementById('total-distance').innerHTML = `${(stats.totalDistance / 1000).toFixed(1)} <span class="unit">km</span>`;
    document.getElementById('dist-insight').innerText = insights.distance;

    document.getElementById('total-activities').innerText = stats.activityCount;
    document.getElementById('count-insight').innerText = insights.count;

    document.getElementById('total-elevation').innerHTML = `${Math.round(stats.totalElevation)} <span class="unit">m</span>`;
    document.getElementById('elev-insight').innerText = insights.elevation;

    document.getElementById('total-kudos').innerText = stats.totalKudos;
    document.getElementById('kudos-insight').innerText = insights.kudos;

    const maxMonth = stats.monthlyData.reduce((prev, current) => (prev.distance > current.distance) ? prev : current);
    document.getElementById('most-active-month').innerText = maxMonth.name;

    const hours = Math.floor(stats.totalTime / 3600);
    const mins = Math.floor((stats.totalTime % 3600) / 60);
    document.getElementById('total-time').innerText = `${hours}h ${mins}m`;

    renderPBs(stats.pbs, stats.totalDistance, stats.activityCount);
    renderMonthlyGrid(stats.monthlyData);
    renderWeeklyChart(stats.dayDistribution, stats.weeklyRhythm);

    if (onStoryStart) onStoryStart();
    lucide.createIcons();
}

function renderPBs(pbs, totalDist, count) {
    const pbList = document.getElementById('pb-list');
    let fastestPaceStr = 'N/A';
    if (pbs.fastestPace) {
        const paceSecs = 1000 / pbs.fastestPace.value;
        const pMins = Math.floor(paceSecs / 60);
        const pSecs = Math.round(paceSecs % 60);
        fastestPaceStr = `${pMins}:${pSecs.toString().padStart(2, '0')} /km`;
    }

    pbList.innerHTML = `
        <li class="pb-item"><span class="pb-name">Longest Run</span><span class="pb-value">${(pbs.longestRun / 1000).toFixed(2)} km</span></li>
        <li class="pb-item"><span class="pb-name">Fastest Pace (Avg)</span><span class="pb-value">${fastestPaceStr}</span></li>
        <li class="pb-item"><span class="pb-name">Vertical Ascent</span><span class="pb-value">${Math.round(pbs.biggestClimb)} m</span></li>
        <li class="pb-item"><span class="pb-name">Avg Distance</span><span class="pb-value">${((totalDist / count) / 1000).toFixed(1)} km</span></li>
    `;
}

function renderMonthlyGrid(monthlyData) {
    const grid = document.getElementById('monthly-grid');
    grid.innerHTML = '';
    monthlyData.forEach((data, index) => {
        const card = document.createElement('div');
        card.className = 'month-card fade-in';
        card.style.animationDelay = `${0.1 * index}s`;
        card.innerHTML = `
            <div class="m-left">
                <span class="m-name">${data.name}</span>
                <span class="m-dist">${(data.distance / 1000).toFixed(1)}<small style="font-size:0.6em; color:var(--text-dim); margin-left:2px;">km</small></span>
                <span class="m-count">${data.count} activities</span>
            </div>
            <div class="m-roast">
                <i data-lucide="flame" style="width:14px; height:14px; color:#ff4d4d; margin-right:6px;"></i>
                <span>${data.roast || "No activities to roast. Slacker."}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderWeeklyChart(dayDistribution, rhythm) {
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    const insightEl = document.getElementById('weekly-insight');

    if (insightEl && rhythm) {
        insightEl.innerHTML = `<i data-lucide="zap" style="width:16px;height:16px;vertical-align:middle;margin-right:8px;"></i>${rhythm.personality}: Your peak day is <strong style="color:var(--accent)">${rhythm.peakDay}</strong>`;
        lucide.createIcons();
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(252, 76, 2, 0.4)');
    gradient.addColorStop(1, 'rgba(252, 76, 2, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [{
                label: 'Activities',
                data: dayDistribution,
                borderColor: '#fc4c02',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fc4c02',
                pointBorderColor: '#fff',
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { display: false, beginAtZero: true },
                x: {
                    grid: { display: false },
                    ticks: { color: '#a0a0a0', font: { family: 'Outfit', weight: '600' } }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { family: 'Outfit' },
                    bodyFont: { family: 'Outfit' },
                    padding: 12,
                    displayColors: false
                }
            }
        }
    });
}

export function initShareStudio() {
    document.getElementById('share-btn')?.addEventListener('click', () => {
        renderShareCard();
        document.getElementById('share-modal').classList.add('active');
    });

    document.querySelector('.close-modal')?.addEventListener('click', () => {
        document.getElementById('share-modal').classList.remove('active');
    });

    document.getElementById('download-share-btn')?.addEventListener('click', async () => {
        const card = document.getElementById('share-card-preview');
        const canvas = await html2canvas(card, { backgroundColor: '#0f0f12', scale: 2 });
        const link = document.createElement('a');
        link.download = 'Strava-2025-Review.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function renderShareCard() {
    const preview = document.getElementById('share-card-preview');
    const dist = document.getElementById('total-distance').innerText;
    const count = document.getElementById('total-activities').innerText;
    const elev = document.getElementById('total-elevation').innerText;
    const time = document.getElementById('total-time').innerText;

    preview.innerHTML = `
        <div style="background: linear-gradient(135deg, #fc4c02 0%, #ff8c00 100%); padding: 2rem; border-radius: 12px; color: white;">
            <h4 style="margin: 0 0 1.5rem 0; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px;">Strava 2025 Review</h4>
            <div class="share-stat" style="margin-bottom: 1rem;">
                <label style="display: block; font-size: 0.8rem; opacity: 0.8;">Total Distance</label>
                <div class="val" style="font-size: 2.5rem; font-weight: 800;">${dist}</div>
            </div>
            <div class="share-stat" style="margin-bottom: 1rem;">
                <label style="display: block; font-size: 0.8rem; opacity: 0.8;">Activities</label>
                <div class="val" style="font-size: 2rem; font-weight: 800;">${count}</div>
            </div>
            <div style="display: flex; gap: 2rem;">
                <div class="share-stat">
                    <label style="display: block; font-size: 0.7rem; opacity: 0.8;">Elevation</label>
                    <div class="val" style="font-size: 1.2rem; font-weight: 800;">${elev}</div>
                </div>
                <div class="share-stat">
                    <label style="display: block; font-size: 0.7rem; opacity: 0.8;">Time</label>
                    <div class="val" style="font-size: 1.2rem; font-weight: 800;">${time}</div>
                </div>
            </div>
            <div style="margin-top: 2rem; font-size: 0.7rem; font-weight: 800; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 1rem; text-align: center;">
                STRΛVΛ // YEAR IN MOTION
            </div>
        </div>
    `;
}
