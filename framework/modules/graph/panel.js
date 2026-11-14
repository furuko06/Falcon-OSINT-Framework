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
            <details class="graph-example" ${graph.entities.length ? "" : "open"}>
                <summary>Ejemplo de uso</summary>
                <p>Investigás una empresa y querés ver cómo se conecta todo lo que vas encontrando:</p>
                <ol>
                    <li>En <strong>Añadir entidad</strong> elegís <em>Empresa</em>, escribís el nombre y la fuente.</li>
                    <li>Repetís con el <em>Dominio</em>, la <em>Persona</em> directiva y su <em>Email</em>.</li>
                    <li>En <strong>Añadir relación</strong> unís Empresa → opera → Dominio, y Persona → administra → Dominio, indicando la confianza de cada vínculo.</li>
                    <li>Cada entidad muestra abajo sus vecinos, así ves de un vistazo qué falta confirmar.</li>
                </ol>
                <button class="btn-small" type="button" data-load-example>Cargar ejemplo</button>
            </details>
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

    container.querySelector("[data-load-example]").addEventListener("click", () => {
        const sample = [
            { type: "Empresa", value: "Acme SA", source: "Registro mercantil" },
            { type: "Dominio", value: "acme.com.ar", source: "WHOIS" },
            { type: "Persona", value: "J. Pérez", source: "Boletín Oficial" },
            { type: "Email", value: "jperez@acme.com.ar", source: "Sitio corporativo" }
        ];
        const ids = {};
        for (const entity of sample) ids[entity.value] = addEntity(entity).id;
        const relations = [
            { from: ids["Acme SA"], to: ids["acme.com.ar"], label: "opera", confidence: "alta" },
            { from: ids["J. Pérez"], to: ids["acme.com.ar"], label: "administra", confidence: "media" },
            { from: ids["J. Pérez"], to: ids["jperez@acme.com.ar"], label: "usa", confidence: "alta" }
        ];
        const existing = getGraph().relations;
        for (const relation of relations) {
            const alreadyThere = existing.some(r =>
                r.from === relation.from && r.to === relation.to && r.label === relation.label);
            if (!alreadyThere) addRelation(relation);
        }
        renderGraphPanel(container);
    });

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
