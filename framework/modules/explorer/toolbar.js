/* ==========================================================
   Falcon Explorer Toolbar - E1 Explorer Pro (v2.1)
   ========================================================== */
import { search } from "./search.js";
import { applyFilters, clearFilters } from "./filters.js";
import { ExplorerState, setView, setSort, updateState } from "./state.js";

const SORT_OPTIONS = [
    { value: "name", label: "Name" },
    { value: "quality", label: "Quality Score" },
    { value: "opsec", label: "OPSEC Score" },
    { value: "country", label: "Country" }
];

const HEALTH_OPTIONS = [
    { value: "verified", label: "Verified" },
    { value: "working", label: "Working" },
    { value: "beta", label: "Beta" },
    { value: "deprecated", label: "Deprecated" },
    { value: "archived", label: "Archived" },
    { value: "broken", label: "Broken" }
];

export function renderToolbar(container) {
    container.innerHTML = `
        <div class="toolbar-row toolbar-primary">
            <div class="toolbar-search">
                <input id="search-input" type="search"
                    placeholder="Search tools, categories, countries..."
                    autocomplete="off" aria-label="Search tools" />
            </div>
            <div class="toolbar-controls">
                <div class="toolbar-sort">
                    <select id="sort-select" aria-label="Sort by">
                        ${SORT_OPTIONS.map(o => `<option value="${o.value}">Sort: ${o.label}</option>`).join("")}
                    </select>
                </div>
                <div class="toolbar-view-toggle" role="group" aria-label="View mode">
                    <button class="view-btn" data-view="grid" title="Grid view" aria-pressed="false">▦</button>
                    <button class="view-btn" data-view="list" title="List view" aria-pressed="false">☰</button>
                </div>
            </div>
        </div>
        <div class="toolbar-row toolbar-filters">
            <select id="filter-category" aria-label="Filter by category"><option value="">All categories</option></select>
            <select id="filter-country" aria-label="Filter by country"><option value="">All countries</option></select>
            <select id="filter-health" aria-label="Filter by health status">
                <option value="">All health</option>
                ${HEALTH_OPTIONS.map(h => `<option value="${h.value}">${h.label}</option>`).join("")}
            </select>
            <div class="filter-toggles">
                <label class="filter-chip"><input type="checkbox" id="filter-offline"><span>Offline</span></label>
                <label class="filter-chip"><input type="checkbox" id="filter-docker"><span>Docker</span></label>
                <label class="filter-chip"><input type="checkbox" id="filter-api"><span>API</span></label>
                <label class="filter-chip"><input type="checkbox" id="filter-vpn"><span>VPN</span></label>
                <label class="filter-chip"><input type="checkbox" id="filter-tor"><span>TOR</span></label>
                <label class="filter-chip filter-chip-accent"><input type="checkbox" id="filter-favorites"><span>★ Favorites</span></label>
            </div>
            <button id="clear-filters" class="btn-clear">✕ Clear</button>
            <div id="toolbar-stats" class="toolbar-stats" aria-live="polite"></div>
        </div>
    `;

    container.querySelector("#search-input").addEventListener("input", e => {
        updateState({ query: e.target.value });
        search(e.target.value);
    });

    const sortSelect = container.querySelector("#sort-select");
    sortSelect.value = ExplorerState.sort;
    sortSelect.addEventListener("change", e => { setSort(e.target.value); applyFilters(); });

    syncViewToggle(container, ExplorerState.view);
    container.querySelectorAll(".view-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            setView(btn.dataset.view);
            syncViewToggle(container, btn.dataset.view);
        });
    });

    bindSelect(container, "#filter-category", v => ({ categories: v ? [v] : [] }));
    bindSelect(container, "#filter-country", v => ({ countries: v ? [v] : [] }));
    bindSelect(container, "#filter-health", v => ({ health: v ? [v] : [] }));
    bindCheckbox(container, "#filter-offline", v => ({ offline: v }));
    bindCheckbox(container, "#filter-docker", v => ({ docker: v }));
    bindCheckbox(container, "#filter-api", v => ({ api: v }));
    bindCheckbox(container, "#filter-vpn", v => ({ vpn: v }));
    bindCheckbox(container, "#filter-tor", v => ({ tor: v }));
    bindCheckbox(container, "#filter-favorites", v => ({ favorites: v }));

    container.querySelector("#clear-filters").addEventListener("click", () => {
        resetToolbarUI(container);
        clearFilters();
    });
}

function syncViewToggle(container, activeView) {
    container.querySelectorAll(".view-btn").forEach(btn => {
        const active = btn.dataset.view === activeView;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
    });
}

function bindSelect(container, sel, fn) {
    const el = container.querySelector(sel);
    if (el) el.addEventListener("change", e => applyFilters(fn(e.target.value)));
}

function bindCheckbox(container, sel, fn) {
    const el = container.querySelector(sel);
    if (el) el.addEventListener("change", e => applyFilters(fn(e.target.checked)));
}

function resetToolbarUI(container) {
    container.querySelector("#search-input").value = "";
    ["#filter-category", "#filter-country", "#filter-health"].forEach(s => container.querySelector(s).value = "");
    ["#filter-offline", "#filter-docker", "#filter-api", "#filter-vpn", "#filter-tor", "#filter-favorites"]
        .forEach(s => container.querySelector(s).checked = false);
}

export function populateFilterOptions(container, tools) {
    const categories = [...new Set(tools.map(t => t.category).filter(Boolean))].sort();
    const countries = [...new Set(tools.map(t => t.country).filter(Boolean))].sort();
    container.querySelector("#filter-category").innerHTML =
        `<option value="">All categories (${categories.length})</option>` +
        categories.map(c => `<option value="${c}">${c}</option>`).join("");
    container.querySelector("#filter-country").innerHTML =
        `<option value="">All countries (${countries.length})</option>` +
        countries.map(c => `<option value="${c}">${c}</option>`).join("");
}

export function renderStats(container, stats, resultsCount) {
    if (!container) return;
    const shown = typeof resultsCount === "number" ? resultsCount : stats.tools;
    container.innerHTML = `
        <span><strong>${shown}</strong>/${stats.tools} Tools</span>
        <span><strong>${stats.categories}</strong> Categories</span>
        <span><strong>${stats.countries}</strong> Countries</span>
        <span><strong>${stats.favorites}</strong> Favorites</span>
    `;
}