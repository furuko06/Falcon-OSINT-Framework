const RECENT_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

function isRecent(value, now) {
    if (!value) return false;
    const time = Date.parse(value);
    if (Number.isNaN(time)) return false;
    return now - time <= RECENT_DAYS * DAY_MS && time <= now;
}

export function getHealthAlerts(tools = [], now = Date.now()) {
    let recentlyVerified = 0;
    let broken = 0;
    let deprecated = 0;
    const statusCounts = new Map();

    for (const tool of tools) {
        const status = String(tool.status || "").toLowerCase();

        if (isRecent(tool.last_verified, now)) recentlyVerified++;
        if (status === "broken") broken++;
        if (status === "deprecated") deprecated++;
        if (status) statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    }

    const total = tools.length;
    const verifiedCount = statusCounts.get("verified") || 0;
    const communityHealth = total ? Math.round((verifiedCount / total) * 100) : 0;

    return {
        recentlyVerified,
        broken,
        deprecated,
        communityHealth: `${communityHealth}%`,
        communityDetail: `${verifiedCount} of ${total} verified`,
        count: broken + deprecated,
        label: `${broken} broken, ${deprecated} deprecated`
    };
}
