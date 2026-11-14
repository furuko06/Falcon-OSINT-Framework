/* ==========================================================
   Falcon Plugin SDK - E4
   Manifest validation and local install/update/remove.
   Plugins are declarative: their code is never executed here.
   ========================================================== */

// Must match package.json: a stale value rejects valid manifests that require
// the current release. tests/contracts.test.js keeps both in sync.
export const FRAMEWORK_VERSION = "1.0.0";
export const PERMISSIONS = ["filesystem", "network", "sqlite", "docker", "shell"];

const STORAGE_KEY = "falcon:plugins";
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,63}$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;

function parseVersion(v) {
    return String(v).split(".").map(n => Number(n));
}

export function compareVersions(a, b) {
    const pa = parseVersion(a);
    const pb = parseVersion(b);
    for (let i = 0; i < 3; i++) {
        if (pa[i] !== pb[i]) return pa[i] - pb[i];
    }
    return 0;
}

export function validateManifest(manifest) {
    const errors = [];
    if (!manifest || typeof manifest !== "object") {
        return { ok: false, errors: ["El manifest debe ser un objeto"] };
    }
    if (!ID_PATTERN.test(String(manifest.id || ""))) {
        errors.push("id debe ser un slug en minúsculas (2 a 64 caracteres)");
    }
    if (!String(manifest.name || "").trim()) errors.push("name es obligatorio");
    if (!SEMVER_PATTERN.test(String(manifest.version || ""))) {
        errors.push("version debe tener formato x.y.z");
    }
    if (!String(manifest.author || "").trim()) errors.push("author es obligatorio");
    if (!String(manifest.license || "").trim()) errors.push("license es obligatoria");
    if (!SEMVER_PATTERN.test(String(manifest.minFramework || ""))) {
        errors.push("minFramework debe tener formato x.y.z");
    } else if (compareVersions(manifest.minFramework, FRAMEWORK_VERSION) > 0) {
        errors.push(`requiere Falcon ${manifest.minFramework} o superior (actual ${FRAMEWORK_VERSION})`);
    }
    if (!Array.isArray(manifest.permissions)) {
        errors.push("permissions debe ser una lista");
    } else {
        const unknown = manifest.permissions.filter(p => !PERMISSIONS.includes(p));
        if (unknown.length) errors.push(`permisos desconocidos: ${unknown.join(", ")}`);
    }
    return { ok: errors.length === 0, errors };
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

function writeStored(plugins) {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plugins));
    }
}

export function listInstalledPlugins() {
    return readStored();
}

export function getInstalledPlugin(id) {
    return readStored().find(p => p.id === id) || null;
}

/**
 * Installs a plugin. The caller must pass the exact permissions the user
 * accepted; if they do not match the manifest, installation is refused.
 */
export function installPlugin(manifest, acceptedPermissions) {
    const check = validateManifest(manifest);
    if (!check.ok) throw new Error(check.errors.join("; "));

    const declared = [...manifest.permissions].sort().join(",");
    const accepted = [...(acceptedPermissions || [])].sort().join(",");
    if (declared !== accepted) {
        throw new Error("Debes aceptar exactamente los permisos declarados");
    }
    if (getInstalledPlugin(manifest.id)) {
        throw new Error(`El plugin ${manifest.id} ya está instalado; usa updatePlugin`);
    }

    const entry = { ...manifest, installedAt: new Date().toISOString() };
    writeStored([...readStored(), entry]);
    return entry;
}

export function updatePlugin(manifest, acceptedPermissions) {
    const current = getInstalledPlugin(manifest?.id);
    if (!current) throw new Error("El plugin no está instalado");
    const check = validateManifest(manifest);
    if (!check.ok) throw new Error(check.errors.join("; "));
    if (compareVersions(manifest.version, current.version) <= 0) {
        throw new Error("La nueva versión debe ser mayor que la instalada");
    }
    removePlugin(manifest.id);
    return installPlugin(manifest, acceptedPermissions);
}

export function removePlugin(id) {
    writeStored(readStored().filter(p => p.id !== id));
}
