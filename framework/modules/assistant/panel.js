/* ==========================================================
   Falcon AI Assistant Panel - E12 (UI)
   ========================================================== */
import { Database } from "../../database/database.js";
import { LESSONS, LABS } from "../academy/academy.js";
import { PLAYBOOKS } from "../playbooks/playbooks.js";
import {
    MAX_QUESTION_CHARS,
    MAX_NOTES_CHARS,
    askOllama,
    auditNotes,
    buildContext,
    buildDocuments,
    buildPrompt,
    loadAssistantSettings,
    offlineAnswer,
    retrieve,
    saveAssistantSettings
} from "./assistant.js";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

let settings = loadAssistantSettings();
let session = {
    question: "",
    notes: "",
    includeNotes: settings.includeNotes,
    consent: false,
    sources: [],
    offline: "",
    modelAnswer: "",
    triage: null,
    preview: "",
    error: "",
    status: "",
    busy: false
};

function renderSources(sources) {
    if (sources.length === 0) return "";
    return `
        <h4>Fuentes locales usadas</h4>
        <ol class="assistant-sources">
            ${sources.map(source => `
                <li>
                    <span class="badge">${esc(source.kind)}</span>
                    ${source.url
                        ? `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`
                        : esc(source.title)}
                </li>`).join("")}
        </ol>`;
}

