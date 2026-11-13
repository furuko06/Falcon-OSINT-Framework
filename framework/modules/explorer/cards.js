/* ==========================================================
   Falcon Explorer Cards - E1 Explorer Pro (v2.1)
   ========================================================== */
import { ExplorerState, setFavorites } from "./state.js";
import { applyCurrentFilters } from "./filters.js";
import { toggleFavorite } from "./favorites.js";
import { renderCollectionMenu } from "../collections/panel.js";

const HEALTH_COLORS = {
    verified: "#22C55E",
    working: "#3B82F6",
    beta: "#F59E0B",
    deprecated: "#F97316",
    archived: "#6B7280",
    broken: "#EF4444"
};

function normalizeStatus(s) { return String(s || "").toLowerCase(); }
function statusLabel(s) {
    const n = normalizeStatus(s);
    return n ? n.charAt(0).toUpperCase() + n.slice(1) : "Unknown";
}
function getHealthColor(s) { return HEALTH_COLORS[normalizeStatus(s)] || "#6B7280"; }

function githubUrl(value) {
    if (!value) return "";
    return value.startsWith("http") ? value : `https://github.com/${value}`;
}

function sameDestination(a, b) {
    return a && b && a.replace(/\/$/, "").toLowerCase() === b.replace(/\/$/, "").toLowerCase();
}

function renderToolActions(tool) {
    const website = tool.website || "";
    const github = githubUrl(tool.github);
    if (sameDestination(website, github)) {
        return `<a href="${github}" target="_blank" rel="noopener">GitHub</a>`;
    }
    const links = [];
    if (website) links.push(`<a href="${website}" target="_blank" rel="noopener">Website</a>`);
    if (github) links.push(`<a href="${github}" target="_blank" rel="noopener">GitHub</a>`);
    return links.length ? links.join("") : `<span class="no-links">Sin enlaces registrados</span>`;
}

export function renderCards(container, tools) {
    container.innerHTML = "";
    container.className = ExplorerState.view === "list" ? "cards-list" : "cards-grid";

    if (!tools.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No tools found</h3>
                <p>Try adjusting your filters or search query</p>
            </div>`;
        return;
    }

    tools.forEach(tool => {
        const toolId = String(tool.id);
        const isFavorite = ExplorerState.favorites.has(toolId);
        const color = getHealthColor(tool.status);
        const card = document.createElement("article");
        card.className = "tool-card";

        card.innerHTML = `
            <div class="tool-header">
                <div class="tool-title-section">
                    <h3>${tool.name}</h3>
                    ${tool.subcategory ? `<span class="tool-subcategory">${tool.subcategory}</span>` : ""}
                </div>
                <button class="favorite-btn" title="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
                    aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
                    aria-pressed="${isFavorite}" data-tool-id="${toolId}">${isFavorite ? "\u2605" : "\u2606"}</button>
            </div>
            <div class="tool-badges-row">
                <span class="health-badge" style="background:${color}20;color:${color}">${statusLabel(tool.status)}</span>
                <span class="badge">${tool.category}</span>
                ${tool.country ? `<span class="badge">${tool.country}</span>` : ""}
            </div>
            <div class="tool-description">${tool.description || "No description available."}</div>
            <div class="badges">
                ${Number(tool.offline) ? '<span class="badge offline">Offline</span>' : ""}
                ${Number(tool.docker) ? '<span class="badge docker">Docker</span>' : ""}
                ${Number(tool.api) ? '<span class="badge api">API</span>' : ""}
                ${Number(tool.vpn_friendly) ? '<span class="badge vpn">VPN</span>' : ""}
                ${Number(tool.tor_friendly) ? '<span class="badge tor">TOR</span>' : ""}
            </div>
            <div class="scores">
                <div class="score">
                    <label><span>Quality</span><strong>${tool.quality_score || 0}</strong></label>
                    <div class="progress"><div style="width:${tool.quality_score || 0}%"></div></div>
                </div>
                <div class="score">
                    <label><span>OPSEC</span><strong>${tool.opsec_score || 0}</strong></label>
                    <div class="progress"><div style="width:${tool.opsec_score || 0}%"></div></div>
                </div>
            </div>
            <div class="tool-footer">${renderToolActions(tool)}</div>
        `;

        renderCollectionMenu(card, tool);

        const favBtn = card.querySelector(".favorite-btn");
        favBtn.addEventListener("click", () => {
            const favorites = toggleFavorite(toolId, ExplorerState.favorites);
            setFavorites(favorites);
            const on = favorites.has(toolId);
            favBtn.textContent = on ? "\u2605" : "\u2606";
            favBtn.title = on ? "Remove from favorites" : "Add to favorites";
            favBtn.setAttribute("aria-label", favBtn.title);
            favBtn.setAttribute("aria-pressed", String(on));
            applyCurrentFilters();
        });

        container.appendChild(card);
    });
}