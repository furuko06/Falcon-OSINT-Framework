import { subscribe } from "./state.js";
import { loadTools } from "./search.js";

import { renderToolbar } from "./toolbar.js";
import { renderSidebar } from "./sidebar.js";
import { renderCards } from "./cards.js";

export async function initializeExplorer() {

    const sidebar = document.getElementById("sidebar");
    const toolbar = document.getElementById("toolbar");
    const cards = document.getElementById("cards");

    renderToolbar(toolbar);

    subscribe(state => {
        renderSidebar(sidebar);
        renderCards(cards, state.results);
    });

    await loadTools();

}