function renderTriage(triage) {
    if (!triage) return "";
    return `
        <div class="assistant-triage">
            <h4>Triage de notas</h4>
            <ul class="assistant-checks">
                ${triage.checks.map(check => `<li>${check.passed ? "✓" : "✘"} ${esc(check.label)}</li>`).join("")}
            </ul>
            ${triage.summary ? `<p><strong>Resumen extractivo:</strong> ${esc(triage.summary)}</p>` : ""}
            ${triage.suggestions.length
                ? `<ul>${triage.suggestions.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`
                : `<p class="collections-empty">Las notas tienen procedencia, fecha y confianza declaradas.</p>`}
        </div>`;
}

export async function renderAssistantPanel(container) {
    let tools = [];
    let toolError = "";
    try {
        tools = await Database.query("SELECT name, category, subcategory, description, website FROM tools ORDER BY quality_score DESC");
    } catch (error) {
        toolError = error.message;
    }

    const documents = buildDocuments({ tools, lessons: LESSONS, labs: LABS, playbooks: PLAYBOOKS });
    const answer = session.modelAnswer || session.offline;

    container.innerHTML = `
        <section class="assistant-panel" aria-label="Asistente IA">
            <header class="health-header">
                <h2>Asistente IA</h2>
                <p>Recuperación local sobre ${documents.length} entradas de catálogo, Academy y Playbooks. El modelo es opcional y sólo puede ser local.</p>
            </header>

            <div class="assistant-privacy">
                <strong>Qué sale de este navegador:</strong> nada hasta que pulses “Preguntar al modelo local”.
                La búsqueda y el triage funcionan sin red. Sólo se envía la pregunta, hasta 6 fragmentos locales citados
                y —si lo marcás— las notas del caso. El endpoint debe ser <code>localhost</code>, <code>127.0.0.1</code> o <code>::1</code>.
            </div>

            <label class="assistant-field">Pregunta
                <textarea id="assistant-question" rows="3" maxlength="${MAX_QUESTION_CHARS}"
                    placeholder="Ej.: ¿qué pasos y herramientas uso para verificar la fecha de un video?">${esc(session.question)}</textarea>
            </label>

            <label class="assistant-field">Notas del caso (no se guardan en disco)
                <textarea id="assistant-notes" rows="4" maxlength="${MAX_NOTES_CHARS}"
                    placeholder="Hallazgos, fuentes y dudas abiertas">${esc(session.notes)}</textarea>
            </label>

            <div class="assistant-options">
                <label><input type="checkbox" id="assistant-include-notes" ${session.includeNotes ? "checked" : ""}>
                    Incluir estas notas en el contexto del modelo</label>
                <label><input type="checkbox" id="assistant-consent" ${session.consent ? "checked" : ""}>
                    Autorizo enviar esta consulta al servidor local configurado</label>
            </div>

            <div class="assistant-actions">
                <button class="btn-small" type="button" data-search ${session.busy ? "disabled" : ""}>Buscar en Falcon</button>
                <button class="btn-small" type="button" data-ask>Preguntar al modelo local</button>
                <button class="btn-small" type="button" data-triage>Analizar notas</button>
                <button class="btn-small" type="button" data-preview>Previsualizar contexto</button>
                <button class="btn-small" type="button" data-clear>Limpiar</button>
            </div>

            ${session.status ? `<p class="assistant-status" role="status">${esc(session.status)}</p>` : ""}
            ${session.error ? `<p class="ioc-error" role="alert">${esc(session.error)}</p>` : ""}
            ${toolError ? `<p class="ioc-error" role="alert">No se pudo leer el catálogo SQLite: ${esc(toolError)}</p>` : ""}

            ${answer ? `
                <div class="assistant-output">
                    <h3>${session.modelAnswer ? "Respuesta del modelo local" : "Respuesta local"}</h3>
                    <pre class="assistant-answer">${esc(answer)}</pre>
                    ${renderSources(session.sources)}
                </div>` : ""}

            ${renderTriage(session.triage)}

            ${session.preview ? `
                <details class="assistant-preview" open>
                    <summary>Contexto exacto que se enviaría</summary>
                    <pre>${esc(session.preview)}</pre>
                </details>` : ""}

            <details class="assistant-config">
                <summary>Servidor local (Ollama)</summary>
                <p>Falcon no incluye un modelo. Instalá Ollama, descargá uno (<code>ollama pull llama3.2</code>) y dejalo corriendo.
                   Si el navegador bloquea la petición por CORS, reiniciá Ollama con el origen de Falcon, por ejemplo
                   <code>OLLAMA_ORIGINS=http://localhost:5173</code>.</p>
                <div class="assistant-config-row">
                    <label>Endpoint <input id="assistant-endpoint" value="${esc(settings.endpoint)}" spellcheck="false"></label>
                    <label>Modelo <input id="assistant-model" value="${esc(settings.model)}" spellcheck="false"></label>
                    <button class="btn-small" type="button" data-save-config>Guardar</button>
                </div>
                <p class="collections-empty">No hay proveedores remotos ni claves de API. Un modelo local sigue siendo falible: revisá cada cita.</p>
            </details>
        </section>`;

    const readForms = () => {
        session.question = container.querySelector("#assistant-question").value.slice(0, MAX_QUESTION_CHARS);
        session.notes = container.querySelector("#assistant-notes").value.slice(0, MAX_NOTES_CHARS);
        session.includeNotes = container.querySelector("#assistant-include-notes").checked;
        session.consent = container.querySelector("#assistant-consent").checked;
        settings = {
            endpoint: container.querySelector("#assistant-endpoint").value.trim(),
            model: container.querySelector("#assistant-model").value.trim(),
            includeNotes: session.includeNotes
        };
    };

    const rerender = () => renderAssistantPanel(container);

    const questionInput = container.querySelector("#assistant-question");
    const notesInput = container.querySelector("#assistant-notes");
    const consentInput = container.querySelector("#assistant-consent");

    const syncButtons = () => {
        container.querySelector("[data-ask]").disabled =
            session.busy || !consentInput.checked || !questionInput.value.trim();
        container.querySelector("[data-triage]").disabled = !notesInput.value.trim();
        container.querySelector("[data-preview]").disabled = !questionInput.value.trim();
    };

    questionInput.addEventListener("input", syncButtons);
    notesInput.addEventListener("input", syncButtons);
    consentInput.addEventListener("change", syncButtons);
    syncButtons();

    const prepare = () => {
        const found = retrieve(documents, session.question || session.notes);
        const { context, sources } = buildContext(found);
        session.sources = sources;
        session.offline = offlineAnswer(session.question || session.notes, found);
        session.modelAnswer = "";
        session.preview = "";
        session.error = "";
        return { found, context, sources };
    };

    container.querySelector("[data-search]").addEventListener("click", () => {
        readForms();
        saveAssistantSettings(settings);
        if (!session.question.trim() && !session.notes.trim()) {
            session.error = "Escribí una pregunta o unas notas para buscar.";
            return rerender();
        }
        prepare();
        session.triage = null;
        session.status = "";
        rerender();
    });

    container.querySelector("[data-triage]").addEventListener("click", () => {
        readForms();
        saveAssistantSettings(settings);
        session.triage = auditNotes(session.notes);
        session.modelAnswer = "";
        session.error = "";
        rerender();
    });

    container.querySelector("[data-preview]").addEventListener("click", () => {
        readForms();
        saveAssistantSettings(settings);
        const { context } = prepare();
        session.preview = buildPrompt({
            question: session.question,
            context,
            notes: session.includeNotes ? session.notes : ""
        });
        rerender();
    });

    container.querySelector("[data-ask]").addEventListener("click", async () => {
        readForms();
        saveAssistantSettings(settings);
        if (!session.consent || !session.question.trim()) return;

        const { context } = prepare();
        const prompt = buildPrompt({
            question: session.question,
            context,
            notes: session.includeNotes ? session.notes : ""
        });
        session.preview = prompt;
        session.status = `Consultando ${settings.model || "el modelo local"}…`;
        session.busy = true;
        await rerender();

        try {
            const result = await askOllama({
                endpoint: settings.endpoint,
                model: settings.model,
                prompt,
                allowNetwork: true
            });
            session.modelAnswer = result.text;
            session.status = `Respuesta generada por ${result.model}. Verificá cada cita.`;
        } catch (error) {
            session.error = error.message;
            session.status = "";
            session.modelAnswer = "";
        } finally {
            session.busy = false;
            // Consent applies to one query only: a new call requires a new opt-in.
            session.consent = false;
            await rerender();
        }
    });

    container.querySelector("[data-save-config]").addEventListener("click", () => {
        readForms();
        try {
            saveAssistantSettings(settings);
            session.status = "Configuración guardada en este navegador.";
            session.error = "";
        } catch (error) {
            session.error = error.message;
        }
        rerender();
    });

    container.querySelector("[data-clear]").addEventListener("click", () => {
        session = {
            question: "",
            notes: "",
            includeNotes: settings.includeNotes,
            consent: false,
            sources: [],
            offline: "",
            modelAnswer: "",
            triage: null,
            preview: "",
            error: "",
            status: "",
            busy: false
        };
        rerender();
    });
}
