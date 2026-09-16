import { ExplorerState } from "./state.js";
import { applyFilters } from "./filters.js";

export function renderSidebar(container){

    const categories = [...new Set(
        ExplorerState.tools.map(tool=>tool.category)
    )].sort();

    container.innerHTML = "";

    const favoritesButton = document.createElement("button");

    favoritesButton.className = "sidebar-item";

    favoritesButton.textContent =
        `Favorites (${ExplorerState.favorites.size})`;

    favoritesButton.onclick = ()=>{

        applyFilters({favorites: true});

    };

    container.appendChild(favoritesButton);

    categories.forEach(category=>{

        const button = document.createElement("button");

        button.className = "sidebar-item";

        button.textContent = category;

        button.onclick = ()=>{

            applyFilters({category});

        };

        container.appendChild(button);

    });

}
