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
import { renderMarketplacePanel } from "../plugins/panel.js";
import { getCountry } from "../countries/packs.js";
import { renderHealthPanel } from "../health/panel.js";
import { applyFilters } from "./filters.js";

export async function initializeExplorer() {
    const sidebar = document.getElementById("sidebar");
    const toolbar = document.getElementById("toolbar");
    const cards = document.getElementById("cards");

    const healthView = document.createElement("section");
    healthView.id = "health-view";
    healthView.style.display = "none";
    cards.before(healthView);

    sidebar.addEventListener("click", e => {
        const btn = e.target.closest('[data-action="health"]');
        if (!btn) return;
        const open = healthView.style.display === "none";
        healthView.style.display = open ? "" : "none";
        cards.style.display = open ? "none" : "";
        if (open) renderHealthPanel(healthView);
    });

    const dashboard = createDashboardSection();
    toolbar.before(dashboard);

    renderToolbar(toolbar);
    await initializeDashboard(dashboard);

    const renderCollections = () => {
        const host = sidebar.querySelector("#collections-host");
        if (host) renderCollectionsPanel(host);
        const market = sidebar.querySelector("#marketplace-host");
        if (market) renderMarketplacePanel(market);
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
    const chosen = localStorage.getItem("falcon:country");
    if (chosen && chosen !== "GLOBAL") applyFilters({ countries: [chosen] });
}