function formatValue(value) {
    return value ?? "Unknown";
}

function createWidget(label, value, detail = "", key = "") {
    const widget = document.createElement("article");

    widget.className = "dashboard-widget";
    if (key) widget.dataset.widget = key;

    widget.innerHTML = `
        <span class="dashboard-widget-label">${label}</span>
        <strong class="dashboard-widget-value">${formatValue(value)}</strong>
        ${detail ? `<span class="dashboard-widget-detail">${detail}</span>` : ""}
    `;

    return widget;
}

function setWidget(container, key, value, detail) {
    const widget = container.querySelector(`[data-widget="${key}"]`);
    if (!widget) return;

    const valueEl = widget.querySelector(".dashboard-widget-value");
    if (valueEl) valueEl.textContent = formatValue(value);

    const detailEl = widget.querySelector(".dashboard-widget-detail");
    if (detailEl && detail !== undefined) detailEl.textContent = detail;
}

export function renderDashboardWidgets(
    container,
    stats,
    favoritesCount,
    health
) {
    container.innerHTML = "";

    container.append(
        createWidget("Total Tools", stats.totalTools, "", "total"),
        createWidget("Total Categories", stats.totalCategories, "", "categories"),
        createWidget("Total Countries", stats.totalCountries, "", "countries"),
        createWidget("Favorites", favoritesCount, "", "favorites"),
        createWidget("Offline Ready", stats.offline, "", "offline"),
        createWidget("APIs", stats.api, "", "api"),
        createWidget("Docker", stats.docker, "", "docker"),
        createWidget("Database Version", stats.databaseVersion, "", "db-version")
    );

    container.append(
        createWidget("Recently Verified", health.recentlyVerified, "last 30 days", "recent"),
        createWidget("Broken Tools", health.broken, "status: broken", "broken"),
        createWidget("Deprecated", health.deprecated, "status: deprecated", "deprecated"),
        createWidget("Community Health", health.communityHealth, health.communityDetail, "community")
    );
}

export function updateDashboardWidgets(
    container,
    favoritesCount,
    health
) {
    setWidget(container, "favorites", favoritesCount);
    setWidget(container, "recent", health.recentlyVerified, "last 30 days");
    setWidget(container, "broken", health.broken, "status: broken");
    setWidget(container, "deprecated", health.deprecated, "status: deprecated");
    setWidget(container, "community", health.communityHealth, health.communityDetail);
}
