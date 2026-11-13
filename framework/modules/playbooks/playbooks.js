/* ==========================================================
   Falcon Playbooks - E8 (investigaciones paso a paso, estado en localStorage)
   Organizados por táctica, al estilo de una matriz MITRE ATT&CK.
   ========================================================== */

const STORAGE_KEY = "falcon:playbooks";
export const PLAYBOOK_STATES = ["in_progress", "completed"];

export const TACTICS = [
    { id: "reconnaissance", title: "Reconocimiento" },
    { id: "identity", title: "Identidad y personas" },
    { id: "imagery", title: "Imágenes y medios" },
    { id: "infrastructure", title: "Infraestructura" },
    { id: "finance", title: "Flujos de dinero" },
    { id: "dynamic", title: "OSINT dinámico" },
    { id: "verification", title: "Verificación y desinformación" }
];

export const PLAYBOOKS = [
    /* ---------------- Reconocimiento ---------------- */
    {
        id: "search-operators",
        tactic: "reconnaissance",
        title: "Operadores de búsqueda avanzados",
        objective: "Extraer resultados que una búsqueda normal no muestra usando operadores.",
        requirements: ["Objetivo definido (dominio, nombre, frase)", "Buscador principal y uno alternativo"],
        steps: [
            "Combinar site:, inurl:, intitle: y filetype: para acotar el objetivo.",
            "Buscar la frase exacta entre comillas y restringir por fecha o país.",
            "Repetir la misma consulta en otro buscador: los índices no coinciden.",
            "Guardar las consultas que funcionaron como plantilla reutilizable."
        ],
        checklist: ["Operadores probados", "Segundo buscador usado", "Resultados guardados", "Consultas anotadas"],
        tools: [{ name: "Google Avanzado", url: "https://www.google.com/advanced_search" }, { name: "Bing", url: "https://www.bing.com" }, { name: "DuckDuckGo", url: "https://duckduckgo.com" }],
        resources: ["Explorer: categoría HUMINT", "Collections: guardar consultas"]
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
        tools: [{ name: "Telepathy", url: "https://github.com/Lucksi/Telepathy" }, { name: "TGStat", url: "https://tgstat.com" }],
        resources: ["Explorer: categoría Messaging", "Collections: guardar evidencia"]
    },
    {
        id: "leaks-breach",
        tactic: "reconnaissance",
        title: "Búsqueda en filtraciones de datos",
        objective: "Comprobar si un correo o dominio aparece en brechas públicas conocidas.",
        requirements: ["Correo o dominio a consultar", "Base legal para tratar datos personales"],
        steps: [
            "Consultar el correo en servicios de brechas y anotar qué filtraciones lo incluyen.",
            "Verificar la fecha de cada brecha para descartar datos antiguos.",
            "No descargar ni redistribuir volcados de datos: basta con el registro de la coincidencia.",
            "Documentar el hallazgo y su fecha de consulta."
        ],
        checklist: ["Consultas realizadas", "Fechas de brecha anotadas", "Sin descarga de volcados", "Hallazgo documentado"],
        tools: [{ name: "Have I Been Pwned", url: "https://haveibeenpwned.com" }, { name: "h8mail", url: "https://github.com/khast3x/h8mail" }, { name: "Intelligence X", url: "https://intelx.io" }],
        resources: ["Playbook: Email Investigation", "Collections: registrar coincidencias"]
    },
    {
        id: "forums-paste",
        tactic: "reconnaissance",
        title: "Foros y sitios de pegado",
        objective: "Localizar menciones de un tema, marca o alias en foros y pastebins.",
        requirements: ["Palabra clave o alias", "Navegador aislado"],
        steps: [
            "Buscar la palabra clave junto a site:pastebin.com, site:rentry.co y foros del sector.",
            "Revisar copias archivadas cuando el original ya no esté disponible.",
            "Registrar autor, fecha y contexto de cada mención.",
            "Distinguir mención casual de publicación coordinada."
        ],
        checklist: ["Búsqueda por sitio hecha", "Copias archivadas revisadas", "Autor y fecha anotados", "Contexto evaluado"],
        tools: [{ name: "Google", url: "https://www.google.com" }, { name: "Wayback Machine", url: "https://web.archive.org" }],
        resources: ["Playbook: Operadores de búsqueda avanzados", "Collections: guardar capturas"]
    },
    {
        id: "job-postings",
        tactic: "reconnaissance",
        title: "Ofertas de empleo como fuente",
        objective: "Deducir tecnología, tamaño y proyectos de una organización desde sus búsquedas laborales.",
        requirements: ["Nombre de la empresa", "Portales de empleo del país"],
        steps: [
            "Buscar la empresa en portales de empleo y en su propia página de carrera.",
            "Anotar tecnologías, certificaciones y ubicaciones mencionadas.",
            "Comparar la cantidad de vacantes con la plantilla declarada.",
            "Cruzar los nombres de contacto con perfiles públicos."
        ],
        checklist: ["Portales revisados", "Tecnologías anotadas", "Ubicaciones listadas", "Contactos cruzados"],
        tools: [{ name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs" }, { name: "Indeed", url: "https://www.indeed.com" }],
        resources: ["Playbook: Company Investigation", "Knowledge Graph: entidad Empresa"]
    },
    {
        id: "email-osint",
        tactic: "reconnaissance",
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
        tools: [{ name: "Holehe", url: "https://github.com/megadose/holehe" }, { name: "GHunt", url: "https://github.com/mxrch/GHunt" }, { name: "Epieos", url: "https://epieos.com" }],
        resources: ["Explorer: categoría Email", "Health Engine: revisar herramientas rotas"]
    },

    /* ---------------- Identidad y personas ---------------- */
    {
        id: "username",
        tactic: "identity",
        title: "Username Investigation",
        objective: "Encontrar presencia pública de un nombre de usuario.",
        requirements: ["Nombre de usuario a investigar", "Entorno con VPN o perfil de navegador aislado"],
        steps: [
            "Buscar el nombre exacto entre comillas en buscadores.",
            "Comprobar plataformas comunes con herramientas de enumeración.",
            "Registrar cada perfil encontrado con su URL y fecha de verificación.",
            "Contrastar foto, biografía y fechas para confirmar que es la misma persona."
        ],
        checklist: ["Búsqueda exacta", "Plataformas revisadas", "Perfiles registrados", "Correlación verificada"],
        tools: [{ name: "Sherlock", url: "https://github.com/sherlock-project/sherlock" }, { name: "Maigret", url: "https://github.com/soxoj/maigret" }, { name: "WhatsMyName", url: "https://whatsmyname.app" }],
        resources: ["Explorer: categoría Username", "Collections: guardar hallazgos"]
    },
    {
        id: "person-profile",
        tactic: "identity",
        title: "Perfilado de una persona",
        objective: "Construir un perfil público de una persona con fuentes verificables.",
        requirements: ["Nombre completo y algún dato de contexto", "Alcance y finalidad definidos por escrito"],
        steps: [
            "Separar los datos confirmados de los supuestos en una tabla inicial.",
            "Buscar el nombre en registros públicos, prensa y perfiles profesionales.",
            "Correlacionar ciudad, estudios y empleos para descartar homónimos.",
            "Registrar cada vínculo en el grafo con su fuente y nivel de confianza."
        ],
        checklist: ["Datos confirmados separados", "Homónimos descartados", "Fuentes por dato", "Grafo actualizado"],
        tools: [{ name: "Maltego", url: "https://www.maltego.com" }, { name: "LinkedIn", url: "https://www.linkedin.com" }],
        resources: ["Playbook: Correlación de alias", "Knowledge Graph: entidad Persona"]
    },
    {
        id: "missing-person-photo",
        tactic: "identity",
        title: "Persona perdida por su foto",
        objective: "Localizar a una persona desaparecida a partir de una foto y datos verificables, y entregar los hallazgos a quien corresponda.",
        requirements: ["Foto reciente de la persona", "Última ubicación, fecha y perfiles conocidos", "Contacto con familia o autoridades competentes"],
        steps: [
            "Guardar la foto original y anotar la fuente y fecha de cada dato aportado por la familia.",
            "Buscar la foto por imagen en varios motores para encontrar copias con contexto y fecha.",
            "Revisar perfiles donde aparezca la foto comparando nombre, edad y ciudad.",
            "Verificar una coincidencia con una fuente independiente y entregar la evidencia a las autoridades; no contactar a la persona por cuenta propia."
        ],
        checklist: ["Foto original guardada", "Búsqueda inversa realizada", "Coincidencias verificadas", "Evidencia entregada a autoridades"],
        tools: [{ name: "Google Lens", url: "https://lens.google.com" }, { name: "TinEye", url: "https://tineye.com" }, { name: "Yandex Images", url: "https://yandex.com/images" }],
        resources: ["Playbook: Búsqueda inversa de imagen de persona", "Collections: cronología con fechas"]
    },
    {
        id: "phone",
        tactic: "identity",
        title: "Número de teléfono",
        objective: "Determinar país, operador y presencia pública de un número.",
        requirements: ["Número en formato internacional", "Base legal para la consulta"],
        steps: [
            "Identificar país, región y operador a partir del prefijo.",
            "Buscar el número en buscadores y en anuncios públicos clasificados.",
            "Comprobar si está asociado a perfiles de mensajería con una cuenta separada.",
            "Registrar coincidencias sin realizar llamadas ni mensajes no autorizados."
        ],
        checklist: ["Prefijo identificado", "Búsqueda pública hecha", "Perfiles asociados revisados", "Sin contacto no autorizado"],
        tools: [{ name: "PhoneInfoga", url: "https://github.com/sundowndev/phoneinfoga" }, { name: "Truecaller", url: "https://www.truecaller.com" }],
        resources: ["Playbook: Perfilado de una persona", "Collections: registrar coincidencias"]
    },
    {
        id: "fake-profile",
        tactic: "identity",
        title: "Detectar un perfil falso",
        objective: "Evaluar si una cuenta representa a una persona o entidad real.",
        requirements: ["Enlace o captura del perfil", "Fecha de creación si es visible"],
        steps: [
            "Revisar fecha de creación, historial y frecuencia de publicación.",
            "Buscar la foto de perfil por imagen para detectar material reutilizado.",
            "Comparar el nombre y los datos con fuentes oficiales de la entidad.",
            "Anotar inconsistencias con capturas fechadas antes de reportar."
        ],
        checklist: ["Historial revisado", "Foto verificada", "Datos contrastados", "Inconsistencias documentadas"],
        tools: [{ name: "Google Lens", url: "https://lens.google.com" }, { name: "Wayback Machine", url: "https://web.archive.org" }],
        resources: ["Playbook: Búsqueda inversa de imagen de persona", "Knowledge Graph: vincular cuenta y persona"]
    },
    {
        id: "alias-correlation",
        tactic: "identity",
        title: "Correlación de alias entre plataformas",
        objective: "Confirmar si dos nombres de usuario pertenecen a la misma persona.",
        requirements: ["Lista de alias candidatos", "Capturas de cada perfil"],
        steps: [
            "Comparar foto, biografía, enlaces y estilo de escritura.",
            "Buscar alias reutilizados en foros y repositorios de código.",
            "Registrar coincidencias fuertes y débiles por separado.",
            "Asignar confianza al vínculo en el grafo, sin presentarlo como certeza."
        ],
        checklist: ["Perfiles comparados", "Alias cruzados", "Coincidencias clasificadas", "Confianza asignada"],
        tools: [{ name: "Maigret", url: "https://github.com/soxoj/maigret" }, { name: "Blackbird", url: "https://github.com/p1ngul1n0/blackbird" }],
        resources: ["Playbook: Username Investigation", "Knowledge Graph: relación con confianza"]
    },
    {
        id: "associates",
        tactic: "identity",
        title: "Vínculos y socios de una persona",
        objective: "Mapear relaciones públicas de una persona con empresas y otras personas.",
        requirements: ["Nombre de la persona", "País de registro o actividad"],
        steps: [
            "Consultar registros mercantiles por nombre y variantes.",
            "Revisar actas, boletines oficiales y licitaciones donde aparezca.",
            "Identificar domicilios fiscales y directivos compartidos.",
            "Separar vínculo documentado de simple coincidencia de nombre."
        ],
        checklist: ["Variantes buscadas", "Registros revisados", "Vínculos documentados", "Coincidencias descartadas"],
        tools: [{ name: "OpenCorporates", url: "https://opencorporates.com" }, { name: "OCCRP Aleph", url: "https://aleph.occrp.org" }],
        resources: ["Playbook: Flujo de dinero corporativo", "Country Packs: registros por país"]
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
        tools: [{ name: "OpenCorporates", url: "https://opencorporates.com" }, { name: "ICIJ Offshore Leaks", url: "https://offshoreleaks.icij.org" }],
        resources: ["Country Packs: fuentes por país", "Knowledge Graph: entidad Empresa"]
    },

    /* ---------------- Imágenes y medios ---------------- */
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
        tools: [{ name: "Google Lens", url: "https://lens.google.com" }, { name: "TinEye", url: "https://tineye.com" }, { name: "Yandex Images", url: "https://yandex.com/images" }],
        resources: ["Playbook: Persona perdida por su foto", "Collections: capturas con fecha"]
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
        tools: [{ name: "Google Maps", url: "https://www.google.com/maps" }, { name: "Mapillary", url: "https://www.mapillary.com" }, { name: "SunCalc", url: "https://www.suncalc.org" }],
        resources: ["Playbook: Metadatos EXIF", "Knowledge Graph: entidad Ubicación"]
    },
    {
        id: "video-geolocate",
        tactic: "imagery",
        title: "Geolocalizar un video",
        objective: "Ubicar el lugar y la fecha de un video que circula sin contexto.",
        requirements: ["Video original o de mayor calidad", "Herramientas de extracción de fotogramas"],
        steps: [
            "Extraer fotogramas clave y buscarlos por imagen.",
            "Identificar referencias estables: carteles, comercios, rutas, montañas.",
            "Reconstruir el recorrido usando vistas de calle del candidato.",
            "Contrastar clima y sombras con la fecha declarada."
        ],
        checklist: ["Fotogramas extraídos", "Referencias identificadas", "Recorrido reconstruido", "Fecha contrastada"],
        tools: [{ name: "InVID", url: "https://github.com/invid-project/invid-verification-plugin" }, { name: "Yandex Images", url: "https://yandex.com/images" }],
        resources: ["Playbook: Geolocalización de lugar", "Collections: guardar fotogramas"]
    },
    {
        id: "reverse-video",
        tactic: "imagery",
        title: "Búsqueda inversa de video",
        objective: "Encontrar la primera publicación de un video viral.",
        requirements: ["Enlace o archivo del video", "Capturas de fotogramas"],
        steps: [
            "Cortar tres fotogramas representativos y buscarlos por imagen.",
            "Buscar el audio o la transcripción entre comillas.",
            "Revisar la fecha de subida en cada copia encontrada.",
            "Registrar la copia más antigua como origen probable."
        ],
        checklist: ["Fotogramas buscados", "Audio buscado", "Fechas comparadas", "Origen registrado"],
        tools: [{ name: "Google Lens", url: "https://lens.google.com" }, { name: "TinEye", url: "https://tineye.com" }],
        resources: ["Playbook: Verificar si una imagen es reciente", "Collections: guardar origen"]
    },
    {
        id: "image-freshness",
        tactic: "imagery",
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
        tools: [{ name: "TinEye", url: "https://tineye.com" }, { name: "SunCalc", url: "https://www.suncalc.org" }, { name: "Windy", url: "https://www.windy.com" }],
        resources: ["Collections: evidencia con fecha", "Explorer: categoría Image"]
    },
    {
        id: "exif-metadata",
        tactic: "imagery",
        title: "Metadatos EXIF",
        objective: "Extraer y leer los metadatos de una imagen antes de publicarla o analizarla.",
        requirements: ["Archivo original, no una captura de pantalla", "Herramienta de lectura EXIF"],
        steps: [
            "Leer cámara, fecha, coordenadas y software de edición.",
            "Comprobar si las coordenadas coinciden con el lugar mostrado.",
            "Verificar si la imagen fue editada o recortada.",
            "Limpiar los metadatos propios antes de compartir material sensible."
        ],
        checklist: ["Metadatos leídos", "Coordenadas contrastadas", "Edición detectada", "Metadatos propios limpiados"],
        tools: [{ name: "ExifTool", url: "https://exiftool.org" }, { name: "Jimpl", url: "https://jimpl.com" }],
        resources: ["Playbook: Geolocalización de lugar", "Collections: guardar informe EXIF"]
    },
    {
        id: "satellite-imagery",
        tactic: "imagery",
        title: "Imágenes satelitales y cambios en el tiempo",
        objective: "Comparar un lugar en distintas fechas para confirmar daños, construcción o presencia.",
        requirements: ["Coordenadas o zona aproximada", "Acceso a imágenes satelitales históricas"],
        steps: [
            "Localizar la zona exacta en Google Earth y en el visor satelital elegido.",
            "Comparar las fechas disponibles antes y después del evento.",
            "Anotar cambios concretos: edificios, vehículos, vegetación, cráteres.",
            "Guardar las capturas con su fecha de imagen, no la de descarga."
        ],
        checklist: ["Zona localizada", "Fechas comparadas", "Cambios descritos", "Capturas fechadas"],
        tools: [{ name: "Google Earth", url: "https://earth.google.com" }, { name: "Sentinel Hub EO Browser", url: "https://apps.sentinel-hub.com/eo-browser/" }],
        resources: ["Playbook: Geolocalización de lugar", "Knowledge Graph: entidad Ubicación"]
    },

    /* ---------------- Infraestructura ---------------- */
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
        tools: [{ name: "theHarvester", url: "https://github.com/laramies/theHarvester" }, { name: "SpiderFoot", url: "https://github.com/smicallef/spiderfoot" }, { name: "NIC Argentina", url: "https://nic.ar" }],
        resources: ["Explorer: categoría Domain", "Knowledge Graph: entidad Dominio"]
    },
    {
        id: "subdomains",
        tactic: "infrastructure",
        title: "Enumeración de subdominios",
        objective: "Descubrir servicios expuestos bajo un dominio principal.",
        requirements: ["Dominio raíz", "Registro del alcance autorizado"],
        steps: [
            "Recolectar subdominios con fuentes pasivas y certificados.",
            "Resolver los candidatos y descartar los que no responden.",
            "Clasificar por servicio visible: paneles, APIs, entornos de prueba.",
            "Documentar solo lo accesible públicamente, sin intentar autenticación."
        ],
        checklist: ["Fuentes pasivas usadas", "Candidatos resueltos", "Servicios clasificados", "Sin acceso forzado"],
        tools: [{ name: "Subfinder", url: "https://github.com/projectdiscovery/subfinder" }, { name: "Amass", url: "https://github.com/owasp-amass/amass" }, { name: "dnsdumpster", url: "https://dnsdumpster.com" }],
        resources: ["Playbook: Dominios y superficie pública", "Knowledge Graph: entidad Dominio"]
    },
    {
        id: "certificates",
        tactic: "infrastructure",
        title: "Certificados TLS y transparencia",
        objective: "Usar los registros de certificados para descubrir hosts y fechas.",
        requirements: ["Dominio o nombre de organización", "Acceso a un buscador de certificados"],
        steps: [
            "Buscar el dominio en el registro de transparencia de certificados.",
            "Listar nombres alternativos incluidos en cada certificado.",
            "Anotar emisor y fechas de validez para ordenar la cronología.",
            "Cruzar los hosts nuevos con la actividad conocida de la organización."
        ],
        checklist: ["Registro consultado", "Nombres extraídos", "Fechas ordenadas", "Hosts nuevos revisados"],
        tools: [{ name: "crt.sh", url: "https://crt.sh" }, { name: "Censys", url: "https://search.censys.io" }],
        resources: ["Playbook: Enumeración de subdominios", "Collections: exportar hosts"]
    },
    {
        id: "ip-asn",
        tactic: "infrastructure",
        title: "Infraestructura IP y ASN",
        objective: "Relacionar una IP con su red, proveedor y otros servicios alojados.",
        requirements: ["Dirección IP o rango", "Acceso a buscadores de infraestructura"],
        steps: [
            "Consultar ASN, país y proveedor de la IP.",
            "Revisar los servicios y puertos visibles públicamente.",
            "Buscar certificados y dominios asociados al mismo rango.",
            "Registrar la infraestructura en el grafo como entidad IOC."
        ],
        checklist: ["ASN identificado", "Servicios visibles listados", "Dominios asociados buscados", "Grafo actualizado"],
        tools: [{ name: "Shodan", url: "https://www.shodan.io" }, { name: "Censys", url: "https://search.censys.io" }, { name: "Hurricane Electric BGP", url: "https://bgp.he.net" }],
        resources: ["Playbook: Certificados TLS", "Knowledge Graph: entidad IOC"]
    },
    {
        id: "email-auth",
        tactic: "infrastructure",
        title: "Autenticación de correo (SPF, DKIM, DMARC)",
        objective: "Evaluar si un dominio puede ser suplantado en correos.",
        requirements: ["Dominio a revisar", "Acceso a consultas DNS públicas"],
        steps: [
            "Consultar los registros SPF, DKIM y DMARC del dominio.",
            "Leer la política DMARC y su porcentaje de aplicación.",
            "Comprobar si la política es solo de monitorización.",
            "Documentar el riesgo sin enviar correos de prueba."
        ],
        checklist: ["SPF revisado", "DKIM revisado", "Política DMARC leída", "Riesgo documentado"],
        tools: [{ name: "MXToolbox", url: "https://mxtoolbox.com" }, { name: "Google Admin Toolbox", url: "https://toolbox.googleapps.com/apps/checkmx/" }],
        resources: ["Playbook: Dominios y superficie pública", "Collections: guardar informe"]
    },
    {
        id: "tech-fingerprint",
        tactic: "infrastructure",
        title: "Fingerprinting tecnológico",
        objective: "Identificar el stack de un sitio para entender su operación.",
        requirements: ["URL del sitio", "Autorización si no es propio"],
        steps: [
            "Revisar cabeceras HTTP, cookies y archivos estáticos.",
            "Comparar las tecnologías detectadas con el perfil de la organización.",
            "Anotar versiones visibles y su antigüedad.",
            "No probar exploits: el objetivo es inventariar, no atacar."
        ],
        checklist: ["Cabeceras revisadas", "Tecnologías detectadas", "Versiones anotadas", "Sin pruebas de explotación"],
        tools: [{ name: "Wappalyzer", url: "https://www.wappalyzer.com" }, { name: "BuiltWith", url: "https://builtwith.com" }],
        resources: ["Playbook: Dominios y superficie pública", "Knowledge Graph: entidad Dominio"]
    },
    {
        id: "cloud-storage",
        tactic: "infrastructure",
        title: "Almacenamiento en la nube expuesto",
        objective: "Detectar buckets o contenedores públicos vinculados a una organización.",
        requirements: ["Nombre de la organización", "Política clara sobre datos encontrados"],
        steps: [
            "Generar variantes del nombre para buckets y contenedores.",
            "Comprobar solo si el listado es público, sin descargar contenido.",
            "Documentar URL, fecha y tipo de archivo visible.",
            "Notificar de forma responsable a la organización afectada."
        ],
        checklist: ["Variantes generadas", "Listados comprobados", "Sin descarga de datos", "Notificación preparada"],
        tools: [{ name: "GrayhatWarfare", url: "https://grayhatwarfare.com" }, { name: "Google Cloud Storage Browser", url: "https://console.cloud.google.com/storage/browser" }],
        resources: ["Playbook: Dominios y superficie pública", "Collections: registrar hallazgo"]
    },
    {
        id: "urlscan",
        tactic: "infrastructure",
        title: "Análisis de una URL sospechosa",
        objective: "Observar qué carga una URL sin abrirla en el navegador propio.",
        requirements: ["URL sospechosa", "Navegador aislado para el análisis manual"],
        steps: [
            "Enviar la URL a un servicio de escaneo y revisar redirecciones.",
            "Anotar dominios contactados, recursos y certificados.",
            "Comparar con el dominio legítimo que dice representar.",
            "Guardar el informe público como evidencia."
        ],
        checklist: ["Escaneo realizado", "Redirecciones anotadas", "Dominios comparados", "Informe guardado"],
        tools: [{ name: "urlscan.io", url: "https://urlscan.io" }, { name: "VirusTotal", url: "https://www.virustotal.com" }],
        resources: ["Playbook: Infraestructura IP y ASN", "Collections: guardar informe"]
    },

    /* ---------------- Flujos de dinero ---------------- */
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
            "Documentar la cadena completa; identificar al titular requiere a las autoridades."
        ],
        checklist: ["Origen registrado", "Saltos trazados", "Puntos de salida marcados", "Cadena documentada"],
        tools: [{ name: "Etherscan", url: "https://etherscan.io" }, { name: "Blockchain.com Explorer", url: "https://www.blockchain.com/explorer" }, { name: "Breadcrumbs", url: "https://www.breadcrumbs.app" }],
        resources: ["Knowledge Graph: entidad IOC", "Collections: exportar trazas"]
    },
    {
        id: "wallet-cluster",
        tactic: "finance",
        title: "Agrupación de wallets",
        objective: "Detectar direcciones que probablemente pertenecen al mismo actor.",
        requirements: ["Conjunto inicial de direcciones", "Explorador con historial completo"],
        steps: [
            "Buscar transacciones conjuntas y direcciones de cambio.",
            "Revisar patrones de tiempo y montos repetidos.",
            "Marcar la agrupación como hipótesis, no como hecho.",
            "Registrar cada dirección con su evidencia en el grafo."
        ],
        checklist: ["Transacciones conjuntas buscadas", "Patrones anotados", "Hipótesis marcada", "Direcciones registradas"],
        tools: [{ name: "OXT", url: "https://oxt.me" }, { name: "Breadcrumbs", url: "https://www.breadcrumbs.app" }],
        resources: ["Playbook: Rastreo de fondos en cripto", "Knowledge Graph: relaciones con confianza"]
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
        tools: [{ name: "OpenCorporates", url: "https://opencorporates.com" }, { name: "OCCRP Aleph", url: "https://aleph.occrp.org" }, { name: "ICIJ Offshore Leaks", url: "https://offshoreleaks.icij.org" }],
        resources: ["Country Packs: registros por país", "Knowledge Graph: relaciones con confianza"]
    },
    {
        id: "sanctions-pep",
        tactic: "finance",
        title: "Sanciones y personas expuestas políticamente",
        objective: "Comprobar si una persona o empresa aparece en listas de sanciones o PEP.",
        requirements: ["Nombre completo y variantes", "Fecha de nacimiento o país si se conoce"],
        steps: [
            "Buscar el nombre en listas consolidadas de sanciones.",
            "Revisar coincidencias por fecha de nacimiento y país para descartar homónimos.",
            "Documentar la lista, la fecha y el identificador de la entrada.",
            "No concluir vínculo sin coincidencia de al menos dos datos."
        ],
        checklist: ["Listas consultadas", "Homónimos descartados", "Entrada documentada", "Coincidencias dobles"],
        tools: [{ name: "OpenSanctions", url: "https://www.opensanctions.org" }, { name: "OCCRP Aleph", url: "https://aleph.occrp.org" }],
        resources: ["Playbook: Flujo de dinero corporativo", "Knowledge Graph: entidad Persona"]
    },
    {
        id: "invoice-fraud",
        tactic: "finance",
        title: "Fraude de facturación (BEC)",
        objective: "Investigar un correo de cobro fraudulento que suplanta a un proveedor.",
        requirements: ["Correo recibido con cabeceras completas", "Datos del proveedor legítimo"],
        steps: [
            "Leer las cabeceras y comparar el dominio del remitente con el real.",
            "Revisar la antigüedad del dominio y sus registros de autenticación.",
            "Comparar los datos bancarios con los del contrato original.",
            "Aportar la evidencia al área de fraude del banco y a la empresa suplantada."
        ],
        checklist: ["Cabeceras leídas", "Dominio verificado", "Datos bancarios comparados", "Evidencia entregada"],
        tools: [{ name: "MXToolbox", url: "https://mxtoolbox.com" }, { name: "urlscan.io", url: "https://urlscan.io" }],
        resources: ["Playbook: Autenticación de correo", "Collections: guardar cadena de correos"]
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
        tools: [{ name: "Google Lens", url: "https://lens.google.com" }, { name: "Etherscan", url: "https://etherscan.io" }],
        resources: ["Playbook: Rastreo de fondos en cripto", "Playbook: Búsqueda inversa de imagen de persona"]
    },

    /* ---------------- OSINT dinámico ---------------- */
    {
        id: "social-monitoring",
        tactic: "dynamic",
        title: "Monitoreo de redes en tiempo real",
        objective: "Seguir un tema o cuenta mientras los hechos ocurren.",
        requirements: ["Lista de términos y cuentas clave", "Cuenta de monitorización separada"],
        steps: [
            "Crear búsquedas guardadas con las variantes del tema y del lugar.",
            "Activar alertas o un lector RSS para no depender de revisar a mano.",
            "Registrar hora, enlace y captura de cada publicación relevante.",
            "Contrastar la primera versión con las correcciones posteriores."
        ],
        checklist: ["Búsquedas guardadas", "Alertas activas", "Publicaciones fechadas", "Correcciones revisadas"],
        tools: [{ name: "Feedly", url: "https://feedly.com" }, { name: "TweetDeck / X Pro", url: "https://pro.x.com" }],
        resources: ["Playbook: Cuentas coordinadas", "Collections: cronología en vivo"]
    },
    {
        id: "flight-tracking",
        tactic: "dynamic",
        title: "Seguimiento de vuelos en vivo",
        objective: "Identificar un vuelo o un avión a partir de una foto, un video o una noticia.",
        requirements: ["Hora y lugar aproximados", "Acceso a redes de seguimiento ADS-B"],
        steps: [
            "Revisar la posición en vivo y el historial del vuelo en el momento indicado.",
            "Identificar matrícula, operador y tipo de aeronave.",
            "Buscar la matrícula en registros de aviación y en fotos previas.",
            "Guardar la captura con la hora exacta del servidor."
        ],
        checklist: ["Historial consultado", "Matrícula identificada", "Registro revisado", "Captura con hora"],
        tools: [{ name: "Flightradar24", url: "https://www.flightradar24.com" }, { name: "ADS-B Exchange", url: "https://globe.adsbexchange.com" }],
        resources: ["Playbook: Geolocalización de lugar", "Knowledge Graph: entidad IOC"]
    },
    {
        id: "vessel-tracking",
        tactic: "dynamic",
        title: "Seguimiento de buques en vivo",
        objective: "Verificar el recorrido de un barco asociado a un puerto o a una carga.",
        requirements: ["Nombre del buque o zona del puerto", "Acceso a datos AIS públicos"],
        steps: [
            "Buscar el buque por nombre o IMO y revisar su historial de escalas.",
            "Comprobar si hubo apagones de señal cerca de la zona de interés.",
            "Cruzar la llegada con noticias y registros portuarios.",
            "Documentar el recorrido con capturas fechadas."
        ],
        checklist: ["Buque identificado", "Escalas revisadas", "Apagones de señal anotados", "Recorrido documentado"],
        tools: [{ name: "MarineTraffic", url: "https://www.marinetraffic.com" }, { name: "VesselFinder", url: "https://www.vesselfinder.com" }],
        resources: ["Playbook: Flujo de dinero corporativo", "Collections: guardar trazas"]
    },
    {
        id: "live-cameras",
        tactic: "dynamic",
        title: "Cámaras públicas y tráfico en vivo",
        objective: "Confirmar condiciones actuales en un lugar mediante cámaras públicas.",
        requirements: ["Ciudad o punto aproximado", "Solo cámaras públicas y legales"],
        steps: [
            "Localizar cámaras de tráfico o webcams públicas del lugar.",
            "Comparar clima, luz y tráfico con la afirmación que se investiga.",
            "Verificar la hora de la transmisión y su zona horaria.",
            "Guardar la captura con hora local y fuente."
        ],
        checklist: ["Cámaras localizadas", "Condiciones comparadas", "Zona horaria verificada", "Captura con hora"],
        tools: [{ name: "Windy Webcams", url: "https://www.windy.com/webcams" }, { name: "EarthCam", url: "https://www.earthcam.com" }],
        resources: ["Playbook: Verificar si una imagen es reciente", "Collections: guardar capturas"]
    },
    {
        id: "disaster-feeds",
        tactic: "dynamic",
        title: "Desastres y crisis en tiempo real",
        objective: "Reconstruir un evento en curso con fuentes abiertas actualizadas.",
        requirements: ["Zona y fecha del evento", "Al menos dos fuentes independientes"],
        steps: [
            "Revisar alertas oficiales y datos de organismos de emergencia.",
            "Cruzar imágenes satelitales o de incendios con reportes locales.",
            "Ordenar la cronología con hora local y UTC.",
            "Marcar qué datos siguen sin confirmar."
        ],
        checklist: ["Alertas oficiales revisadas", "Fuentes cruzadas", "Cronología ordenada", "Datos sin confirmar marcados"],
        tools: [{ name: "NASA FIRMS", url: "https://firms.modaps.eosdis.nasa.gov" }, { name: "GDELT", url: "https://www.gdeltproject.org" }, { name: "ACLED", url: "https://acleddata.com" }],
        resources: ["Playbook: Imágenes satelitales y cambios", "Knowledge Graph: entidad Ubicación"]
    },
    {
        id: "domain-monitoring",
        tactic: "dynamic",
        title: "Monitor de cambios de dominio",
        objective: "Detectar cambios de DNS, certificados o contenido en un dominio vigilado.",
        requirements: ["Lista de dominios a vigilar", "Cuenta en un servicio de monitorización"],
        steps: [
            "Configurar alertas de cambios DNS y de nuevos certificados.",
            "Revisar la frecuencia de cambio para distinguir ruido de señales.",
            "Comparar el contenido actual con la copia archivada anterior.",
            "Documentar cada cambio con fecha y captura."
        ],
        checklist: ["Alertas configuradas", "Cambios revisados", "Copia anterior comparada", "Cambios documentados"],
        tools: [{ name: "SecurityTrails", url: "https://securitytrails.com" }, { name: "crt.sh", url: "https://crt.sh" }, { name: "urlscan.io", url: "https://urlscan.io" }],
        resources: ["Playbook: Dominios y superficie pública", "Collections: histórico de cambios"]
    },
    {
        id: "leak-monitoring",
        tactic: "dynamic",
        title: "Monitoreo continuo de filtraciones",
        objective: "Vigilar menciones de una organización en filtraciones y foros sin exponer datos.",
        requirements: ["Dominios y correos de la organización", "Autorización del área responsable"],
        steps: [
            "Configurar alertas por dominio y correo en servicios de monitorización.",
            "Clasificar cada aviso por gravedad y fecha de la brecha.",
            "Comprobar si las credenciales siguen activas sin usarlas.",
            "Derivar a respuesta a incidentes con la evidencia mínima necesaria."
        ],
        checklist: ["Alertas configuradas", "Avisos clasificados", "Vigencia comprobada sin uso", "Incidente derivado"],
        tools: [{ name: "Have I Been Pwned", url: "https://haveibeenpwned.com" }, { name: "Intelligence X", url: "https://intelx.io" }],
        resources: ["Playbook: Búsqueda en filtraciones", "Health Engine: revisar herramientas"]
    },

    /* ---------------- Verificación y desinformación ---------------- */
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
        checklist: ["Fecha comparada", "Pie original encontrado", "Hechos contrastados", "Contexto original anotado"],
        tools: [{ name: "TinEye", url: "https://tineye.com" }, { name: "Google Fact Check Explorer", url: "https://toolbox.google.com/factcheck/explorer" }],
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
        tools: [{ name: "Google Fact Check Explorer", url: "https://toolbox.google.com/factcheck/explorer" }, { name: "Wayback Machine", url: "https://web.archive.org" }],
        resources: ["Knowledge Graph: entidades de difusión", "Collections: evidencia reproducible"]
    },
    {
        id: "synthetic-media",
        tactic: "verification",
        title: "Detectar imagen o audio sintético",
        objective: "Evaluar si una pieza audiovisual fue generada o alterada con IA.",
        requirements: ["Archivo original de la mejor calidad posible", "Al menos dos herramientas de análisis"],
        steps: [
            "Buscar artefactos: bordes, texto deformado, manos, reflejos, repeticiones.",
            "Comprobar el origen en el archivo y el historial de publicaciones.",
            "Analizar el audio en busca de cortes y respiración inconsistente.",
            "Marcar el resultado como indicio, nunca como prueba definitiva."
        ],
        checklist: ["Artefactos revisados", "Origen comprobado", "Audio analizado", "Resultado como indicio"],
        tools: [{ name: "FotoForensics", url: "https://fotoforensics.com" }, { name: "Deepware Scanner", url: "https://deepware.ai" }],
        resources: ["Playbook: Verificación de afirmación viral", "Collections: guardar análisis"]
    },
    {
        id: "coordinated-accounts",
        tactic: "verification",
        title: "Cuentas coordinadas",
        objective: "Detectar un grupo de cuentas que amplifica el mismo mensaje de forma artificial.",
        requirements: ["Conjunto de publicaciones o cuentas", "Herramienta de recolección"],
        steps: [
            "Recolectar hora de publicación, texto y cuenta de cada mensaje.",
            "Agrupar por texto idéntico, enlaces y minutos de diferencia.",
            "Revisar fecha de creación e historial de las cuentas implicadas.",
            "Presentar el patrón con datos, sin acusar sin evidencia."
        ],
        checklist: ["Publicaciones recolectadas", "Patrones agrupados", "Cuentas revisadas", "Patrón documentado"],
        tools: [{ name: "GDELT", url: "https://www.gdeltproject.org" }, { name: "Hoaxy", url: "https://hoaxy.osome.iu.edu" }],
        resources: ["Playbook: Verificación de afirmación viral", "Knowledge Graph: relación de amplificación"]
    },
    {
        id: "source-chain",
        tactic: "verification",
        title: "Cadena de fuentes y citas",
        objective: "Rastrear una cita o dato hasta su fuente original.",
        requirements: ["Afirmación con cita o dato", "Acceso a buscadores y archivos"],
        steps: [
            "Buscar la frase exacta entre comillas para encontrar la primera aparición.",
            "Revisar si la fuente citada existe y dice realmente eso.",
            "Seguir las citas intermedias hasta el documento primario.",
            "Anotar dónde se distorsionó el dato, si ocurrió."
        ],
        checklist: ["Frase buscada", "Fuente citada verificada", "Documento primario hallado", "Distorsión anotada"],
        tools: [{ name: "Google Libros", url: "https://books.google.com" }, { name: "Wayback Machine", url: "https://web.archive.org" }],
        resources: ["Playbook: Verificación de afirmación viral", "Collections: guardar cadena de fuentes"]
    },
    {
        id: "web-archive",
        tactic: "verification",
        title: "Archivo web y cambios de contenido",
        objective: "Comparar cómo cambió una página entre dos fechas.",
        requirements: ["URL de la página", "Acceso a archivos web"],
        steps: [
            "Buscar la URL en el archivo y elegir dos capturas relevantes.",
            "Comparar textos, imágenes y enlaces entre versiones.",
            "Guardar una copia propia de la versión actual.",
            "Anotar qué cambió y en qué fecha."
        ],
        checklist: ["Capturas elegidas", "Versiones comparadas", "Copia propia guardada", "Cambios fechados"],
        tools: [{ name: "Wayback Machine", url: "https://web.archive.org" }, { name: "archive.today", url: "https://archive.ph" }, { name: "Hunchly", url: "https://www.hunch.ly" }],
        resources: ["Playbook: Cadena de fuentes", "Collections: evidencia archivada"]
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
