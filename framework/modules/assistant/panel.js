/* ==========================================================
   Falcon AI Assistant Panel - E12 (UI)
   ========================================================== */
import { Database } from "../../database/database.js";
import { LESSONS, LABS } from "../academy/academy.js";
import { PLAYBOOKS } from "../playbooks/playbooks.js";
import { getExternalProviders, openExternalProvider } from "./connectors.js";
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
    externalConsent: false,
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
        <section class="assistant-panel" aria-label="Asistente IA" aria-busy="${session.busy}">
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

            ${session.status ? `<p class="assistant-status" role="status" aria-live="polite">${esc(session.status)}</p>` : ""}
            ${session.error ? `<p class="ioc-error" role="alert">${esc(session.error)}</p>` : ""}
            ${toolError ? `<p class="ioc-error" role="alert">No se pudo leer el catálogo SQLite: ${esc(toolError)}</p>` : ""}

            ${!answer && !session.triage ? `
                <div class="assistant-empty">
                    <strong>Empezá por una pregunta o unas notas.</strong> La búsqueda cita el catálogo, la Academy y los playbooks;
                    no necesita red ni modelo.
                    <div class="assistant-examples">
                        <button class="assistant-example" type="button" data-example="¿Cómo verifico la fecha de un video viral?">Verificar un video</button>
                        <button class="assistant-example" type="button" data-example="¿Cómo geolocalizo una foto sin metadatos?">Geolocalizar una foto</button>
                        <button class="assistant-example" type="button" data-example="¿Qué herramientas reviso para una empresa?">Revisar una empresa</button>
                    </div>
                </div>` : ""}

            ${answer ? `
                <div class="assistant-output">
                    <div class="assistant-output-head">
                        <h3>${session.modelAnswer ? "Respuesta del modelo local" : "Respuesta local"}</h3>
                        <div class="assistant-output-tools">
                            <span class="assistant-badge">${session.modelAnswer ? "Modelo local · verificá las citas" : "Recuperación local · sin modelo"}</span>
                            <button class="btn-small" type="button" data-copy-answer>Copiar respuesta</button>
                        </div>
                    </div>
                    <pre class="assistant-answer">${esc(answer)}</pre>
                    ${renderSources(session.sources)}
                </div>` : ""}

            ${renderTriage(session.triage)}

            <details class="assistant-connectors">
                <summary>Proveedores externos: ChatGPT, Claude, Gemini y más</summary>
                <p class="assistant-warning">
                    Falcon no inicia sesión, no gestiona OAuth ni accede a Gmail. Cada botón abre el sitio del
                    proveedor en otra ventana y copia el prompt para que lo pegues allí. Si el proveedor ofrece
                    conectar una cuenta de Google, lo hará en su propio dominio y bajo sus términos.
                </p>
                <label class="assistant-external-consent">
                    <input type="checkbox" id="assistant-external-consent" ${session.externalConsent ? "checked" : ""}>
                    Entiendo que el prompt sale de Falcon y queda sujeto a la política del proveedor elegido
                </label>
                <div class="assistant-provider-grid">
                    ${getExternalProviders().map(provider => `
                        <button class="assistant-provider" type="button" data-provider="${esc(provider.id)}">
                            <span class="assistant-provider-initial" aria-hidden="true">${esc(provider.name.slice(0, 1))}</span>
                            <span>${esc(provider.name)}<small>${esc(provider.note)}</small></span>
                        </button>`).join("")}
                </div>
            </details>

            ${session.preview ? `
                <details class="assistant-preview" open>
                    <summary>Contexto exacto que se enviaría</summary>
                    <pre>${esc(session.preview)}</pre>
                </details>` : ""}

            <details class="assistant-config">
                <summary>Servidor local (Ollama)</summary>
                <p>Falcon no incluye un modelo. Instalá Ollama, descargá uno (<code>ollama pull qwen3.5:9b</code>) y dejalo corriendo.
                   Si el navegador bloquea la petición por CORS, reiniciá Ollama con el origen de Falcon, por ejemplo
                   <code>OLLAMA_ORIGINS=http://localhost:5173</code>.</p>
                <div class="assistant-config-row">
                    <label>Endpoint <input id="assistant-endpoint" value="${esc(settings.endpoint)}" spellcheck="false"></label>
                    <label>Modelo
                        <input id="assistant-model" value="${esc(settings.model)}" list="assistant-models" spellcheck="false">
                        <datalist id="assistant-models">
                            <option value="qwen3.5:9b">8–12 GB de VRAM · uso general</option>
                            <option value="gemma4:12b">12–16 GB de VRAM · multimodal</option>
                            <option value="qwen3.8:27b">24 GB de VRAM · razonamiento</option>
                            <option value="gemma4:e4b">8 GB de VRAM · equipo modesto</option>
                            <option value="llama3.2:3b">4–8 GB · alternativa ligera</option>
                        </datalist>
                    </label>
                    <button class="btn-small" type="button" data-save-config>Guardar</button>
                </div>
                <p class="collections-empty">Los tags de Ollama cambian: verificá el nombre en ollama.com. No hay proveedores remotos ni claves de API. Un modelo local sigue siendo falible: revisá cada cita.</p>
            </details>
        </section>`;

    const readForms = () => {
        session.question = container.querySelector("#assistant-question").value.slice(0, MAX_QUESTION_CHARS);
        session.notes = container.querySelector("#assistant-notes").value.slice(0, MAX_NOTES_CHARS);
        session.includeNotes = container.querySelector("#assistant-include-notes").checked;
        session.consent = container.querySelector("#assistant-consent").checked;
        session.externalConsent = container.querySelector("#assistant-external-consent").checked;
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
    const externalConsentInput = container.querySelector("#assistant-external-consent");

    const syncButtons = () => {
        container.querySelector("[data-ask]").disabled =
            session.busy || !consentInput.checked || !questionInput.value.trim();
        container.querySelector("[data-triage]").disabled = !notesInput.value.trim();
        container.querySelector("[data-preview]").disabled = !questionInput.value.trim();
        container.querySelectorAll("[data-provider]").forEach(button => {
            button.disabled = !externalConsentInput.checked || !questionInput.value.trim();
        });
    };

    questionInput.addEventListener("input", syncButtons);
    notesInput.addEventListener("input", syncButtons);
    consentInput.addEventListener("change", syncButtons);
    externalConsentInput.addEventListener("change", syncButtons);
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

    container.querySelectorAll("[data-example]").forEach(button => {
        button.addEventListener("click", () => {
            session.question = button.dataset.example;
            session.notes = "";
            session.triage = null;
            session.consent = false;
            session.error = "";
            session.status = "";
            prepare();
            rerender();
        });
    });

    const copyAnswerButton = container.querySelector("[data-copy-answer]");
    copyAnswerButton?.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(answer);
            session.status = "Respuesta copiada.";
            session.error = "";
        } catch {
            session.error = "No se pudo copiar la respuesta. Seleccionala y copiala manualmente.";
        }
        rerender();
    });

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

    container.querySelectorAll("[data-provider]").forEach(button => {
        button.addEventListener("click", async () => {
            readForms();
            if (!session.externalConsent || !session.question.trim()) return;

            const found = retrieve(documents, session.question);
            const { context } = buildContext(found);
            const prompt = buildPrompt({
                question: session.question,
                context,
                notes: session.includeNotes ? session.notes : ""
            });
            session.preview = prompt;
            session.externalConsent = false;
            session.error = "";

            try {
                const { provider, copied } = await openExternalProvider({ id: button.dataset.provider, prompt });
                session.status = copied
                    ? `Prompt copiado. Pegalo en ${provider.name}; Falcon no inicia sesión ni accede a Gmail.`
                    : `Abrí ${provider.name}, pero no se pudo copiar el prompt: copialo desde la previsualización.`;
            } catch (error) {
                session.error = error.message;
                session.status = "";
            }
            rerender();
        });
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
            externalConsent: false,
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
