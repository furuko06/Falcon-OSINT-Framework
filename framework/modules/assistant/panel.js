/* ==========================================================
   Falcon AI Assistant Panel - E12 (UI)
   ========================================================== */
import { Database } from "../../database/database.js";
import { LESSONS, LABS } from "../academy/academy.js";
import { PLAYBOOKS } from "../playbooks/playbooks.js";
import { buildEnvironment, buildQueryEnvelope, recordQuery } from "./context.js";
import {
    DEFAULT_MODEL,
    askOpenRouter,
    beginAuth,
    cachedModels,
    clearModelsCache,
    disconnect,
    fetchModels,
    loadConnection,
    loadPending,
    maskKey,
    takeAuthError,
    testConnection,
    updateConnectionModel
} from "./openrouter.js";
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

const APP_VERSION = "0.6.0-beta";

let settings = loadAssistantSettings();
let session = {
    question: "",
    notes: "",
    includeNotes: settings.includeNotes,
    consent: false,
    aiConsent: false,
    sources: [],
    offline: "",
    modelAnswer: "",
    answerProvider: "local",
    answerModel: "",
    schemaVersion: null,
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

    try {
        const info = await Database.getSchemaInfo();
        session.schemaVersion = info.version;
    } catch {
        session.schemaVersion = null;
    }

    const documents = buildDocuments({ tools, lessons: LESSONS, labs: LABS, playbooks: PLAYBOOKS });
    const connection = loadConnection();
    const pending = loadPending();
    const models = cachedModels() || [];
    const authError = takeAuthError();
    if (authError) session.error = authError;
    if (connection) session.schemaVersion = session.schemaVersion ?? null;
    const answer = session.modelAnswer || session.offline;
    const answerLabel = session.answerProvider === "openrouter"
        ? `OpenRouter · ${session.answerModel || connection?.model || DEFAULT_MODEL}`
        : session.modelAnswer
            ? "Modelo local · verificá las citas"
            : "Recuperación local · sin modelo";

    const modelList = models.length
        ? models
        : [{ id: connection?.model || DEFAULT_MODEL, name: connection?.model || DEFAULT_MODEL }];
    if (connection && !modelList.some(model => model.id === connection.model)) {
        modelList.unshift({ id: connection.model, name: `${connection.model} (actual)` });
    }

    container.innerHTML = `
        <section class="assistant-panel" aria-label="Asistente IA" aria-busy="${session.busy}">
            <header class="health-header">
                <h2>Asistente IA</h2>
                <p>Recuperación local sobre ${documents.length} entradas de catálogo, Academy y Playbooks. Conectá OpenRouter para consultar modelos reales con tu propia cuenta; el modelo local en Ollama sigue disponible.</p>
            </header>

            <div class="assistant-privacy">
                <strong>Qué sale de este navegador:</strong> nada hasta que consultes un modelo. La búsqueda y el triage
                funcionan sin red. Si consultás OpenRouter u Ollama se envía la pregunta, hasta 6 fragmentos locales
                citados y —si lo marcás— las notas del caso. El entorno y el contexto exacto quedan en el historial
                local y se incluyen en el backup.
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
                <button class="btn-small" type="button" data-ask-openrouter ${connection ? "" : "disabled"}>Preguntar a la IA conectada</button>
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
                        <h3>${session.answerProvider === "openrouter" ? "Respuesta de OpenRouter" : session.modelAnswer ? "Respuesta del modelo local" : "Respuesta local"}</h3>
                        <div class="assistant-output-tools">
                            <span class="assistant-badge">${esc(answerLabel)}</span>
                            <button class="btn-small" type="button" data-copy-answer>Copiar respuesta</button>
                        </div>
                    </div>
                    <pre class="assistant-answer">${esc(answer)}</pre>
                    ${renderSources(session.sources)}
                </div>` : ""}

            ${renderTriage(session.triage)}

            <details class="assistant-connectors" ${connection ? "open" : ""}>
                <summary>Conectar IA (OpenRouter OAuth)</summary>
                <p class="assistant-warning">
                    OpenRouter reúne modelos de OpenAI, Anthropic, Google, DeepSeek, Qwen, xAI, Mistral y más.
                    Autorizás en openrouter.ai y volvés a Falcon: la contraseña nunca pasa por esta aplicación.
                    Falcon no accede a Gmail ni guarda la clave en disco; vive sólo en esta pestaña.
                </p>
                ${connection ? `
                    <div class="assistant-connection">
                        <span class="assistant-badge">Conectado</span>
                        <code>${esc(maskKey(connection.key))}</code>
                        <span class="collections-empty">${esc(connection.label)} · ${esc(connection.connected_at || "sesión actual")}</span>
                    </div>
                    <div class="assistant-actions">
                        <button class="btn-small" type="button" data-test-openrouter>Probar conexión</button>
                        <button class="btn-small" type="button" data-disconnect>Desconectar</button>
                    </div>
                    <div class="assistant-config-row">
                        <label>Modelo
                            <select id="assistant-or-model">
                                ${modelList.map(model => `<option value="${esc(model.id)}" ${model.id === connection.model ? "selected" : ""}>${esc(model.name)}${model.context ? ` · ${Math.round(model.context / 1000)}k` : ""}${model.free ? " · gratis" : ""}</option>`).join("")}
                            </select>
                        </label>
                        <button class="btn-small" type="button" data-load-models>Actualizar modelos</button>
                    </div>
                    <p class="collections-empty">
                        La clave se guarda en <code>sessionStorage</code>: se borra al cerrar la pestaña y nunca entra en el backup.
                        El modelo paga con tus créditos de OpenRouter según sus términos.
                    </p>
                    <label class="assistant-external-consent">
                        <input type="checkbox" id="assistant-ai-consent" ${session.aiConsent ? "checked" : ""}>
                        Autorizo enviar esta consulta y su contexto a OpenRouter para esta ejecución
                    </label>
                ` : `
                    <p>Conectá una cuenta para probar la IA dentro de Falcon, sin copiar y pegar prompts.</p>
                    <button class="btn-small" type="button" data-connect-openrouter>Conectar con OpenRouter</button>
                    ${pending ? `<p class="assistant-status" role="status">Hay una autorización pendiente. Completala en OpenRouter o volvé a empezar.</p>` : ""}
                `}
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
        session.aiConsent = container.querySelector("#assistant-ai-consent")?.checked ?? false;
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
    const aiConsentInput = container.querySelector("#assistant-ai-consent");
    const activeConnection = loadConnection();

    const syncButtons = () => {
        container.querySelector("[data-ask]").disabled =
            session.busy || !consentInput.checked || !questionInput.value.trim();
        container.querySelector("[data-ask-openrouter]").disabled =
            session.busy || !activeConnection || !aiConsentInput?.checked || !questionInput.value.trim();
        container.querySelector("[data-triage]").disabled = !notesInput.value.trim();
        container.querySelector("[data-preview]").disabled = !questionInput.value.trim();
    };

    questionInput.addEventListener("input", syncButtons);
    notesInput.addEventListener("input", syncButtons);
    consentInput.addEventListener("change", syncButtons);
    aiConsentInput?.addEventListener("change", syncButtons);
    syncButtons();

    const prepare = () => {
        const found = retrieve(documents, session.question || session.notes);
        const { context, sources } = buildContext(found);
        session.sources = sources;
        session.offline = offlineAnswer(session.question || session.notes, found);
        session.modelAnswer = "";
        session.answerProvider = "local";
        session.answerModel = "";
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
            session.answerProvider = "local";
            session.answerModel = result.model;
            const envelope = buildQueryEnvelope({
                question: session.question,
                notes: session.notes,
                includeNotes: session.includeNotes,
                sources: session.sources,
                context,
                prompt,
                provider: "ollama",
                model: result.model,
                appVersion: APP_VERSION,
                schemaVersion: session.schemaVersion,
                environment: buildEnvironment()
            });
            recordQuery(envelope, { answer: result.text });
            session.status = `Respuesta generada por ${result.model}. Verificá cada cita. Se guardó el contexto en el historial local.`;
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

    container.querySelector("[data-connect-openrouter]")?.addEventListener("click", async () => {
        readForms();
        saveAssistantSettings(settings);
        session.error = "";
        session.status = "Redirigiendo a OpenRouter para autorizar…";
        try {
            await beginAuth();
        } catch (error) {
            session.error = error.message;
            session.status = "";
            rerender();
        }
    });

    container.querySelector("[data-test-openrouter]")?.addEventListener("click", async () => {
        const connection = loadConnection();
        if (!connection) return;
        session.busy = true;
        session.error = "";
        session.status = "Probando la conexión con OpenRouter…";
        await rerender();
        try {
            const info = await testConnection({ apiKey: connection.key });
            const limit = info.limit === null ? "sin límite declarado" : `límite ${info.limit}`;
            session.status = `Conexión OK: ${info.label}. Uso acumulado ${info.usage}; ${limit}${info.freeTier ? " · cuenta gratuita" : ""}.`;
        } catch (error) {
            session.error = error.message;
            session.status = "";
        } finally {
            session.busy = false;
            await rerender();
        }
    });

    container.querySelector("[data-disconnect]")?.addEventListener("click", () => {
        disconnect();
        clearModelsCache();
        session.aiConsent = false;
        session.error = "";
        session.status = "OpenRouter desconectado. La clave se borró de esta pestaña.";
        rerender();
    });

    container.querySelector("[data-load-models]")?.addEventListener("click", async () => {
        const connection = loadConnection();
        if (!connection) return;
        session.busy = true;
        session.error = "";
        session.status = "Cargando modelos disponibles…";
        await rerender();
        try {
            const models = await fetchModels({ apiKey: connection.key, useCache: false });
            session.status = `${models.length} modelos disponibles. El modelo actual es ${connection.model}.`;
        } catch (error) {
            session.error = error.message;
            session.status = "";
        } finally {
            session.busy = false;
            await rerender();
        }
    });

    container.querySelector("#assistant-or-model")?.addEventListener("change", event => {
        try {
            updateConnectionModel(event.target.value);
            session.status = `Modelo de OpenRouter actualizado a ${event.target.value}.`;
            session.error = "";
        } catch (error) {
            session.error = error.message;
        }
        rerender();
    });

    container.querySelector("[data-ask-openrouter]").addEventListener("click", async () => {
        readForms();
        saveAssistantSettings(settings);
        const connection = loadConnection();
        if (!connection || !session.aiConsent || !session.question.trim()) return;

        const { context } = prepare();
        const prompt = buildPrompt({
            question: session.question,
            context,
            notes: session.includeNotes ? session.notes : ""
        });
        session.preview = prompt;
        session.busy = true;
        session.status = `Consultando ${connection.model} en OpenRouter…`;
        await rerender();

        try {
            const result = await askOpenRouter({
                apiKey: connection.key,
                model: connection.model,
                prompt,
                allowNetwork: true
            });
            session.modelAnswer = result.text;
            session.answerProvider = "openrouter";
            session.answerModel = result.model;
            const envelope = buildQueryEnvelope({
                question: session.question,
                notes: session.notes,
                includeNotes: session.includeNotes,
                sources: session.sources,
                context,
                prompt,
                provider: "openrouter",
                model: result.model,
                appVersion: APP_VERSION,
                schemaVersion: session.schemaVersion,
                environment: buildEnvironment()
            });
            recordQuery(envelope, { answer: result.text });
            session.status = `Respuesta de ${result.model}. Contexto y entorno guardados en el historial local.`;
        } catch (error) {
            session.error = error.message;
            session.status = "";
            session.modelAnswer = "";
        } finally {
            session.busy = false;
            session.aiConsent = false;
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
            aiConsent: false,
            sources: [],
            offline: "",
            modelAnswer: "",
            answerProvider: "local",
            answerModel: "",
            triage: null,
            preview: "",
            error: "",
            status: "",
            busy: false
        };
        rerender();
    });
}
