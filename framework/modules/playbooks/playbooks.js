/* ==========================================================
   Falcon Playbooks - E8 (investigaciones paso a paso, estado en localStorage)
   ========================================================== */

const STORAGE_KEY = "falcon:playbooks";
export const PLAYBOOK_STATES = ["in_progress", "completed"];

export const PLAYBOOKS = [
    {
        id: "username",
        title: "Username Investigation",
        objective: "Encontrar presencia pública de un nombre de usuario.",
        requirements: ["Nombre de usuario a investigar", "Entorno con VPN o perfil de navegador aislado"],
        steps: [
            "Buscar el nombre exacto entre comillas en buscadores.",
            "Comprobar plataformas comunes con herramientas de enumeración offline.",
            "Registrar cada perfil encontrado con su URL y fecha de verificación.",
            "Contrastar foto, biografía y fechas para confirmar que es la misma persona."
        ],
        checklist: ["Búsqueda exacta", "Plataformas revisadas", "Perfiles registrados", "Correlación verificada"],
        resources: ["Explorer: categoría Username", "Collections: guardar hallazgos"]
    },
    {
        id: "email",
        title: "Email Investigation",
        objective: "Determinar a qué servicios y personas está asociado un correo.",
        requirements: ["Dirección de correo a investigar", "Permiso o base legal para la investigación"],
        steps: [
            "Verificar el dominio del correo y su proveedor.",
            "Comprobar si aparece en brechas públicas con herramientas de consulta.",
            "Buscar el correo entre comillas para localizar perfiles asociados.",
            "Documentar fuentes y el nivel de certeza de cada vínculo."
        ],
        checklist: ["Dominio verificado", "Brechas revisadas", "Vínculos documentados", "Certeza anotada"],
        resources: ["Explorer: categoría Email", "Health Engine: revisar herramientas rotas"]
    },
    {
        id: "domain",
        title: "Domain Enumeration",
        objective: "Enumerar la superficie pública de un dominio.",
        requirements: ["Dominio objetivo", "Autorización si el dominio no es propio"],
        steps: [
            "Consultar registros WHOIS e historial DNS.",
            "Listar subdominios con fuentes pasivas.",
            "Identificar tecnologías y certificados TLS públicos.",
            "Registrar hallazgos en el grafo de entidades (Knowledge Graph)."
        ],
        checklist: ["WHOIS revisado", "Subdominios listados", "Tecnologías identificadas", "Hallazgos registrados"],
        resources: ["Explorer: categoría Domain", "Knowledge Graph: entidad Dominio"]
    },
    {
        id: "telegram",
        title: "Telegram Investigation",
        objective: "Analizar canales y grupos públicos de Telegram con fines de investigación.",
        requirements: ["Canal o grupo público a analizar", "Cuenta de análisis separada del personal"],
        steps: [
            "Identificar el canal o grupo público y su fecha de creación.",
            "Revisar el historial de mensajes públicos y cambios de nombre.",
            "Mapear administradores públicos y canales relacionados.",
            "Guardar capturas y enlaces con fecha de recolección."
        ],
        checklist: ["Canal identificado", "Historial revisado", "Relaciones mapeadas", "Evidencia fechada"],
        resources: ["Explorer: categoría Messaging", "Collections: guardar evidencia"]
    },
    {
        id: "company",
        title: "Company Investigation",
        objective: "Reunir información pública sobre una empresa y su estructura.",
        requirements: ["Nombre legal de la empresa", "País de registro"],
        steps: [
            "Consultar el registro mercantil del país del Country Pack activo.",
            "Identificar directivos y propietarios públicos.",
            "Revisar dominios y perfiles corporativos.",
            "Relacionar personas, dominios y empresas en el grafo de entidades."
        ],
        checklist: ["Registro consultado", "Directivos identificados", "Dominios revisados", "Relaciones registradas"],
        resources: ["Country Packs: fuentes por país", "Knowledge Graph: entidad Empresa"]
    }
];

function readStored() {
    if (typeof localStorage === "undefined") return {};
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

let progress = readStored();

function persist() {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
}

export function getPlaybook(id) {
    return PLAYBOOKS.find(p => p.id === id) || null;
}

export function getProgress(id) {
    return progress[id] || { state: null, favorite: false, checked: [] };
}

export function setPlaybookState(id, state) {
    if (!getPlaybook(id)) throw new Error(`Playbook desconocido: ${id}`);
    if (state !== null && !PLAYBOOK_STATES.includes(state)) {
        throw new Error(`Estado no válido: ${state}`);
    }
    progress[id] = { ...getProgress(id), state };
    persist();
    return progress[id];
}

export function togglePlaybookFavorite(id) {
    if (!getPlaybook(id)) throw new Error(`Playbook desconocido: ${id}`);
    progress[id] = { ...getProgress(id), favorite: !getProgress(id).favorite };
    persist();
    return progress[id];
}

export function toggleChecklistItem(id, item) {
    const playbook = getPlaybook(id);
    if (!playbook) throw new Error(`Playbook desconocido: ${id}`);
    if (!playbook.checklist.includes(item)) throw new Error(`Elemento desconocido: ${item}`);
    const current = getProgress(id);
    const checked = current.checked.includes(item)
        ? current.checked.filter(i => i !== item)
        : [...current.checked, item];
    progress[id] = { ...current, checked };
    persist();
    return progress[id];
}
