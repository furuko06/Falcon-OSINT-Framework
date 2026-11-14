/* ==========================================================
   Falcon Marketplace Panel - E5 (UI)
   ========================================================== */
import { listMarketplace } from "./marketplace.js";
import { installPlugin, updatePlugin, removePlugin } from "./sdk.js";
import { PLUGIN_CATALOG } from "./catalog.js";
import { collapsibleGroup, bindCollapsibles } from "../../ui/collapse.js";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function renderEntry(entry) {
    const action = entry.installed
        ? (entry.updateAvailable
            ? `<button class="btn-small" data-action="update" data-id="${esc(entry.id)}">Update</button>`
            : `<span class="plugin-state">Instalado</span>`)
        : `<button class="btn-small" data-action="install" data-id="${esc(entry.id)}">Install</button>`;
    const remove = entry.installed
        ? `<button class="btn-small btn-danger" data-action="remove" data-id="${esc(entry.id)}">Remove</button>`
        : "";
    return `
        <div class="plugin-card">
            <div class="plugin-head"><strong>${esc(entry.name)}</strong> <span class="badge">v${esc(entry.version)}</span></div>
            <p class="plugin-desc">${esc(entry.description || "")}</p>
            <p class="plugin-meta">${esc(entry.author)} · ${esc(entry.license)} · Falcon ≥ ${esc(entry.minFramework)}</p>
            <p class="plugin-meta">Permisos: ${entry.permissions.map(esc).join(", ") || "ninguno"}</p>
            <div class="plugin-actions">${action} ${remove}</div>
        </div>`;
}

export function renderMarketplacePanel(container) {
    const { entries, rejected } = listMarketplace(PLUGIN_CATALOG);
    const list = entries.map(renderEntry).join("");
    container.innerHTML = `
        <div class="sidebar-section plugins-section">
            ${entries.length > 1
                ? collapsibleGroup({ id: "marketplace", title: "Marketplace", count: entries.length, body: list })
                : `<h3>Marketplace</h3>${list}`}
            ${rejected.length ? `<p class="collections-empty">${rejected.length} entrada(s) inválida(s) omitida(s).</p>` : ""}
        </div>`;

    bindCollapsibles(container);

    container.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const manifest = PLUGIN_CATALOG.find(p => p.id === btn.dataset.id);
            if (!manifest) return;
            try {
                if (btn.dataset.action === "remove") {
                    if (!confirm(`¿Quitar ${manifest.name}?`)) return;
                    removePlugin(manifest.id);
                } else {
                    const perms = manifest.permissions.join(", ");
                    if (!confirm(`${manifest.name} pedirá estos permisos: ${perms}. ¿Aceptar?`)) return;
                    if (btn.dataset.action === "update") {
                        updatePlugin(manifest, manifest.permissions);
                    } else {
                        installPlugin(manifest, manifest.permissions);
                    }
                }
                renderMarketplacePanel(container);
            } catch (err) {
                alert(err.message);
            }
        });
    });
}
