/**
 * Stats Module - Data processing and insight generation
 */
export function processActivities(activities) {
    const stats = {
        totalDistance: 0,
        totalElevation: 0,
        totalKudos: 0,
        totalTime: 0,
        activityCount: activities.length,
        dayDistribution: [0, 0, 0, 0, 0, 0, 0], // Sun-Sat
        monthlyData: Array.from({ length: 12 }, (_, i) => ({
            name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            distance: 0,
            count: 0,
            worstActivity: null,
            roast: ""
        })),
        pbs: {
            longestRun: 0,
            biggestClimb: 0,
            fastestPace: null
        }
    };

    activities.forEach(act => {
        stats.totalDistance += act.distance;
        stats.totalElevation += act.total_elevation_gain;
        stats.totalKudos += (act.kudos_count || 0);
        stats.totalTime += act.moving_time;

        const date = new Date(act.start_date);
        stats.dayDistribution[date.getDay()]++;

        const month = date.getMonth();
        stats.monthlyData[month].distance += act.distance;
        stats.monthlyData[month].count += 1;

        // Track "roastable" activity (shortest distance/least effort)
        const currentWorst = stats.monthlyData[month].worstActivity;
        if (!currentWorst || act.distance < currentWorst.distance) {
            stats.monthlyData[month].worstActivity = act;
        }

        if (act.type === 'Run') {
            if (act.distance > stats.pbs.longestRun) {
                stats.pbs.longestRun = act.distance;
            }
            const pace = act.distance / act.moving_time;
            if (!stats.pbs.fastestPace || pace > stats.pbs.fastestPace.value) {
                stats.pbs.fastestPace = { value: pace, id: act.id };
            }
        }
        if (act.total_elevation_gain > stats.pbs.biggestClimb) {
            stats.pbs.biggestClimb = act.total_elevation_gain;
        }
    });

    // Weekly Rhythm Analysis
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const peakDayIndex = stats.dayDistribution.indexOf(Math.max(...stats.dayDistribution));
    stats.weeklyRhythm = {
        peakDay: days[peakDayIndex],
        personality: getWeeklyPersonality(stats.dayDistribution)
    };

    // Generate monthly roasts
    stats.monthlyData.forEach((m, i) => {
        if (m.worstActivity) {
            m.roast = generateMonthlyRoast(m.worstActivity, i);
        }
    });

    return stats;
}

function generateMonthlyRoast(act, monthIndex) {
    const distKm = (act.distance / 1000).toFixed(1);
    const monthRoasts = [
        `January: The month of broken resolutions. This ${distKm}km "run" lasted longer than your gym membership.`,
        `February: It's the shortest month, but you still found a way to make this ${distKm}km effort even shorter.`,
        `March: Spring is coming, but your fitness is still hibernating based on this ${distKm}km stroll.`,
        `April: April Fools! Oh wait, this ${distKm}km entry isn't a joke? My bad.`,
        `May: Flowers are blooming, but your pace is wilting. ${distKm}km? Pull yourself together.`,
        `June: Sun's out, but you're still indoors? This ${distKm}km shuffle is basically a glorified walk to the kitchen.`,
        `July: Too hot to run? This ${distKm}km effort suggests you spent more time looking for shade than moving.`,
        `August: The "Dog Days" of summer. Honestly, I've seen pugs with better endurance than this ${distKm}km trip.`,
        `September: Back to school? Clearly you need a lesson in distance. ${distKm}km is barely a warm-up.`,
        `October: Spooky season! What's scarier than a ghost? Your ${distKm}km split times.`,
        `November: Preparing for Turkey Day? You're already moving like a stuffed bird with this ${distKm}km crawl.`,
        `December: Holiday spirit! You gave yourself the gift of absolute laziness with this ${distKm}km "activity".`
    ];

    return monthRoasts[monthIndex] || `A whopping ${distKm}km? Did you just run to the mailbox and back?`;
}

function getWeeklyPersonality(distribution) {
    const weekdays = distribution.slice(1, 6).reduce((a, b) => a + b, 0);
    const weekends = distribution[0] + distribution[distribution.length - 1];

    if (weekends > weekdays) return "The Weekend Warrior";
    if (distribution.every(val => val > 0)) return "The Streak Machine";
    if (Math.max(...distribution) > distribution.reduce((a, b) => a + b, 0) / 2) return "One-Hit Wonder";
    return "The Consistent King/Queen";
}

export function generateInsights(stats) {
    const distKm = stats.totalDistance / 1000;
    const marathons = (distKm / 42.195).toFixed(1);
    const everests = (stats.totalElevation / 8848).toFixed(1);

    return {
        distance: distKm < 50 ? "You walked more to the fridge than you ran this year. Roast level: Burnt." : `That's about ${marathons} marathons. Your local coffee shop misses you.`,
        count: stats.activityCount < 10 ? "Ten activities? My grandmother does that on her way to church." : (stats.activityCount > 100 ? `Look at you, pro! Or just addicted to pressing start?` : `Quality over quantity, they say. Mostly quality.`),
        elevation: `You climbed ${everests} Everests. Your knees called, they're filing a restraining order.`,
        kudos: stats.totalKudos > 50 ? `The local legend treatment. Keep feeding that ego!` : `Ghosted by the Strava community? Maybe run faster.`
    };
}
