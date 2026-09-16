import { ExplorerState, subscribe } from "../explorer/state.js";
import { getHealthAlerts } from "./health.js";
import { getDashboardGrid } from "./layout.js";
import { loadDashboardStats } from "./stats.js";
import {
    renderDashboardWidgets,
    updateDashboardWidgets
} from "./widgets.js";

export async function initializeDashboard(container) {
    const grid = getDashboardGrid(container);
    const stats = await loadDashboardStats();
    const health = getHealthAlerts(ExplorerState.tools);

    renderDashboardWidgets(
        grid,
        stats,
        ExplorerState.favorites.size,
        health
    );

    subscribe(state => {
        updateDashboardWidgets(
            grid,
            state.favorites.size,
            getHealthAlerts(state.tools)
        );
    });
}
