/* ==========================================================
   Falcon Policies and Privacy panel
   Plain-language boundaries. The analyst remains responsible
   for lawful, ethical use and for what they send to an AI.
   ========================================================== */

export const POLICY_VERSION = "2026-11-13";
export const POLICY_ACK_KEY = "falcon:privacy-ack";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function readAck() {
    try {
        const parsed = JSON.parse(localStorage.getItem(POLICY_ACK_KEY) || "null");
        return parsed && parsed.accepted_at ? parsed : null;
    } catch {
        return null;
    }
}

export function renderPrivacyPanel(container) {
    const ack = readAck();

    container.innerHTML = `
        <section class="policy-panel" aria-label="Políticas y privacidad">
            <header class="health-header">
                <h2>Políticas y privacidad</h2>
                <p>Versión ${POLICY_VERSION}. Falcon es una herramienta local de apoyo; el uso y las decisiones son responsabilidad del usuario.</p>
            </header>

            <div class="policy-callout">
                <strong>Uso bajo tu responsabilidad.</strong>
                Verificá cada dato, respetá la ley aplicable, los términos de cada fuente y los derechos de las personas.
                Falcon no autoriza accesos no consentidos, acoso, doxxing, evasión de controles ni uso ilegal.
            </div>

            <article class="policy-card">
                <h3>1. Qué guarda Falcon</h3>
                <p>Falcon funciona en tu navegador. Guarda en <code>localStorage</code> favoritos, colecciones, progreso de Academy,
                   IOCs, configuración del asistente y el historial de consultas IA con su entorno, fuentes y prompt exacto.</p>
                <p>La base del catálogo se descarga como archivo SQLite y se abre localmente. No hay cuentas de Falcon,
                   telemetría, analítica ni envío automático de datos.</p>
            </article>

            <article class="policy-card">
                <h3>2. Consultas a IA</h3>
                <p>La búsqueda local y el triage no usan red. Cuando consultás un modelo, el prompt —pregunta, fragmentos
                   citados y notas si las incluiste— sale hacia el proveedor elegido. OpenRouter procesa la consulta y la
                   envía al modelo seleccionado bajo sus propios términos y política de privacidad.</p>
                <p>La clave de OpenRouter se guarda sólo en <code>sessionStorage</code> de esta pestaña, se borra al cerrarla
                   y nunca se incluye en el backup. Falcon no recibe tu contraseña de OpenRouter ni accede a Gmail.</p>
                <p>El uso de OpenRouter puede tener costo según tu cuenta y el modelo. Revisá
                   <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer">privacidad</a> y
                   <a href="https://openrouter.ai/terms" target="_blank" rel="noopener noreferrer">términos</a> antes de usarlo.</p>
            </article>

            <article class="policy-card">
                <h3>3. Modelo local</h3>
                <p>Ollama se ejecuta en tu equipo y sólo se aceptan endpoints de loopback. Aun así, el modelo local puede
                   equivocarse: citá y verificá cada afirmación. Falcon no incluye modelos ni los descarga por vos.</p>
            </article>

            <article class="policy-card">
                <h3>4. Backups y datos sensibles</h3>
                <p>El backup JSON puede contener notas de caso, prompts, fuentes y el catálogo. Tratalo como evidencia
                   sensible: cifralo o guardalo en un medio controlado. Falcon no puede recuperar un backup perdido ni
                   garantizar la integridad de un archivo que salió de tu control.</p>
            </article>

            <article class="policy-card">
                <h3>5. Límites y responsabilidad</h3>
                <p>Falcon se entrega “tal cual”, sin garantías de disponibilidad, exactitud o idoneidad para un fin
                   particular. Las decisiones investigativas, legales, periodísticas o de seguridad son tuyas. En la máxima
                   medida permitida por la ley, los autores no responden por daños derivados del uso, de datos de terceros
                   ni de decisiones tomadas a partir de la herramienta.</p>
                <p>No uses Falcon para vigilar personas sin base legal, obtener acceso no autorizado, eludir autenticación
                   o paywalls, ni para acosar. Cuando corresponda, consultá a un profesional legal.</p>
            </article>

            <article class="policy-card">
                <h3>6. Borrar tus datos</h3>
                <p>Podés borrar el historial IA desde Ajustes, desconectar OpenRouter desde el asistente y limpiar los datos
                   del sitio desde tu navegador. Exportá un backup antes de borrar. Falcon no conserva copias remotas.</p>
            </article>

            <article class="policy-card">
                <h3>7. Cambios</h3>
                <p>Esta política puede cambiar con el proyecto. La versión aceptada y la fecha quedan registradas localmente;
                   si cambia la versión, se te pedirá una nueva aceptación.</p>
            </article>

            <div class="policy-ack">
                <p>${ack
                    ? `Aceptaste la versión ${esc(ack.version)} el ${esc(new Date(ack.accepted_at).toLocaleString())}.`
                    : "Todavía no registraste la aceptación en este navegador."}</p>
                <div class="settings-actions">
                    <button class="btn-small" type="button" data-accept-policy>Acepto y registro la fecha</button>
                    <button class="btn-small" type="button" data-remove-policy ${ack ? "" : "disabled"}>Borrar acuse</button>
                </div>
                <p class="collections-empty">Registrar la aceptación no sustituye el consentimiento que exige cada proveedor externo.</p>
            </div>
        </section>`;

    container.querySelector("[data-accept-policy]").addEventListener("click", () => {
        localStorage.setItem(POLICY_ACK_KEY, JSON.stringify({
            version: POLICY_VERSION,
            accepted_at: new Date().toISOString()
        }));
        renderPrivacyPanel(container);
    });

    container.querySelector("[data-remove-policy]").addEventListener("click", () => {
        localStorage.removeItem(POLICY_ACK_KEY);
        renderPrivacyPanel(container);
    });
}
