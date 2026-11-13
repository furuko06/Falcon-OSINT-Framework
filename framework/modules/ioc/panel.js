/* ==========================================================
   Falcon IOC Workspace - E10
   ========================================================== */
import {
    IOC_TYPES, IOC_STATUSES, IOC_SEVERITIES, IOC_CONFIDENCE_LEVELS,
    addIndicator, updateIndicator, removeIndicator, filterIndicators, exportIndicatorsJSON
} from "./ioc.js";
import { addEntity, getGraph } from "../graph/graph.js";

const STATUS_LABELS = {
    nuevo: "Nuevo",
    en_revision: "En revisión",
    confirmado: "Confirmado",
    falso_positivo: "Falso positivo",
    cerrado: "Cerrado"
};
const SEVERITY_LABELS = { baja: "Baja", media: "Media", alta: "Alta", critica: "Crítica" };

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function renderIndicator(indicator, graphEntityIds) {
    const isLinked = indicator.graphEntityId && graphEntityIds.has(indicator.graphEntityId);
    return `
        <article class="ioc-item">
            <div class="ioc-item-heading">
                <div><span class="badge">${esc(indicator.type)}</span> <strong>${esc(indicator.value)}</strong></div>
                <span class="badge ioc-severity-${esc(indicator.severity)}">${esc(SEVERITY_LABELS[indicator.severity])}</span>
            </div>
            <p class="ioc-meta">Fuente: ${esc(indicator.source || "No indicada")} · Confianza: ${esc(indicator.confidence)} · Creado: ${esc(new Date(indicator.createdAt).toLocaleString())}</p>
            ${indicator.notes ? `<p>${esc(indicator.notes)}</p>` : ""}
            <div class="ioc-item-actions">
                <label>Estado
                    <select data-status="${esc(indicator.id)}" aria-label="Estado de ${esc(indicator.value)}">
                        ${IOC_STATUSES.map(status => `<option value="${status}" ${indicator.status === status ? "selected" : ""}>${STATUS_LABELS[status]}</option>`).join("")}
                    </select>
                </label>
                <button class="btn-small" type="button" data-link-graph="${esc(indicator.id)}" ${isLinked ? "disabled" : ""}>${isLinked ? "Vinculado al grafo" : "Añadir al Knowledge Graph"}</button>
                <button class="btn-small btn-danger" type="button" data-remove-ioc="${esc(indicator.id)}">Eliminar</button>
            </div>
        </article>`;
}

