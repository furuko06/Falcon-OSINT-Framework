/* ==========================================================
   Falcon Playbooks Panel - E8 (UI)
   Lista de investigaciones con pasos, checklist y estado.
   ========================================================== */
import {
    PLAYBOOKS,
    TACTICS,
    getPlaybook,
    getProgress,
    setPlaybookState,
    togglePlaybookFavorite,
    toggleChecklistItem
} from "./playbooks.js";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

const STATE_LABELS = { in_progress: "En progreso", completed: "Completado" };

function renderItem(p, selectedId) {
    const prog = getProgress(p.id);
    return `
        <button class="sidebar-item ${p.id === selectedId ? "active" : ""}" data-playbook="${esc(p.id)}">
            <span>${prog.favorite ? "★ " : ""}${esc(p.title)}</span>
            <span class="count">${prog.state ? esc(STATE_LABELS[prog.state]) : "—"}</span>
        </button>`;
}

function renderList(selectedId) {
    return TACTICS.map(t => {
        const items = PLAYBOOKS.filter(p => p.tactic === t.id);
        if (items.length === 0) return "";
        return `
            <h4 class="playbook-tactic">${esc(t.title)}</h4>
            ${items.map(p => renderItem(p, selectedId)).join("")}`;
    }).join("");
}

function renderDetail(playbook) {
    const prog = getProgress(playbook.id);
    return `
        <article class="playbook-detail">
            <h3>${esc(playbook.title)}</h3>
            <p>${esc(playbook.objective)}</p>
            <h4>Requisitos</h4>
            <ul>${playbook.requirements.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
            <h4>Pasos</h4>
            <ol>${playbook.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
            <h4>Checklist</h4>
            <ul class="playbook-checklist">
                ${playbook.checklist.map(item => `
                    <li><label>
                        <input type="checkbox" data-check="${esc(item)}" ${prog.checked.includes(item) ? "checked" : ""}>
                        ${esc(item)}
                    </label></li>`).join("")}
            </ul>
            <h4>Herramientas</h4>
            <ul>${(playbook.tools || []).map(t => `<li><a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">${esc(t.name)}</a></li>`).join("")}</ul>
            <h4>Recursos</h4>
            <ul>${playbook.resources.map(r => `<li>${esc(r)}</li>`).join("")}</ul>
            <div class="playbook-actions">
                <button class="btn-small" data-state="in_progress" aria-pressed="${prog.state === "in_progress"}">En progreso</button>
                <button class="btn-small" data-state="completed" aria-pressed="${prog.state === "completed"}">Completado</button>
                <button class="btn-small" data-favorite aria-pressed="${prog.favorite}">${prog.favorite ? "★ Favorito" : "☆ Favorito"}</button>
            </div>
        </article>`;
}

export function renderPlaybooksPanel(container, selectedId = PLAYBOOKS[0].id) {
    const playbook = getPlaybook(selectedId) || PLAYBOOKS[0];

    container.innerHTML = `
        <section class="playbooks-panel" aria-label="Playbooks">
            <header class="health-header">
                <h2>Playbooks</h2>
                <p>Investigaciones paso a paso.</p>
            </header>
            <div class="playbooks-layout">
                <nav class="playbooks-list">${renderList(playbook.id)}</nav>
                ${renderDetail(playbook)}
            </div>
        </section>`;

    container.querySelectorAll("[data-playbook]").forEach(btn => {
        btn.addEventListener("click", () => {
            renderPlaybooksPanel(container, btn.dataset.playbook);
            container.querySelector(".playbook-detail")?.scrollIntoView({ block: "start", behavior: "smooth" });
        });
    });

    container.querySelectorAll("[data-state]").forEach(btn => {
        btn.addEventListener("click", () => {
            const current = getProgress(playbook.id).state;
            const next = current === btn.dataset.state ? null : btn.dataset.state;
            setPlaybookState(playbook.id, next);
            renderPlaybooksPanel(container, playbook.id);
        });
    });

    container.querySelector("[data-favorite]").addEventListener("click", () => {
        togglePlaybookFavorite(playbook.id);
        renderPlaybooksPanel(container, playbook.id);
    });

    container.querySelectorAll("[data-check]").forEach(input => {
        input.addEventListener("change", () => {
            toggleChecklistItem(playbook.id, input.dataset.check);
            renderPlaybooksPanel(container, playbook.id);
        });
    });
}
