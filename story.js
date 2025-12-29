/**
 * Story Module - Cinematic presentation logic
 */
import { generateInsights } from './stats.js';

const storyState = {
    currentSlide: 0,
    slides: [],
    timer: null,
    slideDuration: 3000
};

export function startStory(stats, onFinish) {
    storyState.currentSlide = 0;
    const insights = generateInsights(stats);
    const maxMonth = stats.monthlyData.reduce((prev, current) => (prev.distance > current.distance) ? prev : current);

    storyState.slides = [
        {
            type: 'intro',
            icon: 'sparkles',
            color: '#fc4c02',
            content: `
                <h2>2025</h2>
                <div class="big-value">Ready?</div>
                <div class="sub-text">Let's relive your journey.</div>
            `
        },
        {
            type: 'stat',
            icon: 'activity',
            color: '#4f46e5',
            content: `
                <h2>Distance</h2>
                <div class="big-value">${(stats.totalDistance / 1000).toFixed(1)} <span style="font-size:0.4em">km</span></div>
                <div class="story-insight">"${insights.distance}"</div>
            `
        },
        {
            type: 'stat',
            icon: 'run',
            color: '#06b6d4',
            content: `
                <h2>Commitment</h2>
                <div class="big-value">${stats.activityCount}</div>
                <div class="sub-text">Activities logged</div>
                <div class="story-insight">"${insights.count}"</div>
            `
        },
        {
            type: 'stat',
            icon: 'mountain',
            color: '#8b5cf6',
            content: `
                <h2>Vertical</h2>
                <div class="big-value">${Math.round(stats.totalElevation)} <span style="font-size:0.4em">m</span></div>
                <div class="story-insight">"${insights.elevation}"</div>
            `
        },
        {
            type: 'stat',
            icon: 'thumbs-up',
            color: '#ec4899',
            content: `
                <h2>Community</h2>
                <div class="big-value">${stats.totalKudos}</div>
                <div class="sub-text">Kudos received</div>
                <div class="story-insight">"${insights.kudos}"</div>
            `
        },
        {
            type: 'highlight',
            icon: 'trophy',
            color: '#fc4c02',
            content: `
                <h2>Peak Performance</h2>
                <div class="big-value">${maxMonth.name}</div>
                <div class="sub-text">Your most active month</div>
                <div class="summary-grid-small">
                    <div class="summary-item-sm">
                        <label>Distance</label>
                        <div>${(maxMonth.distance / 1000).toFixed(1)} km</div>
                    </div>
                    <div class="summary-item-sm">
                        <label>Activities</label>
                        <div>${maxMonth.count}</div>
                    </div>
                </div>
            `
        }
    ];

    renderStory();
    updateBackground(0);
    startSlideTimer(onFinish);

    // Global navigation hooks
    window.nextSlide = () => nextSlide(onFinish);
    window.prevSlide = () => prevSlide();
}

function renderStory() {
    const container = document.getElementById('story-container');
    const progress = document.querySelector('.story-progress');

    container.innerHTML = storyState.slides.map((slide, i) => `
        <div class="story-slide ${i === 0 ? 'active' : ''}" id="slide-${i}">
            <i data-lucide="${slide.icon}" class="ghost-icon"></i>
            ${slide.content}
        </div>
    `).join('');

    progress.innerHTML = storyState.slides.map((_, i) => `
        <div class="progress-bar ${i < storyState.currentSlide ? 'completed' : ''}" id="bar-${i}">
            <div class="progress-fill"></div>
        </div>
    `).join('');

    lucide.createIcons();
}

function updateBackground(slideIndex) {
    const color = storyState.slides[slideIndex].color;
    const blob1 = document.querySelector('.blob-1');
    const blob2 = document.querySelector('.blob-2');

    if (blob1) blob1.style.background = color;
    if (blob2) blob2.style.background = slideIndex % 2 === 0 ? '#4f46e5' : '#06b6d4';
}

function startSlideTimer(onFinish) {
    if (storyState.timer) clearInterval(storyState.timer);

    const startTime = Date.now();
    const barFill = document.querySelector(`#bar-${storyState.currentSlide} .progress-fill`);

    storyState.timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed / storyState.slideDuration) * 100;

        if (barFill) barFill.style.width = `min(${progress}%, 100%)`;

        if (elapsed >= storyState.slideDuration) {
            nextSlide(onFinish);
        }
    }, 100);
}

function nextSlide(onFinish) {
    if (storyState.currentSlide < storyState.slides.length - 1) {
        document.getElementById(`slide-${storyState.currentSlide}`).classList.remove('active');
        document.getElementById(`slide-${storyState.currentSlide}`).classList.add('exit');

        document.getElementById(`bar-${storyState.currentSlide}`).classList.add('completed');
        document.querySelector(`#bar-${storyState.currentSlide} .progress-fill`).style.width = '100%';

        storyState.currentSlide++;
        updateBackground(storyState.currentSlide);
        document.getElementById(`slide-${storyState.currentSlide}`).classList.add('active');
        startSlideTimer(onFinish);
    } else {
        clearInterval(storyState.timer);
        if (onFinish) onFinish();
    }
}

function prevSlide() {
    if (storyState.currentSlide > 0) {
        document.getElementById(`slide-${storyState.currentSlide}`).classList.remove('active');

        document.getElementById(`bar-${storyState.currentSlide}`).classList.remove('completed');
        document.querySelector(`#bar-${storyState.currentSlide} .progress-fill`).style.width = '0%';

        storyState.currentSlide--;
        updateBackground(storyState.currentSlide);
        document.getElementById(`slide-${storyState.currentSlide}`).classList.remove('exit');
        document.getElementById(`slide-${storyState.currentSlide}`).classList.add('active');
        startSlideTimer();
    }
}

export function stopStory() {
    clearInterval(storyState.timer);
}
