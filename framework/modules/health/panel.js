/* ==========================================================
   Falcon Health Panel - E7 (UI)
   Table of tool health with actions for community reports.
   ========================================================== */
import { evaluateAll, reportTool, recordVerification, INDICATORS } from "./engine.js";
import { ExplorerState } from "../explorer/state.js";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function renderRow(row) {
    return `
        <tr class="${row.broken ? "health-broken" : ""}">
            <td>${esc(row.name)}</td>
            <td><span class="badge health-${esc(row.status)}">${esc(row.status)}</span></td>
            <td><span class="health-score" aria-label="score ${row.score}">${row.score}</span></td>
            <td>${row.reports.broken} / ${row.reports.update}</td>
            <td>${row.history.length ? esc(new Date(row.history[row.history.length - 1].at).toLocaleDateString()) : "—"}</td>
            <td class="health-actions">
                <button class="btn-small btn-danger" data-action="broken" data-id="${esc(row.id)}">Report Broken</button>
                <button class="btn-small" data-action="update" data-id="${esc(row.id)}">Suggest Update</button>
                <button class="btn-small" data-action="verify" data-id="${esc(row.id)}">Mark verified</button>
            </td>
        </tr>`;
}

export function renderHealthPanel(container, state = ExplorerState) {
    const rows = evaluateAll(state.tools);
    const broken = rows.filter(r => r.broken).length;
    const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;

    container.innerHTML = `
        <section class="health-panel" aria-label="Salud de herramientas">
            <header class="health-header">
                <h2>Health Engine</h2>
                <p>Score medio <strong>${avg}</strong> · Posibles rotas <strong>${broken}</strong> · Estados: ${INDICATORS.join(", ")}</p>
            </header>
            <div class="health-table-wrap">
                <table class="health-table">
                    <thead>
                        <tr><th>Herramienta</th><th>Estado</th><th>Score</th><th>Rotas / Actualizar</th><th>Última verificación</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>${rows.map(renderRow).join("")}</tbody>
                </table>
            </div>
        </section>`;

    container.querySelectorAll("[data-action]").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            if (action === "verify") recordVerification(id, "working");
            else reportTool(id, action === "broken" ? "broken" : "update");
            renderHealthPanel(container, state);
        });
    });
}
