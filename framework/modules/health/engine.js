/* ==========================================================
   Falcon Health Engine - E7
   Pure logic: score, indicators, community reports, broken detector
   and verification history. Persistence is localStorage only.
   ========================================================== */

export const INDICATORS = ["verified", "working", "beta", "deprecated", "broken", "archived"];

export const REPORT_TYPES = ["broken", "update"];

const STORAGE_KEY = "falcon:health";
const WEIGHTS = { verified: 100, working: 80, beta: 55, deprecated: 25, broken: 0, archived: 10 };
const DAY_MS = 86400000;

/** Normalizes a tool status into one of INDICATORS. */
export function indicatorFor(status) {
    const s = String(status || "").toLowerCase();
    return INDICATORS.includes(s) ? s : "beta";
}

function loadStore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : {};
        return { reports: data.reports || {}, history: data.history || {} };
    } catch {
        return { reports: {}, history: {} };
    }
}

function saveStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/** Community reports for a tool: counts of broken and update reports. */
export function getReports(toolId, store = loadStore()) {
    return store.reports[String(toolId)] || { broken: 0, update: 0 };
}

export function reportTool(toolId, type) {
    if (!REPORT_TYPES.includes(type)) throw new Error(`Tipo de reporte inválido: ${type}`);
    const store = loadStore();
    const id = String(toolId);
    const current = store.reports[id] || { broken: 0, update: 0 };
    store.reports[id] = { ...current, [type]: current[type] + 1 };
    saveStore(store);
    return store.reports[id];
}

/** Verification history: each entry is { at, status }. */
export function getHistory(toolId, store = loadStore()) {
    return store.history[String(toolId)] || [];
}

export function recordVerification(toolId, status, at = Date.now()) {
    const store = loadStore();
    const id = String(toolId);
    const list = store.history[id] || [];
    store.history[id] = [...list, { at, status: indicatorFor(status) }].slice(-50);
    saveStore(store);
    return store.history[id];
}

/**
 * Health score 0-100. Starts from the status weight, then penalizes
 * community reports (capped) and rewards a recent verification.
 */
export function healthScore(tool, { reports = { broken: 0, update: 0 }, history = [], now = Date.now() } = {}) {
    const indicator = indicatorFor(tool.status);
    let score = WEIGHTS[indicator];
    score -= Math.min(30, reports.broken * 10);
    score -= Math.min(10, reports.update * 2);
    const last = history[history.length - 1];
    if (last && now - last.at <= 30 * DAY_MS && last.status !== "broken") score += 5;
    return Math.max(0, Math.min(100, Math.round(score)));
}

/** Broken detector: a tool is flagged when its status is broken, or when
 *  the community reported it broken and it has no fresh working verification. */
export function detectBroken(tool, { reports = { broken: 0, update: 0 }, history = [], now = Date.now() } = {}) {
    if (indicatorFor(tool.status) === "broken") return true;
    const last = history[history.length - 1];
    const freshOk = last && now - last.at <= 30 * DAY_MS && last.status !== "broken";
    return reports.broken >= 2 && !freshOk;
}

/** Full health row for one tool. */
export function evaluateTool(tool, store = loadStore(), now = Date.now()) {
    const reports = getReports(tool.id, store);
    const history = getHistory(tool.id, store);
    return {
        id: tool.id,
        name: tool.name,
        status: indicatorFor(tool.status),
        score: healthScore(tool, { reports, history, now }),
        broken: detectBroken(tool, { reports, history, now }),
        reports,
        history
    };
}

/** Evaluates every tool; the table is sorted by score ascending so problems surface first. */
export function evaluateAll(tools, store = loadStore(), now = Date.now()) {
    return tools.map(t => evaluateTool(t, store, now)).sort((a, b) => a.score - b.score);
}
