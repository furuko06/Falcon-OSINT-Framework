function formatValue(value) {
    return value ?? "Unknown";
}

function createWidget(label, value, detail = "") {
    const widget = document.createElement("article");

    widget.className = "dashboard-widget";

    widget.innerHTML = `
        <span class="dashboard-widget-label">${label}</span>
        <strong class="dashboard-widget-value">${formatValue(value)}</strong>
        ${detail ? `<span class="dashboard-widget-detail">${detail}</span>` : ""}
    `;

    return widget;
}

export function renderDashboardWidgets(
    container,
    stats,
    favoritesCount,
    health
) {
    container.innerHTML = "";

    container.append(
        createWidget("Total Tools", stats.totalTools),
        createWidget("Total Categories", stats.totalCategories),
        createWidget("Total Countries", stats.totalCountries),
        createWidget("Favorites", favoritesCount),
        createWidget("Database Version", stats.databaseVersion),
        createWidget(
            "Health Alerts",
            health.count,
            health.label
        )
    );
}

export function updateDashboardWidgets(
    container,
    favoritesCount,
    health
) {
    const widgets =
        container.querySelectorAll(".dashboard-widget");
    const favoritesWidget = widgets[3];

    if (!favoritesWidget) {
        return;
    }

    const value =
        favoritesWidget.querySelector(".dashboard-widget-value");

    if (value) {
        value.textContent = favoritesCount;
    }

    const healthWidget = widgets[5];

    if (!healthWidget) {
        return;
    }

    const healthValue =
        healthWidget.querySelector(".dashboard-widget-value");
    const healthDetail =
        healthWidget.querySelector(".dashboard-widget-detail");

    if (healthValue) {
        healthValue.textContent = health.count;
    }

    if (healthDetail) {
        healthDetail.textContent = health.label;
    }
}