export function renderIOCPanel(container, filters = {}) {
    const indicators = filterIndicators(filters);
    const all = filterIndicators();
    const graphEntityIds = new Set(getGraph().entities.map(entity => entity.id));
    container.innerHTML = `
        <section class="ioc-panel" aria-label="IOC Workspace">
            <header class="health-header">
                <h2>IOC Workspace</h2>
                <p>Indicadores locales: <strong>${all.length}</strong> · La información se guarda en este navegador.</p>
            </header>
            <details class="graph-example" ${all.length ? "" : "open"}>
                <summary>¿Para qué se usa? Ejemplo</summary>
                <p>Un <strong>IOC</strong> (indicador de compromiso) es un dato observable de una investigación: una IP, un dominio, una URL, un hash o un correo. El workspace sirve para no perder de vista de dónde salió cada indicador y qué falta confirmar antes de usarlo.</p>
                <ol>
                    <li>Registras el indicador con su tipo, fuente y una nota con la evidencia mínima.</li>
                    <li>Al revisarlo cambias el estado: <em>en revisión</em>, <em>confirmado</em>, <em>falso positivo</em> o <em>cerrado</em>.</li>
                    <li>Si es parte de una investigación, lo sumas al Knowledge Graph para relacionarlo con dominios, personas o empresas.</li>
                    <li>Exportas el JSON para compartir el set con otro analista o adjuntarlo a un caso.</li>
                </ol>
                <p>El ejemplo carga tres indicadores sintéticos de un caso ficticio, sin datos reales.</p>
                <button class="btn-small" type="button" data-load-example>Cargar ejemplo</button>
            </details>
            <form class="ioc-form" data-ioc-form>
                <label>Tipo
                    <select name="type" required>${IOC_TYPES.map(type => `<option value="${esc(type)}">${esc(type)}</option>`).join("")}</select>
                </label>
                <label>Indicador
                    <input name="value" maxlength="2048" placeholder="IP, dominio, URL, hash…" required>
                </label>
                <label>Fuente
                    <input name="source" maxlength="500" placeholder="URL, caso o analista">
                </label>
                <label>Confianza
                    <select name="confidence">${IOC_CONFIDENCE_LEVELS.map(value => `<option value="${value}" ${value === "media" ? "selected" : ""}>${esc(value)}</option>`).join("")}</select>
                </label>
                <label>Severidad
                    <select name="severity">${IOC_SEVERITIES.map(value => `<option value="${value}" ${value === "media" ? "selected" : ""}>${esc(SEVERITY_LABELS[value])}</option>`).join("")}</select>
                </label>
                <label class="ioc-notes">Notas
                    <textarea name="notes" maxlength="4000" rows="2" placeholder="Contexto y evidencia mínima"></textarea>
                </label>
                <button class="btn-small" type="submit">Registrar IOC</button>
            </form>
            <p class="ioc-error" role="alert"></p>
            <form class="ioc-filters" data-ioc-filters>
                <label>Buscar <input name="query" value="${esc(filters.query || "")}" placeholder="Valor, fuente o nota"></label>
                <label>Estado <select name="status"><option value="">Todos</option>${IOC_STATUSES.map(status => `<option value="${status}" ${filters.status === status ? "selected" : ""}>${STATUS_LABELS[status]}</option>`).join("")}</select></label>
                <label>Tipo <select name="type"><option value="">Todos</option>${IOC_TYPES.map(type => `<option value="${esc(type)}" ${filters.type === type ? "selected" : ""}>${esc(type)}</option>`).join("")}</select></label>
                <button class="btn-small" type="submit">Filtrar</button>
                <button class="btn-small" type="button" data-export-iocs>Exportar JSON</button>
            </form>
            <div class="ioc-list">${indicators.map(indicator => renderIndicator(indicator, graphEntityIds)).join("") || `<p class="collections-empty">${all.length ? "No hay IOC que coincidan con los filtros." : "Todavía no hay indicadores. Registra uno para empezar."}</p>`}</div>
        </section>`;

    const showError = error => { container.querySelector(".ioc-error").textContent = error.message; };
    container.querySelector("[data-load-example]").addEventListener("click", () => {
        const sample = [
            { type: "Dominio", value: "login-acme-secure.example", source: "Correo de phishing reportado", confidence: "alta", severity: "alta", notes: "Dominio del enlace recibido por un cliente del caso ficticio." },
            { type: "IPv4", value: "203.0.113.42", source: "Resolución DNS del dominio", confidence: "media", severity: "media", notes: "Infraestructura que aloja el dominio del ejemplo." },
            { type: "SHA-256", value: "9f2c1b7a4e5d6c8b0a1f3e2d4c5b6a79887766554433221100ffeeddccbbaa99", source: "Adjunto del correo", confidence: "alta", severity: "critica", notes: "Hash del archivo adjunto del ejemplo." }
        ];
        for (const indicator of sample) {
            try { addIndicator(indicator); } catch { /* el ejemplo ya estaba cargado */ }
        }
        renderIOCPanel(container, filters);
    });
    container.querySelector("[data-ioc-form]").addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
            addIndicator({
                type: data.get("type"), value: data.get("value"), source: data.get("source"),
                confidence: data.get("confidence"), severity: data.get("severity"), notes: data.get("notes")
            });
            renderIOCPanel(container);
        } catch (error) { showError(error); }
    });
    container.querySelector("[data-ioc-filters]").addEventListener("submit", event => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        renderIOCPanel(container, { query: data.get("query"), status: data.get("status"), type: data.get("type") });
    });
    container.querySelector("[data-export-iocs]").addEventListener("click", () => {
        const url = URL.createObjectURL(new Blob([exportIndicatorsJSON()], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "falcon-iocs.json";
        link.click();
        URL.revokeObjectURL(url);
    });
    container.querySelectorAll("[data-status]").forEach(select => {
        select.addEventListener("change", () => {
            updateIndicator(select.dataset.status, { status: select.value });
            renderIOCPanel(container, filters);
        });
    });
    container.querySelectorAll("[data-remove-ioc]").forEach(button => {
        button.addEventListener("click", () => {
            removeIndicator(button.dataset.removeIoc);
            renderIOCPanel(container, filters);
        });
    });
    container.querySelectorAll("[data-link-graph]").forEach(button => {
        button.addEventListener("click", () => {
            const indicator = all.find(item => item.id === button.dataset.linkGraph);
            if (!indicator) return;
            try {
                const entity = addEntity({ type: "IOC", value: `${indicator.type}: ${indicator.value}`, source: indicator.source });
                updateIndicator(indicator.id, { graphEntityId: entity.id });
                renderIOCPanel(container, filters);
            } catch (error) { showError(error); }
        });
    });
}
