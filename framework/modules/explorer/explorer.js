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
import { renderAssistantPanel } from "../assistant/panel.js";
import { completeAuth, hasAuthCallback } from "../assistant/openrouter.js";
import { renderSettingsPanel } from "../settings/panel.js";
import { renderPrivacyPanel } from "../privacy/panel.js";
import { applyFilters } from "./filters.js";

export async function initializeExplorer() {
    const sidebar = document.getElementById("sidebar");
    const toolbar = document.getElementById("toolbar");
    const cards = document.getElementById("cards");

    const healthView = document.createElement("section");
    healthView.id = "health-view";
    healthView.hidden = true;
    cards.before(healthView);

    const views = {
        health: renderHealthPanel,
        playbooks: renderPlaybooksPanel,
        graph: renderGraphPanel,
        ioc: renderIOCPanel,
        academy: renderAcademyPanel,
        assistant: renderAssistantPanel,
        settings: renderSettingsPanel,
        privacy: renderPrivacyPanel
    };

    const dashboard = createDashboardSection();
    toolbar.before(dashboard);

    const showPanel = name => {
        if (name) views[name](healthView);
        healthView.hidden = !name;
        cards.hidden = Boolean(name);
        dashboard.hidden = Boolean(name);
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

    if (hasAuthCallback()) {
        try {
            await completeAuth();
        } catch {
            // completeAuth stores a one-shot message that the assistant shows.
        }
        history.replaceState({}, "", `${location.pathname}${location.hash}`);
        showPanel("assistant");
    }
}