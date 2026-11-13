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
import { renderPlaybooksPanel } from "../playbooks/panel.js";
import { renderGraphPanel } from "../graph/panel.js";
import { renderIOCPanel } from "../ioc/panel.js";
import { renderAcademyPanel } from "../academy/panel.js";
import { applyFilters } from "./filters.js";

export async function initializeExplorer() {
    const sidebar = document.getElementById("sidebar");
    const toolbar = document.getElementById("toolbar");
    const cards = document.getElementById("cards");

    const healthView = document.createElement("section");
    healthView.id = "health-view";
    healthView.style.display = "none";
    cards.before(healthView);

    const views = {
        health: renderHealthPanel,
        playbooks: renderPlaybooksPanel,
        graph: renderGraphPanel,
        ioc: renderIOCPanel,
        academy: renderAcademyPanel
    };

    const dashboard = createDashboardSection();
    toolbar.before(dashboard);

    const showPanel = name => {
        if (name) views[name](healthView);
        healthView.style.display = name ? "" : "none";
        cards.style.display = name ? "none" : "";
        dashboard.style.display = name ? "none" : "";
        updateState({ panel: name || null });
        if (name) {
            healthView.scrollIntoView({ block: "start", behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    sidebar.addEventListener("click", e => {
        const btn = e.target.closest("[data-action]");
        if (btn) {
            const action = btn.dataset.action;
            if (action === "home") return showPanel(null);
            if (views[action]) return showPanel(ExplorerState.panel === action ? null : action);
            if (action === "favorites") return showPanel(null);
            return;
        }
        if (e.target.closest("[data-category]")) showPanel(null);
    });

    sidebar.addEventListener("change", e => {
        if (e.target.closest("#country-select")) showPanel(null);
    });

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