/* ==========================================================
   Falcon Collections Panel - E3 (UI)
   ========================================================== */
import {
    getCollections,
    createCollection,
    renameCollection,
    setCollectionTags,
    setCollectionNotes,
    toggleToolInCollection,
    deleteCollection,
    exportCollectionJSON,
    exportCollectionMarkdown,
    downloadText
} from "./collections.js";
import { ExplorerState } from "../explorer/state.js";
import { collapsibleGroup, bindCollapsibles } from "../../ui/collapse.js";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

let selectedId = null;

export function renderCollectionsPanel(container) {
    const cols = getCollections();
    const selected = cols.find(c => c.id === selectedId) || null;

    const list = cols.map(c => `
        <button class="sidebar-item ${c.id === selectedId ? "active" : ""}" data-col="${esc(c.id)}">
            <span>${esc(c.name)}</span>
            <span class="count">${c.toolIds.length}</span>
        </button>`).join("") || `<p class="collections-empty">Aún no tienes colecciones.</p>`;

    container.innerHTML = `
        <div class="sidebar-section collections-section">
            <h3>Collections</h3>
            <form class="collection-form" id="collection-form">
                <input id="collection-name" type="text" placeholder="Nueva colección" aria-label="Nombre de la colección" maxlength="60" />
                <button type="submit" class="btn-small">+ Crear</button>
            </form>
            ${cols.length > 1
                ? collapsibleGroup({ id: "collections-list", title: "Tus colecciones", count: cols.length, body: list })
                : list}
        </div>
        ${selected ? renderDetail(selected) : ""}
    `;

    container.querySelector("#collection-form").addEventListener("submit", e => {
        e.preventDefault();
        const input = container.querySelector("#collection-name");
        try {
            const col = createCollection({ name: input.value });
            selectedId = col.id;
            renderCollectionsPanel(container);
        } catch (err) {
            alert(err.message);
        }
    });

    container.querySelectorAll("[data-col]").forEach(btn => {
        btn.addEventListener("click", () => {
            selectedId = btn.dataset.col;
            renderCollectionsPanel(container);
        });
    });

    bindCollapsibles(container);

    if (!selected) return;

    container.querySelector("#col-rename").addEventListener("change", e => {
        try { renameCollection(selected.id, e.target.value); } catch (err) { alert(err.message); }
    });
    container.querySelector("#col-tags").addEventListener("change", e => {
        setCollectionTags(selected.id, e.target.value);
    });
    container.querySelector("#col-notes").addEventListener("change", e => {
        setCollectionNotes(selected.id, e.target.value);
    });
    container.querySelector("#col-delete").addEventListener("click", () => {
        if (confirm(`¿Eliminar la colección "${selected.name}"?`)) {
            selectedId = null;
            deleteCollection(selected.id);
        }
    });
    container.querySelector("#col-export-json").addEventListener("click", () => {
        downloadText(`${slug(selected.name)}.json`, exportCollectionJSON(selected, ExplorerState.tools), "application/json");
    });
    container.querySelector("#col-export-md").addEventListener("click", () => {
        downloadText(`${slug(selected.name)}.md`, exportCollectionMarkdown(selected, ExplorerState.tools), "text/markdown");
    });
}

function renderDetail(col) {
    const byId = new Map(ExplorerState.tools.map(t => [String(t.id), t]));
    const tools = col.toolIds.map(id => byId.get(id)).filter(Boolean);
    return `
        <div class="sidebar-section collection-detail">
            <h3>Detalle</h3>
            <label class="collection-field">Nombre
                <input id="col-rename" type="text" value="${esc(col.name)}" maxlength="60" />
            </label>
            <label class="collection-field">Tags (separados por coma)
                <input id="col-tags" type="text" value="${esc(col.tags.join(", "))}" />
            </label>
            <label class="collection-field">Notas
                <textarea id="col-notes" rows="4">${esc(col.notes)}</textarea>
            </label>
            <p class="collection-meta">${tools.length} herramientas · creada ${esc(col.createdAt.slice(0, 10))} · modificada ${esc(col.updatedAt.slice(0, 10))}</p>
            <ul class="collection-tools">
                ${tools.map(t => `<li>${esc(t.name)}</li>`).join("") || "<li>Sin herramientas</li>"}
            </ul>
            <div class="collection-actions">
                <button id="col-export-json" class="btn-small">Exportar JSON</button>
                <button id="col-export-md" class="btn-small">Exportar Markdown</button>
                <button id="col-delete" class="btn-small btn-danger">Eliminar</button>
            </div>
        </div>
    `;
}

function slug(name) {
    return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "coleccion";
}

export function renderCollectionMenu(card, tool) {
    const toolId = String(tool.id);
    const cols = getCollections();
    const holding = cols.filter(c => c.toolIds.includes(toolId));
    const wrap = document.createElement("div");
    wrap.className = "collection-menu";
    wrap.innerHTML = `
        <label class="collection-add">
            <span>Colección:</span>
            <select aria-label="Añadir a colección">
                <option value="">${cols.length ? "Añadir / quitar…" : "Crea una colección primero"}</option>
                ${cols.map(c => `<option value="${esc(c.id)}">${esc(c.name)}${c.toolIds.includes(toolId) ? " ✓" : ""}</option>`).join("")}
            </select>
        </label>
        ${holding.length ? `<span class="collection-chips">${holding.map(c => `<span class="badge">${esc(c.name)}</span>`).join("")}</span>` : ""}
    `;
    wrap.querySelector("select").addEventListener("change", e => {
        if (!e.target.value) return;
        toggleToolInCollection(e.target.value, toolId);
    });
    card.appendChild(wrap);
}
