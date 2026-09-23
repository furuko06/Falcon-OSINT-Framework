/* ==========================================================
   Falcon Explorer Toolbar - E1 Explorer Pro
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
    "Verified",
    "Working",
    "Beta",
    "Deprecated",
    "Archived",
    "Broken"
];

export function renderToolbar(container) {
    container.innerHTML = `
        <div class="toolbar-row toolbar-primary">
            <div class="toolbar-search">
                <input
                    id="search-input"
                    type="search"
                    placeholder="Search tools, categories, countries..."
                    autocomplete="off"
                    aria-label="Search tools"
                />
            </div>

            <div class="toolbar-controls">
                <div class="toolbar-sort">
                    <label for="sort-select" class="sr-only">Sort by</label>
                    <select id="sort-select" aria-label="Sort by">
                        ${SORT_OPTIONS.map(opt =>
                            `<option value="${opt.value}">Sort: ${opt.label}</option>`
                        ).join("")}
                    </select>
                </div>

                <div class="toolbar-view-toggle" role="group" aria-label="View mode">
                    <button
                        id="view-grid"
                        class="view-btn"
                        data-view="grid"
                        title="Grid view"
                        aria-label="Grid view"
                        aria-pressed="false">
                        ▦
                    </button>
                    <button
                        id="view-list"
                        class="view-btn"
                        data-view="list"
                        title="List view"
                        aria-label="List view"
                        aria-pressed="false">
                        ☰
                    </button>
                </div>
            </div>
        </div>

        <div class="toolbar-row toolbar-filters">
            <select id="filter-category" aria-label="Filter by category">
                <option value="">All categories</option>
            </select>

            <select id="filter-country" aria-label="Filter by country">
                <option value="">All countries</option>
            </select>

            <select id="filter-health" aria-label="Filter by health status">
                <option value="">All health</option>
                ${HEALTH_OPTIONS.map(h =>
                    `<option value="${h}">${h}</option>`
                ).join("")}
            </select>

            <div class="filter-toggles">
                <label class="filter-chip">
                    <input type="checkbox" id="filter-offline">
                    <span>Offline</span>
                </label>

                <label class="filter-chip">
                    <input type="checkbox" id="filter-docker">
                    <span>Docker</span>
                </label>

                <label class="filter-chip">
                    <input type="checkbox" id="filter-api">
                    <span>API</span>
                </label>

                <label class="filter-chip">
                    <input type="checkbox" id="filter-vpn">
                    <span>VPN</span>
                </label>

                <label class="filter-chip">
                    <input type="checkbox" id="filter-tor">
                    <span>TOR</span>
                </label>

                <label class="filter-chip filter-chip-accent">
                    <input type="checkbox" id="filter-favorites">
                    <span>★ Favorites</span>
                </label>
            </div>

            <button id="clear-filters" class="btn-clear" aria-label="Clear all filters">
                ✕ Clear
            </button>

            <div id="toolbar-stats" class="toolbar-stats" aria-live="polite">
                0 Tools
            </div>
        </div>
    `;

    // --- Search ---
    const searchInput = container.querySelector("#search-input");
    searchInput.addEventListener("input", event => {
        updateState({ query: event.target.value });
        search(event.target.value);
    });

    // --- Sort ---
    const sortSelect = container.querySelector("#sort-select");
    sortSelect.value = ExplorerState.sort;
    sortSelect.addEventListener("change", event => {
        setSort(event.target.value);
        applyFilters();
    });

    // --- View Toggle ---
    bindViewToggle(container);
    syncViewToggle(container, ExplorerState.view);

    // --- Selects ---
    bindSelect(container, "#filter-category", value => ({
        categories: value ? [value] : []
    }));

    bindSelect(container, "#filter-country", value => ({
        countries: value ? [value] : []
    }));

    bindSelect(container, "#filter-health", value => ({
        health: value ? [value] : []
    }));

    // --- Checkboxes ---
    bindCheckbox(container, "#filter-offline", v => ({ offline: v }));
    bindCheckbox(container, "#filter-docker", v => ({ docker: v }));
    bindCheckbox(container, "#filter-api", v => ({ api: v }));
    bindCheckbox(container, "#filter-vpn", v => ({ vpn: v }));
    bindCheckbox(container, "#filter-tor", v => ({ tor: v }));
    bindCheckbox(container, "#filter-favorites", v => ({ favorites: v }));

    // --- Clear ---
    container
        .querySelector("#clear-filters")
        .addEventListener("click", () => {
            resetToolbarUI(container);
            clearFilters();
        });
}

/* ---------- View Toggle ---------- */

function bindViewToggle(container) {
    const buttons = container.querySelectorAll(".view-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const view = btn.dataset.view;
            setView(view);
            syncViewToggle(container, view);
        });
    });
}

function syncViewToggle(container, activeView) {
    container.querySelectorAll(".view-btn").forEach(btn => {
        const isActive = btn.dataset.view === activeView;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
    });
}

/* ---------- Filter Binding Helpers ---------- */

function bindSelect(container, selector, patchFn) {
    const el = container.querySelector(selector);
    if (!el) return;
    el.addEventListener("change", event => {
        applyFilters(patchFn(event.target.value));
    });
}

function bindCheckbox(container, selector, patchFn) {
    const el = container.querySelector(selector);
    if (!el) return;
    el.addEventListener("change", event => {
        applyFilters(patchFn(event.target.checked));
    });
}

function resetToolbarUI(container) {
    container.querySelector("#search-input").value = "";
    container.querySelector("#filter-category").value = "";
    container.querySelector("#filter-country").value = "";
    container.querySelector("#filter-health").value = "";
    container.querySelector("#filter-offline").checked = false;
    container.querySelector("#filter-docker").checked = false;
    container.querySelector("#filter-api").checked = false;
    container.querySelector("#filter-vpn").checked = false;
    container.querySelector("#filter-tor").checked = false;
    container.querySelector("#filter-favorites").checked = false;
}

/* ---------- Populate Filter Options ---------- */

export function populateFilterOptions(container, tools) {
    const categorySelect = container.querySelector("#filter-category");
    const countrySelect = container.querySelector("#filter-country");

    const categories = [
        ...new Set(tools.map(t => t.category).filter(Boolean))
    ].sort();

    const countries = [
        ...new Set(tools.map(t => t.country).filter(Boolean))
    ].sort();

    categorySelect.innerHTML =
        `<option value="">All categories (${categories.length})</option>` +
        categories.map(c => `<option value="${c}">${c}</option>`).join("");

    countrySelect.innerHTML =
        `<option value="">All countries (${countries.length})</option>` +
        countries.map(c => `<option value="${c}">${c}</option>`).join("");
}

/* ---------- Stats ---------- */

export function renderStats(container, stats) {
    const el = container.querySelector("#toolbar-stats") || container;
    el.innerHTML = `
        <span><strong>${stats.tools}</strong> Tools</span>
        <span><strong>${stats.categories}</strong> Categories</span>
        <span><strong>${stats.countries}</strong> Countries</span>
        <span><strong>${stats.favorites}</strong> Favorites</span>
        ${stats.offline ? `<span><strong>${stats.offline}</strong> Offline</span>` : ""}
    `;
}