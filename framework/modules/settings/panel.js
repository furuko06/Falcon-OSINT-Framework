/* ==========================================================
   Falcon Settings - database info, backup and local storage
   ========================================================== */

import { Database } from "../../database/database.js";
import { downloadText } from "../collections/collections.js";
import {
    clearQueryHistory,
    loadQueryHistory
} from "../assistant/context.js";
import {
    backupFilename,
    buildBackup,
    parseBackup,
    restoreBackup
} from "./backup.js";

const APP_VERSION = "0.7.0-beta";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function localKeys() {
    const keys = [];
    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith("falcon:")) {
            keys.push({ key, size: (localStorage.getItem(key) || "").length });
        }
    }
    return keys.sort((a, b) => a.key.localeCompare(b.key));
}

export async function renderSettingsPanel(container) {
    container.innerHTML = `<section class="settings-panel"><p class="collections-empty">Leyendo el estado local…</p></section>`;

    let schema;
    try {
        schema = await Database.getSchemaInfo();
    } catch (error) {
        schema = { version: "Unknown", current: null, migrations: [], error: error.message };
    }

    let toolCount = 0;
    try {
        toolCount = await Database.count("tools");
    } catch {
        toolCount = 0;
    }

    const history = loadQueryHistory();
    const keys = localKeys();
    const lastRestore = (() => {
        try {
            return JSON.parse(localStorage.getItem("falcon:last-restore") || "null");
        } catch {
            return null;
        }
    })();

    const migrationRows = (schema.migrations || []).map(item => `
        <tr>
            <td>${esc(item.version)}</td>
            <td>${esc(item.name)}</td>
            <td>${esc(item.applied_at)}</td>
        </tr>`).join("");

    container.innerHTML = `
        <section class="settings-panel" aria-label="Ajustes y backup">
            <header class="health-header">
                <h2>Ajustes y backup</h2>
                <p>Todo se guarda en este navegador. Exportá un backup antes de limpiar datos o cambiar de equipo.</p>
            </header>

            <div class="settings-grid">
                <article class="settings-card">
                    <h3>Base de datos</h3>
                    <dl class="settings-list">
                        <div><dt>Versión de esquema</dt><dd>${esc(schema.version)}${schema.current ? ` / ${esc(schema.current)}` : ""}</dd></div>
                        <div><dt>Herramientas</dt><dd>${esc(toolCount)}</dd></div>
                        <div><dt>Migraciones</dt><dd>${esc((schema.migrations || []).length)}</dd></div>
                    </dl>
                    ${schema.error ? `<p class="ioc-error">${esc(schema.error)}</p>` : ""}
                    <table class="settings-table">
                        <thead><tr><th>#</th><th>Migración</th><th>Aplicada</th></tr></thead>
                        <tbody>${migrationRows || `<tr><td colspan="3">Sin registros</td></tr>`}</tbody>
                    </table>
                </article>

                <article class="settings-card">
                    <h3>Historial de consultas IA</h3>
                    <p>${history.length} consulta(s) con entorno, fuentes y prompt exacto. No incluye claves.</p>
                    <div class="settings-actions">
                        <button class="btn-small" type="button" data-clear-history ${history.length ? "" : "disabled"}>Borrar historial</button>
                    </div>
                </article>

                <article class="settings-card">
                    <h3>Almacenamiento local</h3>
                    <ul class="settings-keys">
                        ${keys.length
                            ? keys.map(item => `<li><code>${esc(item.key)}</code><span>${formatBytes(item.size)}</span></li>`).join("")
                            : `<li class="collections-empty">Sin datos locales.</li>`}
                    </ul>
                    <p class="collections-empty">Las claves de OpenRouter viven en <code>sessionStorage</code> y no aparecen acá.</p>
                </article>
            </div>

            <article class="settings-card settings-backup">
                <h3>Exportar backup</h3>
                <p>Incluye catálogo SQLite, configuración, colecciones, Academy, IOCs y el historial de consultas con su
                   entorno y contexto. No incluye credenciales.</p>
                <div class="settings-actions">
                    <button class="btn-small" type="button" data-export-backup>Descargar backup JSON</button>
                    <span class="assistant-status" id="backup-status" role="status" aria-live="polite"></span>
                </div>
            </article>

            <article class="settings-card settings-backup">
                <h3>Restaurar backup</h3>
                <p>Importá un archivo exportado por Falcon. Se combinan los datos locales; la base SQLite del backup
                   queda dentro del archivo para recuperación externa y no reemplaza la base de la aplicación.</p>
                <div class="settings-actions">
                    <input type="file" id="backup-file" accept="application/json,.json" aria-label="Archivo de backup">
                    <button class="btn-small" type="button" data-restore-backup disabled>Restaurar</button>
                    <button class="btn-small" type="button" data-reload-page>Recargar Falcon</button>
                </div>
                <p class="assistant-status" id="restore-status" role="status" aria-live="polite">
                    ${lastRestore ? `Última restauración: ${esc(lastRestore.restored_at)} (${esc(lastRestore.keys)} claves).` : ""}
                </p>
            </article>
        </section>`;

    const status = container.querySelector("#backup-status");
    const restoreStatus = container.querySelector("#restore-status");
    let parsedBackup = null;

    container.querySelector("[data-export-backup]").addEventListener("click", async () => {
        const button = container.querySelector("[data-export-backup]");
        button.disabled = true;
        status.textContent = "Preparando backup y checksum…";
        try {
            const bytes = await Database.exportBytes();
            const backup = await buildBackup({
                storage: localStorage,
                databaseBytes: bytes,
                app: { version: APP_VERSION, schemaVersion: schema.version },
                history
            });
            downloadText(backupFilename(), JSON.stringify(backup, null, 2), "application/json");
            status.textContent = `Backup listo: ${formatBytes(bytes.length)} de base, ${history.length} consulta(s).`;
        } catch (error) {
            status.textContent = `No se pudo exportar: ${error.message}`;
        } finally {
            button.disabled = false;
        }
    });

    const fileInput = container.querySelector("#backup-file");
    const restoreButton = container.querySelector("[data-restore-backup]");

    fileInput.addEventListener("change", async () => {
        parsedBackup = null;
        restoreButton.disabled = true;
        const file = fileInput.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            parsedBackup = parseBackup(text);
            restoreButton.disabled = false;
            restoreStatus.textContent = `Backup válido de ${parsedBackup.created_at || "fecha desconocida"}; ${Object.keys(parsedBackup.local_data || {}).length} clave(s) y ${parsedBackup.queries?.length || 0} consulta(s).`;
        } catch (error) {
            restoreStatus.textContent = error.message;
        }
    });

    restoreButton.addEventListener("click", () => {
        if (!parsedBackup) return;
        if (!window.confirm("¿Restaurar este backup? Los datos locales con la misma clave serán reemplazados.")) return;
        try {
            const result = restoreBackup(parsedBackup);
            restoreStatus.textContent = `Restauradas ${result.restored.length} clave(s). Recargá Falcon para aplicar todo.`;
            restoreButton.disabled = true;
        } catch (error) {
            restoreStatus.textContent = `No se pudo restaurar: ${error.message}`;
        }
    });

    container.querySelector("[data-reload-page]").addEventListener("click", () => location.reload());

    container.querySelector("[data-clear-history]")?.addEventListener("click", () => {
        if (!window.confirm("¿Borrar el historial de consultas IA? Esta acción no se puede deshacer.")) return;
        clearQueryHistory(localStorage);
        renderSettingsPanel(container);
    });
}
