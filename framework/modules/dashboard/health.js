const WATCHED_STATUSES = new Set([
    "deprecated",
    "broken",
    "archived",
    "beta"
]);

export function getHealthAlerts(tools = []) {
    const counts = new Map();

    for (const tool of tools) {
        const status = String(tool.status || "").toLowerCase();

        if (WATCHED_STATUSES.has(status)) {
            counts.set(
                status,
                (counts.get(status) || 0) + 1
            );
        }
    }

    const count = [...counts.values()]
        .reduce((total, value) => total + value, 0);
    const detail = [...counts.entries()]
        .map(([status, value]) => `${value} ${status}`)
        .join(", ");

    return {
        count,
        label: count ? detail : "No watched statuses",
        detail
    };
}
