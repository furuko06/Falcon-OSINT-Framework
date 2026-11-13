/* ==========================================================
   Falcon Explorer Sidebar - E1 (categorías clickeables + footer)
   Los grupos con más de una opción se pliegan con un botón.
   ========================================================== */
import { ExplorerState } from "./state.js";
import { applyFilters } from "./filters.js";
import { COUNTRY_PACKS, getCountry, setCountry, countryToolCount } from "../countries/packs.js";
import { collapsibleGroup, bindCollapsibles } from "../../ui/collapse.js";

function countByCategory(tools) {
    const map = {};
    for (const t of tools) {
        if (t.category) map[t.category] = (map[t.category] || 0) + 1;
    }
    return map;
}

export function renderSidebar(container, state = ExplorerState) {
    const counts = countByCategory(state.tools);
    const categories = Object.keys(counts).sort();
    const active = state.filters.categories || [];
    const favActive = !!state.filters.favorites;
    const country = getCountry();

    const categoryItems = categories.map(cat => `
        <button class="sidebar-item ${active.includes(cat) ? "active" : ""}"
            data-category="${cat}" aria-pressed="${active.includes(cat)}">
            <span>${cat}</span>
            <span class="count">${counts[cat]}</span>
        </button>`).join("");

    container.innerHTML = `
        <div class="sidebar-section">
            ${collapsibleGroup({
                id: "workspace",
                title: "Workspace",
                body: `
                    <button class="sidebar-item ${!state.panel ? "active" : ""}" data-action="home" aria-pressed="${!state.panel}">
                        <span>⌂ Home</span>
                    </button>
                    <button class="sidebar-item ${favActive ? "active" : ""}" data-action="favorites" aria-pressed="${favActive}">
                        <span>★ Favorites</span>
                        <span class="count">${state.favorites.size}</span>
                    </button>`
            })}
        </div>
        <div class="sidebar-section">
            ${collapsibleGroup({
                id: "categories",
                title: "Categories",
                count: categories.length,
                defaultOpen: false,
                body: categoryItems
            })}
        </div>
        <div class="sidebar-section country-section">
            <h3>Country pack</h3>
            <select id="country-select" aria-label="País">
                ${COUNTRY_PACKS.map(p => `<option value="${p.code}" ${p.code === country ? "selected" : ""}>${p.flag ? p.flag + " " : ""}${p.name}</option>`).join("")}
            </select>
            <p class="collections-empty">${COUNTRY_PACKS.find(p => p.code === country).name}: ${countryToolCount(state.tools, country)} herramienta(s)</p>
        </div>
        <div id="collections-host"></div>
        <div id="marketplace-host"></div>
        <div class="sidebar-section">
            <h3>Salud</h3>
            <button class="sidebar-item ${state.panel === "health" ? "active" : ""}" data-action="health" aria-pressed="${state.panel === "health"}"><span>Health Engine</span></button>
        </div>
        <div class="sidebar-section">
            ${collapsibleGroup({
                id: "research",
                title: "Investigación",
                count: 3,
                body: `
                    <button class="sidebar-item ${state.panel === "playbooks" ? "active" : ""}" data-action="playbooks" aria-pressed="${state.panel === "playbooks"}"><span>Playbooks</span></button>
                    <button class="sidebar-item ${state.panel === "graph" ? "active" : ""}" data-action="graph" aria-pressed="${state.panel === "graph"}"><span>Knowledge Graph</span></button>
                    <button class="sidebar-item ${state.panel === "ioc" ? "active" : ""}" data-action="ioc" aria-pressed="${state.panel === "ioc"}"><span>IOC Workspace</span></button>`
            })}
        </div>
        <div class="sidebar-section">
            <h3>Formación</h3>
            <button class="sidebar-item ${state.panel === "academy" ? "active" : ""}" data-action="academy" aria-pressed="${state.panel === "academy"}"><span>Academy</span></button>
        </div>
        <div class="sidebar-footer">
            <span>Falcon v0.1-alpha</span>
            <span>SQLite: ${state.initialized ? "Loaded ✓" : "Loading…"}</span>
        </div>
    `;

    container.querySelector("#country-select").addEventListener("change", e => {
        setCountry(e.target.value);
        applyFilters({ countries: e.target.value === "GLOBAL" ? [] : [e.target.value] });
    });

    container.querySelector('[data-action="favorites"]').addEventListener("click", () => {
        applyFilters({ favorites: !favActive });
    });

    container.querySelectorAll("[data-category]").forEach(btn => {
        btn.addEventListener("click", () => {
            const cat = btn.dataset.category;
            applyFilters({ categories: active.includes(cat) ? [] : [cat] });
        });
    });

    bindCollapsibles(container);
}
