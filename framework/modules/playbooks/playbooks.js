/* ==========================================================
   Falcon Playbooks - E8 (investigaciones paso a paso, estado en localStorage)
   ========================================================== */

const STORAGE_KEY = "falcon:playbooks";
export const PLAYBOOK_STATES = ["in_progress", "completed"];

export const TACTICS = [
    { id: "reconnaissance", title: "Reconocimiento" },
    { id: "identity", title: "Identidad y personas" },
    { id: "imagery", title: "Imágenes y medios" },
    { id: "infrastructure", title: "Infraestructura" },
    { id: "finance", title: "Flujos de dinero" },
    { id: "verification", title: "Verificación y desinformación" }
];

export const PLAYBOOKS = [
    {
        id: "username",
        tactic: "identity",
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
        tactic: "identity",
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
        tactic: "infrastructure",
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
        tactic: "reconnaissance",
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
        tactic: "identity",
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
    },
    {
        id: "image-person",
        tactic: "imagery",
        title: "Búsqueda inversa de imagen de persona",
        objective: "Averiguar si una foto de una persona es pública, está reutilizada o es un perfil falso.",
        requirements: ["Imagen original en la mayor resolución posible", "Base legal y ética para la búsqueda"],
        steps: [
            "Guardar la imagen original y su URL de origen antes de cualquier búsqueda.",
            "Buscar con varios motores de imágenes (Google Lens, Yandex, TinEye, Bing).",
            "Ordenar por fecha más antigua para encontrar la primera aparición conocida.",
            "Comparar fuentes y contextos; no identificar a personas privadas sin finalidad legítima."
        ],
        checklist: ["Original guardado", "Varios motores usados", "Primera aparición fechada", "Uso legítimo confirmado"],
        resources: ["Explorer: categoría Image", "Collections: guardar capturas con fecha"]
    },
    {
        id: "image-place",
        tactic: "imagery",
        title: "Geolocalización de lugar",
        objective: "Determinar dónde se tomó una foto a partir de elementos visibles.",
        requirements: ["Imagen original", "Acceso a mapas y vistas de calle"],
        steps: [
            "Extraer metadatos EXIF si existen (coordenadas, cámara, fecha).",
            "Identificar elementos verificables: letreros, idioma, arquitectura, vegetación, vehículos, placas.",
            "Comparar con vistas de calle y satélite en la zona candidata.",
            "Cruzar la sombra con la hora solar para validar la fecha de la toma."
        ],
        checklist: ["EXIF revisado", "Elementos identificados", "Ubicación comparada", "Hora solar validada"],
        resources: ["Country Packs: contexto por país", "Knowledge Graph: entidad Ubicación"]
    },
    {
        id: "image-freshness",
        tactic: "verification",
        title: "Verificar si una imagen es reciente",
        objective: "Comprobar cuándo se tomó realmente una imagen que circula como actual.",
        requirements: ["Imagen o video con la afirmación de fecha", "Acceso a motores de búsqueda inversa"],
        steps: [
            "Buscar la imagen en TinEye y Google Lens ordenando por la fecha más antigua.",
            "Revisar los metadatos y la fecha de publicación de la primera copia.",
            "Contrastar el clima, la estacionalidad y los elementos visibles con registros de la fecha declarada.",
            "Anotar la fecha probable y la evidencia que la respalda."
        ],
        checklist: ["Primera copia encontrada", "Metadatos revisados", "Clima y estación contrastados", "Fecha probable anotada"],
        resources: ["Collections: guardar evidencia con fecha", "Explorer: categoría Image"]
    },
    {
        id: "news-old-image",
        tactic: "verification",
        title: "Noticia con imagen antigua o fuera de contexto",
        objective: "Detectar una noticia reciente que reutiliza una imagen de otro evento o de años atrás.",
        requirements: ["Artículo o publicación original", "Fecha de publicación del artículo"],
        steps: [
            "Comparar la fecha del artículo con la primera aparición de la imagen.",
            "Buscar el pie de foto original y los créditos del fotógrafo o agencia.",
            "Verificar lugar y hechos con fuentes independientes del mismo día.",
            "Registrar el contexto original y el contexto usado en la noticia."
        ],
        checklist: ["Fecha del artículo comparada", "Pie original encontrado", "Hechos contrastados", "Contexto original anotado"],
        resources: ["Knowledge Graph: vincular medio y evento", "Collections: guardar comparativa"]
    },
    {
        id: "disinfo-claim",
        tactic: "verification",
        title: "Verificación de afirmación viral",
        objective: "Evaluar si una afirmación o publicación viral es verdadera, falsa o engañosa.",
        requirements: ["Publicación original con enlace o captura", "Fecha de la afirmación"],
        steps: [
            "Localizar la primera publicación conocida de la afirmación.",
            "Identificar quién la difunde y si hay cuentas coordinadas o recién creadas.",
            "Buscar verificaciones previas en medios y organizaciones de fact-checking.",
            "Clasificar la afirmación y documentar la evidencia de forma reproducible."
        ],
        checklist: ["Origen encontrado", "Difusores revisados", "Verificaciones previas buscadas", "Clasificación documentada"],
        resources: ["Knowledge Graph: entidades y relaciones de difusión", "Collections: evidencia reproducible"]
    },
    {
        id: "crypto-tracing",
        tactic: "finance",
        title: "Rastreo de fondos en cripto",
        objective: "Seguir movimientos de fondos entre direcciones públicas en blockchain.",
        requirements: ["Dirección o transacción de partida", "Explorador de bloques público"],
        steps: [
            "Registrar la dirección de origen y las transacciones con hash y fecha.",
            "Seguir los saltos hacia adelante y hacia atrás, marcando cada paso.",
            "Identificar puntos de salida: exchanges, puentes o servicios de mezcla.",
            "Documentar la cadena completa; la identidad detrás de un exchange requiere a las autoridades."
        ],
        checklist: ["Origen registrado", "Saltos trazados", "Puntos de salida marcados", "Cadena documentada"],
        resources: ["Knowledge Graph: entidad IOC (direcciones)", "Collections: exportar trazas"]
    },
    {
        id: "money-corporate",
        tactic: "finance",
        title: "Flujo de dinero corporativo",
        objective: "Identificar estructuras societarias y pagos entre empresas relacionadas.",
        requirements: ["Nombre de la empresa o entidad de partida", "Acceso a registros mercantiles públicos"],
        steps: [
            "Consultar registros mercantiles y de propiedad efectiva del país de registro.",
            "Mapear filiales, accionistas y directivos compartidos.",
            "Revisar licitaciones públicas, contratos y comunicados financieros.",
            "Relacionar entidades en el grafo con el nivel de confianza de cada vínculo."
        ],
        checklist: ["Registros consultados", "Estructura mapeada", "Contratos revisados", "Vínculos con confianza"],
        resources: ["Country Packs: registros por país", "Knowledge Graph: relaciones con confianza"]
    },
    {
        id: "scam-rug-pull",
        tactic: "finance",
        title: "Verificar proyecto cripto (rug pull)",
        objective: "Comprobar si un proyecto cripto y su equipo son reales antes o después de un fraude.",
        requirements: ["Nombre o contrato del proyecto", "Fotos y perfiles del equipo"],
        steps: [
            "Buscar las fotos del equipo por imagen para detectar stock o identidades ajenas.",
            "Revisar el dominio, la web archivada y la fecha de creación.",
            "Revisar la liquidez y los movimientos de los creadores en el contrato.",
            "Documentar el fraude con fechas y direcciones para denuncias."
        ],
        checklist: ["Equipo verificado", "Dominio y archivo revisados", "Liquidez analizada", "Evidencia documentada"],
        resources: ["Playbook: Búsqueda inversa de imagen de persona", "Playbook: Rastreo de fondos en cripto"]
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
