/* ==========================================================
   Falcon Explorer Cards - E1 Explorer Pro
   ========================================================== */

import { ExplorerState, setFavorites } from "./state.js";
import { applyCurrentFilters } from "./filters.js";
import { toggleFavorite } from "./favorites.js";

const HEALTH_COLORS = {
    Verified: "#22C55E",
    Working: "#3B82F6",
    Beta: "#F59E0B",
    Deprecated: "#F97316",
    Archived: "#6B7280",
    Broken: "#EF4444"
};

function githubUrl(value) {
    if (!value) {
        return "";
    }

    return value.startsWith("http")
        ? value
        : `https://github.com/${value}`;
}

function sameDestination(first, second) {
    return first &&
        second &&
        first.replace(/\/$/, "").toLowerCase() ===
            second.replace(/\/$/, "").toLowerCase();
}

function renderToolActions(tool) {
    const website = tool.website || "";
    const github = githubUrl(tool.github);

    if (sameDestination(website, github)) {
        return `<a href="${github}" target="_blank">GitHub</a>`;
    }

    const links = [];

    if (website) {
        links.push(
            `<a href="${website}" target="_blank">Website</a>`
        );
    }

    if (github) {
        links.push(
            `<a href="${github}" target="_blank">GitHub</a>`
        );
    }

    return links.length ? links.join("") : "<span></span>";
}

function getHealthColor(status) {
    return HEALTH_COLORS[status] || "#6B7280";
}

export function renderCards(container, tools) {
    container.innerHTML = "";
    container.className = ExplorerState.view === "list" ? "cards-list" : "cards-grid";

    if (!tools.length) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No tools found</h3>
                <p>Try adjusting your filters or search query</p>
            </div>
        `;
        return;
    }

    tools.forEach(tool => {
        const toolId = String(tool.id);
        const isFavorite = ExplorerState.favorites.has(toolId);
        const favoriteIcon = isFavorite ? "\u2605" : "\u2606";
        const actions = renderToolActions(tool);
        const healthColor = getHealthColor(tool.status);
        
        const card = document.createElement("article");
        card.className = "tool-card";

        card.innerHTML = `
            <div class="tool-header">
                <div class="tool-title-section">
                    <h3>${tool.name}</h3>
                    ${tool.subcategory ? `<span class="tool-subcategory">${tool.subcategory}</span>` : ""}
                </div>
                <button
                    class="favorite-btn"
                    title="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
                    aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
                    aria-pressed="${isFavorite}"
                    data-tool-id="${toolId}">
                    ${favoriteIcon}
                </button>
            </div>

            <div class="tool-badges-row">
                <span class="health-badge" style="background: ${healthColor}20; color: ${healthColor}">
                    ${tool.status}
                </span>
                <span class="badge">${tool.category}</span>
                ${tool.country ? `<span class="badge">${tool.country}</span>` : ""}
            </div>

            <div class="tool-description">
                ${tool.description || "No description available."}
            </div>

            <div class="badges">
                ${Number(tool.offline) ? '<span class="badge offline">Offline</span>' : ""}
                ${Number(tool.docker) ? '<span class="badge docker">Docker</span>' : ""}
                ${Number(tool.api) ? '<span class="badge api">API</span>' : ""}
                ${Number(tool.vpn_friendly) ? '<span class="badge vpn">VPN</span>' : ""}
                ${Number(tool.tor_friendly) ? '<span class="badge tor">TOR</span>' : ""}
            </div>

            <div class="scores">
                <div class="score">
                    <label>
                        <span>Quality</span>
                        <strong>${tool.quality_score || 0}</strong>
                    </label>
                    <div class="progress">
                        <div style="width:${tool.quality_score || 0}%"></div>
                    </div>
                </div>
                <div class="score">
                    <label>
                        <span>OPSEC</span>
                        <strong>${tool.opsec_score || 0}</strong>
                    </label>
                    <div class="progress">
                        <div style="width:${tool.opsec_score || 0}%"></div>
                    </div>
                </div>
            </div>

            <div class="tool-footer">
                ${actions}
            </div>
        `;

        const favoriteButton = card.querySelector(".favorite-btn");

        favoriteButton.addEventListener("click", () => {
            const favorites = toggleFavorite(
                toolId,
                ExplorerState.favorites
            );

            setFavorites(favorites);

            const nextFavorite = favorites.has(toolId);
            const nextLabel = nextFavorite
                ? "Remove from favorites"
                : "Add to favorites";

            favoriteButton.textContent =
                nextFavorite ? "\u2605" : "\u2606";
            favoriteButton.title = nextLabel;
            favoriteButton.setAttribute("aria-label", nextLabel);
            favoriteButton.setAttribute(
                "aria-pressed",
                String(nextFavorite)
            );

            applyCurrentFilters();
        });

        container.appendChild(card);
    });
}