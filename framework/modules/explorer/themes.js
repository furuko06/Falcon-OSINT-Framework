/**
 * Falcon Theme Engine
 * M3.1.2
 */

import { ExplorerState, setTheme } from "./state.js";

export const THEMES = [
    "dark",
    "matrix",
    "nato",
    "light"
];

export function applyTheme(theme = "dark") {

    if (!THEMES.includes(theme)) {
        theme = "dark";
    }

    document.documentElement.dataset.theme = theme;

    localStorage.setItem("falcon-theme", theme);

    setTheme(theme);
}

export function initializeTheme() {

    const saved =
        localStorage.getItem("falcon-theme") ??
        ExplorerState.theme;

    applyTheme(saved);

}