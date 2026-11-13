/* ==========================================================
   Falcon Explorer Sidebar - E1 (categorías clickeables + footer)
   ========================================================== */
import { ExplorerState } from "./state.js";
import { applyFilters } from "./filters.js";

function countByCategory(tools) {
    const map = {};
    for (const t of tools) {
        if (t.category) map[t.category] = (map[t.category] || 0) + 1;
    }
    return map;
}

export function renderSidebar(container, state = ExplorerState) {
    const counts = countByCategory(state.tools);
    const active = state.filters.categories || [];
    const favActive = !!state.filters.favorites;

    container.innerHTML = `
        <div class="sidebar-section">
            <h3>Workspace</h3>
            <button class="sidebar-item ${favActive ? "active" : ""}" data-action="favorites" aria-pressed="${favActive}">
                <span>★ Favorites</span>
                <span class="count">${state.favorites.size}</span>
            </button>
        </div>
        <div class="sidebar-section">
            <h3>Categories</h3>
            ${Object.keys(counts).sort().map(cat => `
                <button class="sidebar-item ${active.includes(cat) ? "active" : ""}"
                    data-category="${cat}" aria-pressed="${active.includes(cat)}">
                    <span>${cat}</span>
                    <span class="count">${counts[cat]}</span>
                </button>`).join("")}
        </div>
        <div id="collections-host"></div>
        <div class="sidebar-footer">
            <span>Falcon v0.1-alpha</span>
            <span>SQLite: ${state.initialized ? "Loaded ✓" : "Loading…"}</span>
        </div>
    `;

    container.querySelector('[data-action="favorites"]').addEventListener("click", () => {
        applyFilters({ favorites: !favActive });
    });

    container.querySelectorAll("[data-category]").forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.dataset.category;
            applyFilters({ categories: active.includes(cat) ? [] : [cat] });
        });
    });
}