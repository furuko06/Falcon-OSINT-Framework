import { ExplorerState } from "./state.js";
import { applyFilters } from "./filters.js";

export function renderSidebar(container){

    const categories = [...new Set(
        ExplorerState.tools.map(tool=>tool.category)
    )].sort();

    container.innerHTML = "";

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