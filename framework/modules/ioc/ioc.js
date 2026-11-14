/* ==========================================================
   Falcon IOC Workspace - E10
   Indicadores locales con estados, severidad y procedencia.
   ========================================================== */

const STORAGE_KEY = "falcon:iocs";

export const IOC_TYPES = ["IPv4", "IPv6", "Dominio", "URL", "Email", "SHA-256", "Usuario", "Otro"];
export const IOC_STATUSES = ["nuevo", "en_revision", "confirmado", "falso_positivo", "cerrado"];
export const IOC_SEVERITIES = ["baja", "media", "alta", "critica"];
export const IOC_CONFIDENCE_LEVELS = ["baja", "media", "alta"];

function readStored() {
    if (typeof localStorage === "undefined") return [];
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

let indicators = readStored();

function persist() {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(indicators));
    }
}

function normalizeValue(value) {
    return String(value ?? "").trim();
}

function validatePatchValue(value, allowedValues, label) {
    if (value !== undefined && !allowedValues.includes(value)) {
        throw new Error(`${label} no válida: ${value}`);
    }
}

export function getIndicators() {
    return indicators.map(indicator => ({ ...indicator }));
}

export function addIndicator({ type, value, source = "", confidence = "media", severity = "media", notes = "" }, at = new Date().toISOString()) {
    if (!IOC_TYPES.includes(type)) throw new Error(`Tipo IOC no válido: ${type}`);
    if (!IOC_SEVERITIES.includes(severity)) throw new Error(`Severidad no válida: ${severity}`);
    if (!IOC_CONFIDENCE_LEVELS.includes(confidence)) throw new Error(`Confianza no válida: ${confidence}`);
    const cleanValue = normalizeValue(value);
    if (!cleanValue) throw new Error("El valor del IOC es obligatorio");
    if (cleanValue.length > 2048) throw new Error("El valor del IOC supera los 2048 caracteres");

    const duplicate = indicators.find(indicator =>
        indicator.type === type && indicator.value.toLowerCase() === cleanValue.toLowerCase()
    );
    if (duplicate) throw new Error("Este IOC ya existe en el workspace");

    const indicator = {
        id: `ioc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        type,
        value: cleanValue,
        source: normalizeValue(source),
        confidence,
        severity,
        status: "nuevo",
        notes: String(notes ?? "").trim(),
        createdAt: at,
        updatedAt: at
    };
    indicators = [indicator, ...indicators];
    persist();
    return { ...indicator };
}

export function updateIndicator(id, patch, at = new Date().toISOString()) {
    const current = indicators.find(indicator => indicator.id === id);
    if (!current) throw new Error(`IOC desconocido: ${id}`);

    const updated = { ...current };
    validatePatchValue(patch.status, IOC_STATUSES, "Estado IOC");
    validatePatchValue(patch.severity, IOC_SEVERITIES, "Severidad");
    validatePatchValue(patch.confidence, IOC_CONFIDENCE_LEVELS, "Confianza");
    if (patch.status !== undefined) updated.status = patch.status;
    if (patch.severity !== undefined) updated.severity = patch.severity;
    if (patch.confidence !== undefined) updated.confidence = patch.confidence;
    if (patch.source !== undefined) updated.source = normalizeValue(patch.source);
    if (patch.notes !== undefined) updated.notes = String(patch.notes ?? "").trim();
    if (patch.graphEntityId !== undefined) updated.graphEntityId = normalizeValue(patch.graphEntityId);
    updated.updatedAt = at;
    indicators = indicators.map(indicator => indicator.id === id ? updated : indicator);
    persist();
    return { ...updated };
}

export function removeIndicator(id) {
    const existing = indicators.some(indicator => indicator.id === id);
    if (!existing) return false;
    indicators = indicators.filter(indicator => indicator.id !== id);
    persist();
    return true;
}

export function filterIndicators({ query = "", status = "", type = "" } = {}) {
    const normalizedQuery = String(query).trim().toLowerCase();
    return getIndicators().filter(indicator => {
        if (status && indicator.status !== status) return false;
        if (type && indicator.type !== type) return false;
        if (!normalizedQuery) return true;
        return [indicator.type, indicator.value, indicator.source, indicator.notes]
            .some(value => value.toLowerCase().includes(normalizedQuery));
    });
}

export function exportIndicatorsJSON() {
    return JSON.stringify({ exportedAt: new Date().toISOString(), indicators: getIndicators() }, null, 2);
}
