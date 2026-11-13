/* ==========================================================
   Falcon Collections - E3 (Vault personal, persistido en localStorage)
   ========================================================== */

const STORAGE_KEY = "falcon:collections";
const listeners = new Set();

function nowIso() {
    return new Date().toISOString();
}

function newId() {
    return `col_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeTags(tags) {
    const list = Array.isArray(tags) ? tags : String(tags || "").split(",");
    return [...new Set(list.map(t => String(t).trim().toLowerCase()).filter(Boolean))];
}

function readStored() {
    if (typeof localStorage === "undefined") return [];
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

let collections = readStored();

function persist() {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    }
    listeners.forEach(fn => fn(collections));
}

export function subscribeCollections(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

export function getCollections() {
    return collections;
}

export function createCollection({ name, description = "", tags = [] }) {
    const trimmed = String(name || "").trim();
    if (!trimmed) throw new Error("El nombre es obligatorio");
    const created = nowIso();
    const collection = {
        id: newId(),
        name: trimmed,
        description: String(description).trim(),
        tags: normalizeTags(tags),
        notes: "",
        toolIds: [],
        createdAt: created,
        updatedAt: created
    };
    collections = [...collections, collection];
    persist();
    return collection;
}

function updateCollection(id, patch) {
    collections = collections.map(c =>
        c.id === id ? { ...c, ...patch, updatedAt: nowIso() } : c
    );
    persist();
}

export function renameCollection(id, name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) throw new Error("El nombre es obligatorio");
    updateCollection(id, { name: trimmed });
}

export function setCollectionTags(id, tags) {
    updateCollection(id, { tags: normalizeTags(tags) });
}

export function setCollectionNotes(id, notes) {
    updateCollection(id, { notes: String(notes) });
}

export function toggleToolInCollection(id, toolId) {
    const key = String(toolId);
    const col = collections.find(c => c.id === id);
    if (!col) return;
    const toolIds = col.toolIds.includes(key)
        ? col.toolIds.filter(t => t !== key)
        : [...col.toolIds, key];
    updateCollection(id, { toolIds });
}

export function deleteCollection(id) {
    collections = collections.filter(c => c.id !== id);
    persist();
}

export function collectionsContaining(toolId) {
    const key = String(toolId);
    return collections.filter(c => c.toolIds.includes(key));
}

export function exportCollectionJSON(col, tools) {
    const byId = new Map(tools.map(t => [String(t.id), t]));
    return JSON.stringify({
        ...col,
        tools: col.toolIds.map(id => byId.get(id)).filter(Boolean)
    }, null, 2);
}

export function exportCollectionMarkdown(col, tools) {
    const byId = new Map(tools.map(t => [String(t.id), t]));
    const lines = [`# ${col.name}`, ""];
    if (col.description) lines.push(col.description, "");
    if (col.tags.length) lines.push(`Tags: ${col.tags.join(", ")}`, "");
    lines.push("## Herramientas", "");
    for (const id of col.toolIds) {
        const t = byId.get(id);
        if (!t) continue;
        const link = t.website || (t.github ? (t.github.startsWith("http") ? t.github : `https://github.com/${t.github}`) : "");
        lines.push(`- **${t.name}** (${t.category || "sin categoría"})${link ? ` — ${link}` : ""}`);
        if (t.description) lines.push(`  ${t.description}`);
    }
    if (col.notes) lines.push("", "## Notas", "", col.notes);
    return lines.join("\n") + "\n";
}

export function downloadText(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
