/* ==========================================================
   Falcon Knowledge Graph - E9 (entidades y relaciones en localStorage)
   Tipos según ARCHITECTURE.md §15. Las relaciones son manuales y
   conservan una confianza explícita para no implicar certeza.
   ========================================================== */

const STORAGE_KEY = "falcon:graph";

export const ENTITY_TYPES = ["Persona", "Empresa", "Dominio", "Email", "Usuario", "Teléfono", "IOC"];
export const CONFIDENCE_LEVELS = ["baja", "media", "alta"];

let graph = readStored();

function readStored() {
    if (typeof localStorage === "undefined") return { entities: [], relations: [] };
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return {
            entities: Array.isArray(parsed.entities) ? parsed.entities : [],
            relations: Array.isArray(parsed.relations) ? parsed.relations : []
        };
    } catch {
        return { entities: [], relations: [] };
    }
}

function persist() {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
    }
}

function newId(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function getGraph() {
    return { entities: [...graph.entities], relations: [...graph.relations] };
}

export function addEntity({ type, value, source = "" }) {
    if (!ENTITY_TYPES.includes(type)) throw new Error(`Tipo no válido: ${type}`);
    const cleanValue = String(value ?? "").trim();
    if (!cleanValue) throw new Error("El valor de la entidad es obligatorio");
    const exists = graph.entities.find(e => e.type === type && e.value.toLowerCase() === cleanValue.toLowerCase());
    if (exists) return exists;
    const entity = { id: newId("ent"), type, value: cleanValue, source: String(source).trim() };
    graph.entities.push(entity);
    persist();
    return entity;
}

export function addRelation({ from, to, label, confidence = "media", source = "" }) {
    if (!graph.entities.some(e => e.id === from)) throw new Error(`Entidad origen desconocida: ${from}`);
    if (!graph.entities.some(e => e.id === to)) throw new Error(`Entidad destino desconocida: ${to}`);
    if (from === to) throw new Error("Una entidad no puede relacionarse consigo misma");
    if (!CONFIDENCE_LEVELS.includes(confidence)) throw new Error(`Confianza no válida: ${confidence}`);
    const cleanLabel = String(label ?? "").trim();
    if (!cleanLabel) throw new Error("La etiqueta de la relación es obligatoria");
    const relation = { id: newId("rel"), from, to, label: cleanLabel, confidence, source: String(source).trim() };
    graph.relations.push(relation);
    persist();
    return relation;
}

export function removeEntity(id) {
    graph.entities = graph.entities.filter(e => e.id !== id);
    graph.relations = graph.relations.filter(r => r.from !== id && r.to !== id);
    persist();
}

export function neighborsOf(id) {
    return graph.relations
        .filter(r => r.from === id || r.to === id)
        .map(r => {
            const otherId = r.from === id ? r.to : r.from;
            return { relation: r, entity: graph.entities.find(e => e.id === otherId) };
        })
        .filter(n => n.entity);
}
