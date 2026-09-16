import { applyFilters, clearFilters } from "./filters.js";
import { renderCards } from "./cards.js";
import { renderSidebar } from "./sidebar.js";

export async function initializeExplorer() {

    const sidebar = document.getElementById("sidebar");
    const toolbar = document.getElementById("toolbar");
    const cards = document.getElementById("cards");

    renderToolbar(toolbar);

    subscribe(state => {

        renderSidebar(sidebar);
        renderCards(cards, state.results);
        renderStats(
            toolbar.querySelector("#toolbar-stats"),
            state.stats
        );

    });

    const tools = await loadTools();

    populateFilterOptions(toolbar, tools);

}

export function renderToolbar(container) {

    container.innerHTML = `
        <div class="toolbar">

            <div class="toolbar-search">
                <input
                    id="search-input"
                    type="search"
                    placeholder="Search tools, categories, countries..."
                    autocomplete="off"
                />
            </div>

            <div class="toolbar-filters">

                <select id="filter-category">
                    <option value="">All categories</option>
                </select>

                <select id="filter-country">
                    <option value="">All countries</option>
                </select>

                <label class="filter-check">
                    <input type="checkbox" id="filter-offline">
                    Offline
                </label>

                <label class="filter-check">
                    <input type="checkbox" id="filter-docker">
                    Docker
                </label>

                <label class="filter-check">
                    <input type="checkbox" id="filter-api">
                    API
                </label>

                <label class="filter-check">
                    <input type="checkbox" id="filter-favorites">
                    Favorites
                </label>

                <button id="clear-filters">
                    Clear
                </button>

            </div>

            <div id="toolbar-stats" class="toolbar-stats">
                0 Tools
            </div>

        </div>
    `;

    const searchInput =
        container.querySelector("#search-input");

    searchInput.addEventListener("input", event => {

        search(event.target.value);

    });

    const category =
        container.querySelector("#filter-category");

    category.addEventListener("change", event => {

        applyFilters({
            category: event.target.value || null
        });

    });

    const country =
        container.querySelector("#filter-country");

    country.addEventListener("change", event => {

        applyFilters({
            country: event.target.value || null
        });

    });

    container
        .querySelector("#filter-offline")
        .addEventListener("change", event => {

            applyFilters({
                offline: event.target.checked
            });

        });

    container
        .querySelector("#filter-docker")
        .addEventListener("change", event => {

            applyFilters({
                docker: event.target.checked
            });

        });

    container
        .querySelector("#filter-api")
        .addEventListener("change", event => {

            applyFilters({
                api: event.target.checked
            });

        });

    container
        .querySelector("#filter-favorites")
        .addEventListener("change", event => {

            applyFilters({
                favorites: event.target.checked
            });

        });

    container
        .querySelector("#clear-filters")
        .addEventListener("click", () => {

            searchInput.value = "";

            container.querySelector(
                "#filter-category"
            ).value = "";

            container.querySelector(
                "#filter-country"
            ).value = "";

            container.querySelector(
                "#filter-offline"
            ).checked = false;

            container.querySelector(
                "#filter-docker"
            ).checked = false;

            container.querySelector(
                "#filter-api"
            ).checked = false;

            container.querySelector(
                "#filter-favorites"
            ).checked = false;

            clearFilters();

        });

}

export function populateFilterOptions(
    container,
    tools
) {

    const categorySelect =
        container.querySelector("#filter-category");

    const countrySelect =
        container.querySelector("#filter-country");

    const categories = [
        ...new Set(
            tools
                .map(tool => tool.category)
                .filter(Boolean)
        )
    ].sort();

    const countries = [
        ...new Set(
            tools
                .map(tool => tool.country)
                .filter(Boolean)
        )
    ].sort();

    categorySelect.innerHTML =
        `<option value="">All categories</option>` +
        categories
            .map(
                category =>
                    `<option value="${category}">
                        ${category}
                    </option>`
            )
            .join("");

    countrySelect.innerHTML =
        `<option value="">All countries</option>` +
        countries
            .map(
                country =>
                    `<option value="${country}">
                        ${country}
                    </option>`
            )
            .join("");
}

export function renderStats(
    container,
    stats
) {

    container.innerHTML = `
        <span>${stats.tools} Tools</span>
        <span>${stats.categories} Categories</span>
        <span>${stats.countries} Countries</span>
        <span>${stats.favorites} Favorites</span>
        <span>${stats.offline} Offline</span>
    `;
}

import {
    Database
} from "../../database/database.js";

import {
    subscribe,
    updateState
} from "./state.js";

import {
    applyCurrentFilters
} from "./filters.js";

export async function loadTools() {

    const tools = await Database.query(`
        SELECT *
        FROM tools
        ORDER BY quality_score DESC;
    `);

    window.__falconTools = tools;

    updateState({

        tools,

        results: tools,

        stats: {

            tools: tools.length,

            categories:
                new Set(
                    tools
                        .map(tool => tool.category)
                        .filter(Boolean)
                ).size,

            countries:
                new Set(
                    tools
                        .map(tool => tool.country)
                        .filter(Boolean)
                ).size

        }

    });

    return tools;
}

export function search(query = "") {

    updateState({
        query
    });

    applyCurrentFilters();
}
