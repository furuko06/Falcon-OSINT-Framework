/* ==========================================================
   Falcon UI - Collapsible groups
   Menús con más de una opción: se pliegan con un botón y
   recuerdan su estado en este navegador.
   ========================================================== */

const STORAGE_KEY = "falcon:collapsed-groups";

function readState() {
    if (typeof localStorage === "undefined") return {};
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function isOpen(id, defaultOpen) {
    const state = readState();
    return Object.prototype.hasOwnProperty.call(state, id) ? state[id] !== false : defaultOpen;
}

function saveState(id, open) {
    if (typeof localStorage === "undefined") return;
    const state = readState();
    state[id] = open;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

/**
 * Renders a <details> group. Extra classes go through `className`.
 * Groups with a single option should stay as plain sections.
 */
export function collapsibleGroup({ id, title, body, count = null, defaultOpen = true, className = "" }) {
    const open = isOpen(id, defaultOpen);
    return `
        <details class="collapse ${esc(className)}" data-group="${esc(id)}" ${open ? "open" : ""}>
            <summary>
                <span class="collapse-title">${esc(title)}</span>
                ${count === null ? "" : `<span class="collapse-count">${esc(count)}</span>`}
                <span class="collapse-chevron" aria-hidden="true">▸</span>
            </summary>
            <div class="collapse-body">${body}</div>
        </details>`;
}

/** Persists open/closed state whenever a group is toggled. */
export function bindCollapsibles(container) {
    container.querySelectorAll("details[data-group]").forEach(details => {
        details.addEventListener("toggle", () => saveState(details.dataset.group, details.open));
    });
}
