/* ==========================================================
   Falcon Explorer Cards - M3.1.3
   ========================================================== */

import { ExplorerState, setFavorites } from "./state.js";
import { applyCurrentFilters } from "./filters.js";
import { toggleFavorite } from "./favorites.js";

export function renderCards(container, tools){

    container.innerHTML="";

    if(!tools.length){

        container.innerHTML=`
            <div class="empty-state">
                No tools found.
            </div>
        `;

        return;
    }

    tools.forEach(tool=>{

        const toolId = String(tool.id);
        const isFavorite = ExplorerState.favorites.has(toolId);
        const favoriteIcon = isFavorite ? "\u2605" : "\u2606";
        const card=document.createElement("article");
        card.className="tool-card";

        card.innerHTML=`

        <div class="tool-header">

            <h3>${tool.name}</h3>

            <button
                class="favorite-btn"
                title="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
                aria-label="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
                aria-pressed="${isFavorite}"
                data-tool-id="${toolId}">
                ${favoriteIcon}
            </button>

        </div>

        <span class="tool-status">
            ${tool.status}
        </span>

        <div class="tool-description">
            ${tool.description || "No description available."}
        </div>

        <div class="badges">

            <span class="badge">${tool.category}</span>

            <span class="badge">${tool.country}</span>

            ${Number(tool.offline) ? '<span class="badge offline">Offline</span>' : ""}

            ${Number(tool.docker) ? '<span class="badge docker">Docker</span>' : ""}

            ${Number(tool.api) ? '<span class="badge api">API</span>' : ""}

        </div>

        <div class="scores">

            <div class="score">

                <label>
                    <span>Quality</span>
                    <strong>${tool.quality_score}</strong>
                </label>

                <div class="progress">
                    <div style="width:${tool.quality_score}%"></div>
                </div>

            </div>

            <div class="score">

                <label>
                    <span>OPSEC</span>
                    <strong>${tool.opsec_score}</strong>
                </label>

                <div class="progress">
                    <div style="width:${tool.opsec_score}%"></div>
                </div>

            </div>

        </div>

        <div class="tool-footer">

            ${
              tool.website
                ? `<a href="${tool.website}" target="_blank">Website</a>`
                : "<span></span>"
            }

            ${
              tool.github
                ? `<a href="https://github.com/${tool.github}" target="_blank">GitHub</a>`
                : ""
            }

        </div>

        `;

        const favoriteButton =
            card.querySelector(".favorite-btn");

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
