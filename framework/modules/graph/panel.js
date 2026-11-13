/* ==========================================================
   Falcon Knowledge Graph Panel - E9 (UI)
   Alta de entidades y relaciones con su nivel de confianza.
   ========================================================== */
import { ENTITY_TYPES, CONFIDENCE_LEVELS, getGraph, addEntity, addRelation, removeEntity, neighborsOf } from "./graph.js";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function renderEntity(entity, graph) {
    const links = neighborsOf(entity.id);
    return `
        <li class="graph-entity">
            <strong>${esc(entity.type)}</strong> ${esc(entity.value)}
            ${entity.source ? `<small> · fuente: ${esc(entity.source)}</small>` : ""}
            <ul>
                ${links.length ? links.map(({ relation, entity: other }) => `
                    <li>${relation.from === entity.id ? "→" : "←"} ${esc(relation.label)} ${esc(other.value)}
                        <small>(confianza ${esc(relation.confidence)})</small></li>`).join("") : "<li><small>Sin relaciones</small></li>"}
            </ul>
            <button class="btn-small btn-danger" data-remove="${esc(entity.id)}">Eliminar</button>
        </li>`;
}

export function renderGraphPanel(container) {
    const graph = getGraph();
    const options = graph.entities.map(e => `<option value="${esc(e.id)}">${esc(e.type)}: ${esc(e.value)}</option>`).join("");

    container.innerHTML = `
        <section class="graph-panel" aria-label="Knowledge Graph">
            <header class="health-header">
                <h2>Knowledge Graph</h2>
                <p>Entidades: <strong>${graph.entities.length}</strong> · Relaciones: <strong>${graph.relations.length}</strong></p>
            </header>
            <form class="graph-form" data-form="entity">
                <select name="type" aria-label="Tipo de entidad">
                    ${ENTITY_TYPES.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join("")}
                </select>
                <input name="value" placeholder="Valor" required aria-label="Valor de la entidad">
                <input name="source" placeholder="Fuente (opcional)" aria-label="Fuente">
                <button class="btn-small" type="submit">Añadir entidad</button>
            </form>
            <form class="graph-form" data-form="relation">
                <select name="from" aria-label="Origen" ${graph.entities.length < 2 ? "disabled" : ""}>${options}</select>
                <input name="label" placeholder="Relación (p. ej. usa, administra)" required aria-label="Etiqueta">
                <select name="to" aria-label="Destino" ${graph.entities.length < 2 ? "disabled" : ""}>${options}</select>
                <select name="confidence" aria-label="Confianza">
                    ${CONFIDENCE_LEVELS.map(c => `<option value="${c}" ${c === "media" ? "selected" : ""}>confianza ${c}</option>`).join("")}
                </select>
                <button class="btn-small" type="submit" ${graph.entities.length < 2 ? "disabled" : ""}>Añadir relación</button>
            </form>
            <p class="graph-error" role="alert"></p>
            <ul class="graph-list">
                ${graph.entities.map(e => renderEntity(e, graph)).join("") || "<li>Sin entidades todavía.</li>"}
            </ul>
        </section>`;

    const showError = msg => { container.querySelector(".graph-error").textContent = msg; };

    container.querySelector('[data-form="entity"]').addEventListener("submit", e => {
        e.preventDefault();
        const data = new FormData(e.target);
        try {
            addEntity({ type: data.get("type"), value: data.get("value"), source: data.get("source") });
            renderGraphPanel(container);
        } catch (err) {
            showError(err.message);
        }
    });

    const relationForm = container.querySelector('[data-form="relation"]');
    relationForm.addEventListener("submit", e => {
        e.preventDefault();
        const data = new FormData(e.target);
        try {
            addRelation({
                from: data.get("from"),
                to: data.get("to"),
                label: data.get("label"),
                confidence: data.get("confidence")
            });
            renderGraphPanel(container);
        } catch (err) {
            showError(err.message);
        }
    });

    container.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", () => {
            removeEntity(btn.dataset.remove);
            renderGraphPanel(container);
        });
    });
}
