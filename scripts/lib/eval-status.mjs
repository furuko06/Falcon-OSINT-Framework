/*
 * Classifies a real-model evaluation run.
 *
 * A provider that never answers (server down, model still downloading, wrong
 * OLLAMA_MODELS path, rejected key, quota) says nothing about Falcon answer
 * quality. Those runs are BLOCKED with the provider error preserved, so a
 * release gate is never failed by a broken local server. Answer-quality
 * failures with at least one successful call stay FAIL.
 */

const PROVIDER_ERROR_PATTERNS = [
    /El servidor local respondió 5\d{2}/i,
    /OpenRouter respondió 5\d{2}/i,
    /La clave no fue aceptada \(\d{3}\)/i,
    /no respondió a tiempo/i,
    /no such model|model .* not found|manifest not found/i,
    /manifest path .* resolves outside manifest directory/i,
    /fetch failed|ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|UND_ERR/i
];

export function isProviderUnavailable(message) {
    const text = String(message || "");
    return PROVIDER_ERROR_PATTERNS.some(pattern => pattern.test(text));
}

function shorten(message, max = 240) {
    const text = String(message || "").replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * @param {object} input
 * @param {Array<{error?: string}>} input.cases measured cases
 * @param {number} input.datasetSize total cases in the dataset
 * @param {string[]} input.failures threshold failures already detected
 * @param {boolean} input.exhausted true when the time budget cut the run short
 * @param {number} input.maxRealMs configured time budget
 * @returns {{status: "PASS"|"FAIL"|"BLOCKED", reason: string}}
 */
export function classifyRealRun({ cases = [], datasetSize = 0, failures = [], exhausted = false, maxRealMs = 0 }) {
    if (exhausted) {
        return {
            status: "BLOCKED",
            reason: `presupuesto de ${maxRealMs} ms agotado después de ${cases.length}/${datasetSize} casos`
        };
    }
    const errors = cases.filter(item => item.error);
    if (cases.length > 0 && errors.length === cases.length && errors.every(item => isProviderUnavailable(item.error))) {
        return {
            status: "BLOCKED",
            reason: `proveedor no utilizable en ${errors.length}/${cases.length} casos: ${shorten(errors[0].error)}`
        };
    }
    return { status: failures.length ? "FAIL" : "PASS", reason: "" };
}
