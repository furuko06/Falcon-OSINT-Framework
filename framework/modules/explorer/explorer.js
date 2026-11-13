/* ==========================================================
   Falcon Explorer Bootstrap - E1 Explorer Pro
   ========================================================== */
import { ExplorerState, subscribe, updateState } from "./state.js";
import { loadTools, search } from "./search.js";
import { renderToolbar, populateFilterOptions, renderStats } from "./toolbar.js";
import { renderCards } from "./cards.js";
import { renderSidebar } from "./sidebar.js";
import { createDashboardSection } from "../dashboard/layout.js";
import { initializeDashboard } from "../dashboard/dashboard.js";
import { renderCollectionsPanel } from "../collections/panel.js";
import { subscribeCollections } from "../collections/collections.js";

export async function initializeExplorer() {
    const sidebar = document.getElementById("sidebar");
    const toolbar = document.getElementById("toolbar");
    const cards = document.getElementById("cards");

    const dashboard = createDashboardSection();
    toolbar.before(dashboard);

    renderToolbar(toolbar);
    await initializeDashboard(dashboard);

    const renderCollections = () => {
        const host = sidebar.querySelector("#collections-host");
        if (host) renderCollectionsPanel(host);
    };

    subscribe(state => {
        renderSidebar(sidebar, state);
        renderCollections();
        renderCards(cards, state.results);
        renderStats(
            toolbar.querySelector("#toolbar-stats"),
            state.stats,
            state.results.length
        );
    });

    subscribeCollections(() => {
        renderCollections();
        renderCards(cards, ExplorerState.results);
    });

    const tools = await loadTools();
    updateState({ initialized: true });
    populateFilterOptions(toolbar, tools);
}