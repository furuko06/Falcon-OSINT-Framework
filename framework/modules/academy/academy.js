/* ==========================================================
   Falcon Academy - E11
   Lecciones, laboratorios sintéticos y cuestionario con
   progreso guardado en este navegador.
   ========================================================== */

const STORAGE_KEY = "falcon:academy";

export const PASSING_PERCENT = 60;

export const LESSONS = [
    {
        id: "methodology",
        title: "Metodología: del objetivo a la evidencia",
        level: "Inicial",
        summary: "Ordena la investigación antes de abrir la primera herramienta.",
        keyPoints: [
            "Escribe la pregunta concreta y el alcance: qué buscás, para quién y con qué base legal.",
            "Formulá hipótesis descartables en lugar de una conclusión anticipada.",
            "Registrá fuente, fecha y hora de cada hallazgo, incluso los negativos.",
            "Separá siempre hecho observado de inferencia propia.",
            "Cerrá con un informe que incluya limitaciones y datos que faltan confirmar."
        ],
        exercise: "Elegí un caso ficticio y escribí la pregunta de investigación, dos hipótesis y la evidencia mínima para descartarlas."
    },
    {
        id: "opsec",
        title: "OPSEC y huella del analista",
        level: "Inicial",
        summary: "Proteger la identidad y no alterar el objeto de estudio.",
        keyPoints: [
            "Usá una máquina o perfil separado del personal, con VPN o TOR según el caso.",
            "No reutilices cuentas personales ni interactúes con el objetivo.",
            "Revisá y limpia metadatos antes de publicar o compartir archivos.",
            "No subas datos de terceros a servicios externos sin autorización.",
            "Documentá el entorno usado: una repetición debe ser posible."
        ],
        exercise: "Armá una checklist de cinco controles previos antes de iniciar una recolección.",
        sources: [
            { title: "Bellingcat Toolkit — Stay Safe", url: "https://bellingcat.gitbook.io/toolkit/resources/stay-safe" }
        ]
    },
    {
        id: "verification",
        title: "Verificación de imágenes y afirmaciones",
        level: "Intermedio",
        summary: "Cuándo una imagen o un dato resiste la triangulación.",
        keyPoints: [
            "Empezá por búsqueda inversa y por las copias más antiguas del material.",
            "Revisá metadatos, pero recordá que pueden haberse borrado o editado.",
            "Cruzá sombras, clima y puntos de referencia para cronolocalizar.",
            "Buscá la fuente primaria antes de citar una cobertura secundaria.",
            "Una coincidencia no es prueba: exige al menos una fuente independiente."
        ],
        exercise: "Tomá una imagen pública y anotá tres pistas verificables y una que no puedas confirmar.",
        sources: [
            { title: "Full Fact — Verification and OSINT training", url: "https://fullfact.org/training/verification-and-osint-training/" },
            { title: "Bellingcat Toolkit — Image/Video", url: "https://bellingcat.gitbook.io/toolkit/categories/image-video" }
        ]
    },
    {
        id: "claim-triage",
        title: "Triage de afirmaciones y fuentes",
        level: "Inicial",
        summary: "Decidir qué merece verificarse, con qué estándar de prueba y en qué orden.",
        keyPoints: [
            "Reformulá la afirmación como una pregunta verificable: qué se afirma, dónde y cuándo.",
            "Clasificá el riesgo antes de investigar: daño potencial, alcance y urgencia.",
            "Distinguí el original de la copia: la primera publicación suele tener el contexto.",
            "Definí de antemano qué evidencia haría cambiar de opinión y qué estándar de prueba aplica.",
            "Buscá primero verificaciones ya publicadas; si existen, revisá su evidencia, no sólo su conclusión."
        ],
        exercise: "Tomá una afirmación viral y escribí la pregunta verificable, dos hipótesis rivales y la evidencia mínima para cada una.",
        sources: [
            { title: "Full Fact — Critical thinking and claim triage", url: "https://fullfact.org/training/verification-and-osint-training/" },
            { title: "Bellingcat Toolkit — Guides & Handbooks", url: "https://bellingcat.gitbook.io/toolkit/resources/guides-and-handbooks" }
        ]
    },
    {
        id: "geolocation",
        title: "Geolocalización y cronolocalización",
        level: "Intermedio",
        summary: "Pasar de una imagen sin contexto a un lugar y una fecha defendibles.",
        keyPoints: [
            "Empezá por referencias estables: relieve, vías, carteles, mobiliario urbano y numeración.",
            "Usá varias fuentes de mapas: satélite histórico, vistas de calle colaborativas y mapas locales.",
            "Las imágenes colaborativas tienen huecos y errores; confirmá cada coincidencia con una segunda fuente.",
            "Ajustá sombras y hora solar con la fecha declarada y descartá estaciones incompatibles.",
            "Documentá el punto exacto y la cadena de deducciones; una ubicación aproximada no es un hecho."
        ],
        exercise: "Elegí una foto con carteles y estimá país, ciudad y fecha; anotá las tres pistas que sostienen cada paso.",
        sources: [
            { title: "Bellingcat Toolkit — Geolocation", url: "https://bellingcat.gitbook.io/toolkit/categories/geolocation" },
            { title: "Full Fact — Geolocation module", url: "https://fullfact.org/training/verification-and-osint-training/" }
        ]
    },
    {
        id: "corporate-records",
        title: "Empresas, propiedad y sanciones",
        level: "Intermedio",
        summary: "Leer registros mercantiles sin confundir una coincidencia de nombre con un vínculo.",
        keyPoints: [
            "Buscá por nombre legal y variantes, y confirmá con país, fecha de constitución y domicilio.",
            "La propiedad efectiva no siempre coincide con los directivos que figuran en el registro.",
            "En sanciones, descartá homónimos con fecha de nacimiento, país o identificador oficial.",
            "Los registros de cada país tienen cobertura y actualización distintas: anotá la fecha de consulta.",
            "Presentá cada relación con su fuente y su nivel de confianza, nunca como una acusación."
        ],
        exercise: "Elegí una empresa ficticia y armá una ficha con registro, directivos, propietarios declarados y dos dudas abiertas.",
        sources: [
            { title: "Bellingcat Toolkit — Companies & Finance", url: "https://bellingcat.gitbook.io/toolkit/categories/companies-and-finance" },
            { title: "OpenSanctions", url: "https://www.opensanctions.org" }
        ]
    },
    {
        id: "archive-evidence",
        title: "Archivo y cadena de evidencia",
        level: "Intermedio",
        summary: "Conservar lo que se consultó para que otra persona pueda revisarlo.",
        keyPoints: [
            "Guardá la copia en el momento de la consulta: el contenido puede cambiar o desaparecer.",
            "Anotá URL, fecha y hora con zona horaria, y el método usado para capturar.",
            "Un archivo web sirve para documentar, pero no equivale a evidencia forense ni a cadena de custodia.",
            "Separá la captura original de las notas: no edites el archivo que presentás como evidencia.",
            "Exportá el conjunto del caso con un índice que vincule cada archivo con su hallazgo."
        ],
        exercise: "Archivá una página pública, guardá su URL y fecha, y escribí un índice de tres líneas para otra persona.",
        sources: [
            { title: "Bellingcat Toolkit — Archiving", url: "https://bellingcat.gitbook.io/toolkit/categories/archiving" },
            { title: "Bellingcat Toolkit — Atlos (límites de evidencia)", url: "https://bellingcat.gitbook.io/toolkit/more/all-tools/atlos" }
        ]
    },
    {
        id: "ioc-graph",
        title: "Del indicador al Knowledge Graph",
        level: "Intermedio",
        summary: "Cómo pasar de un IOC suelto a un vínculo con evidencia.",
        keyPoints: [
            "Todo IOC necesita fuente, confianza y el motivo por el que se registró.",
            "La severidad describe el impacto posible, no la certeza del dato.",
            "Vinculá entidades sólo cuando el vínculo esté respaldado por evidencia.",
            "Un falso positivo también se documenta: evita repetir el trabajo.",
            "Exportá el set antes de cerrar el caso para conservar trazabilidad."
        ],
        exercise: "Registrá tres IOCs de un caso ficticio y vinculá uno al Knowledge Graph con confianza media."
    }
];

export const LABS = [
    {
        id: "missing-photo",
        title: "Laboratorio: persona desaparecida a partir de una foto",
        scenario: "Caso sintético. Recibís una fotografía sin contexto y necesitás ubicarla sin contactar a nadie.",
        steps: [
            "Recortar la imagen y hacer búsqueda inversa en al menos dos motores.",
            "Revisar EXIF y metadatos sin modificar el archivo original.",
            "Identificar puntos de referencia y buscar su ubicación en mapas.",
            "Estimar fecha y hora con sombras y condiciones climáticas.",
            "Registrar cada hallazgo con fuente y nivel de confianza en el caso.",
            "No contactar cuentas ni publicar la imagen en foros."
        ]
    },
    {
        id: "phishing-triage",
        title: "Laboratorio: triage de un correo de phishing",
        scenario: "Caso sintético. Un cliente reenvía un correo sospechoso y pide saber si es peligroso.",
        steps: [
            "Guardar encabezados completos y el cuerpo sin abrir adjuntos.",
            "Extraer dominio del remitente, URL y dirección IP de origen.",
            "Registrar cada dato como IOC con severidad y confianza.",
            "Verificar reputación y antigüedad del dominio en fuentes independientes.",
            "Vincular dominio e IP en el Knowledge Graph.",
            "Exportar los IOCs y redactar recomendaciones para el cliente."
        ]
    },
    {
        id: "geolocate-photo",
        title: "Laboratorio: ubicar una foto sin metadatos",
        scenario: "Caso sintético. Una imagen sin EXIF muestra una avenida con carteles y montañas al fondo; hay que ubicarla y fecharla.",
        steps: [
            "Guardar el original y anotar la fuente y la fecha en que llegó a tus manos.",
            "Leer los carteles y el idioma antes de mirar mapas: acotan país y región.",
            "Identificar tres referencias estables (relieve, edificio, mobiliario) y buscarlas en mapas.",
            "Comparar vistas de calle y satélite de la zona candidata y descartar las que no encajen.",
            "Estimar la hora y la estación con sombras, vegetación y clima, y marcar el resultado como estimación.",
            "Registrar la cadena de deducciones con enlaces y capturas fechadas."
        ],
        sources: [
            { title: "Bellingcat Toolkit — Geolocation", url: "https://bellingcat.gitbook.io/toolkit/categories/geolocation" }
        ]
    },
    {
        id: "viral-claim",
        title: "Laboratorio: verificar una afirmación viral",
        scenario: "Caso sintético. Un video con un edificio en llamas circula como si fuera de hoy; hay que decidir qué se puede afirmar.",
        steps: [
            "Escribir la afirmación exacta y la pregunta verificable, separando hechos de interpretaciones.",
            "Localizar la primera publicación conocida y anotar fecha, cuenta y contexto original.",
            "Extraer fotogramas y buscar coincidencias anteriores en archivos y medios locales.",
            "Comprobar si el evento ya fue verificado o desmentido por una fuente independiente.",
            "Clasificar la afirmación como verdadera, falsa, engañosa o no concluyente, con la evidencia disponible.",
            "Publicar la conclusión con sus límites y sin identificar a personas privadas."
        ],
        sources: [
            { title: "Full Fact — Verification and OSINT training", url: "https://fullfact.org/training/verification-and-osint-training/" },
            { title: "Bellingcat Toolkit — Image/Video", url: "https://bellingcat.gitbook.io/toolkit/categories/image-video" }
        ]
    },
    {
        id: "company-check",
        title: "Laboratorio: due diligence básica de una empresa",
        scenario: "Caso sintético. Antes de firmar con un proveedor hay que comprobar que existe, quién responde por él y si aparece en sanciones.",
        steps: [
            "Confirmar el nombre legal, el país y la fecha de constitución en el registro mercantil.",
            "Identificar directivos y propietarios declarados, y anotar la fuente de cada dato.",
            "Buscar el nombre y sus variantes en listas de sanciones y personas expuestas políticamente.",
            "Revisar el dominio, la web archivada y los perfiles corporativos para detectar inconsistencias.",
            "Separar los vínculos documentados de las coincidencias de nombre y asignar confianza.",
            "Redactar un resumen con evidencia, dudas abiertas y recomendación de continuar o detener."
        ],
        sources: [
            { title: "Bellingcat Toolkit — Companies & Finance", url: "https://bellingcat.gitbook.io/toolkit/categories/companies-and-finance" },
            { title: "OpenCorporates", url: "https://opencorporates.com" }
        ]
    }
];

export const QUIZZES = [
    {
        id: "fundamentals",
        title: "Cuestionario: fundamentos de investigación",
        questions: [
            {
                id: "q1",
                question: "¿Qué dato conviene registrar junto a cada hallazgo?",
                options: ["Sólo el enlace", "Fuente, fecha y nivel de confianza", "La conclusión final", "El nombre del analista únicamente"],
                answer: 1,
                explanation: "Sin fuente, fecha y confianza el hallazgo no se puede revisar ni auditar."
            },
            {
                id: "q2",
                question: "Un IOC con confianza media significa que…",
                options: ["Es falso", "Está confirmado por dos fuentes", "Todavía requiere verificación adicional", "Ya se puede publicar como certeza"],
                answer: 2,
                explanation: "La confianza expresa cuánto respaldo tiene el dato, no una conclusión cerrada."
            },
            {
                id: "q3",
                question: "¿Cuándo es aceptable interactuar con una cuenta investigada?",
                options: ["Siempre que sea desde una cuenta nueva", "Nunca sin autorización y planificación previa", "Cuando la cuenta es pública", "Si el caso es urgente"],
                answer: 1,
                explanation: "Interactuar altera el entorno y puede exponer al analista o a terceros."
            },
            {
                id: "q4",
                question: "Una búsqueda inversa de imagen exitosa demuestra…",
                options: ["Que la imagen es auténtica", "Que existe en otro sitio", "La fecha exacta de captura", "La identidad de la persona"],
                answer: 1,
                explanation: "Encontrar copias sólo indica presencia previa; no valida el contenido ni la fecha."
            },
            {
                id: "q5",
                question: "¿Qué hacés primero con un enlace sospechoso?",
                options: ["Abrirlo desde el navegador personal", "Reenviarlo al cliente", "Analizarlo en un entorno aislado y archivarlo", "Acortarlo para probar"],
                answer: 2,
                explanation: "Se analiza en un entorno controlado y se conserva la evidencia antes de tocarlo."
            }
        ]
    },
    {
        id: "sources",
        title: "Cuestionario: fuentes, mapas y evidencia",
        questions: [
            {
                id: "s1",
                question: "Encontrar una imagen en Internet prueba que…",
                options: ["Es auténtica y actual", "Existe una copia en otro sitio", "La tomó la primera cuenta que la publicó", "El lugar está confirmado"],
                answer: 1,
                explanation: "La copia sólo muestra presencia previa; la autenticidad, la fecha y el lugar se verifican por separado."
            },
            {
                id: "s2",
                question: "¿Qué hacés antes de geolocalizar una foto?",
                options: ["Publicarla para pedir ayuda", "Anotar fuente y fecha y leer los elementos visibles", "Borrrar los metadatos", "Contactar a la persona que aparece"],
                answer: 1,
                explanation: "La procedencia y los elementos visibles acotan la búsqueda y evitan contaminar la evidencia."
            },
            {
                id: "s3",
                question: "Una coincidencia de nombre en una lista de sanciones es suficiente para concluir que…",
                options: ["La persona está sancionada", "Hay que descartar homónimos con más datos", "La empresa es ilegal", "El caso está cerrado"],
                answer: 1,
                explanation: "Los homónimos son frecuentes: se contrasta con fecha de nacimiento, país o identificador oficial."
            },
            {
                id: "s4",
                question: "Una captura en un archivo web sirve principalmente para…",
                options: ["Demostrar la autoría", "Documentar el contenido y su fecha de consulta", "Sustituir una cadena de custodia", "Probar que el hecho ocurrió"],
                answer: 1,
                explanation: "Documenta lo publicado, pero no sustituye una cadena de custodia ni prueba los hechos por sí sola."
            },
            {
                id: "s5",
                question: "Un detector de contenido sintético devuelve 80% de probabilidad de IA. ¿Cómo se reporta?",
                options: ["Como prueba definitiva de manipulación", "Como un indicio que se suma a otras verificaciones", "Como una acusación al autor", "No se reporta"],
                answer: 1,
                explanation: "Los detectores tienen falsos positivos y negativos: el resultado es un indicio, no una conclusión."
            }
        ]
    }
];

function emptyProgress() {
    return { lessons: [], labs: {}, quizzes: {} };
}

function readStored() {
    if (typeof localStorage === "undefined") return emptyProgress();
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        if (!parsed || typeof parsed !== "object") return emptyProgress();
        const labs = {};
        for (const [labId, steps] of Object.entries(parsed.labs || {})) {
            const lab = LABS.find(item => item.id === labId);
            if (lab && Array.isArray(steps)) labs[labId] = steps.filter(step => lab.steps.includes(step));
        }
        return {
            lessons: Array.isArray(parsed.lessons) ? parsed.lessons.filter(id => LESSONS.some(l => l.id === id)) : [],
            labs,
            quizzes: parsed.quizzes && typeof parsed.quizzes === "object" ? parsed.quizzes : {}
        };
    } catch {
        return emptyProgress();
    }
}

let progress = readStored();

function persist() {
    if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
}

export function getAcademyProgress() {
    return JSON.parse(JSON.stringify(progress));
}

export function getLesson(id) {
    return LESSONS.find(lesson => lesson.id === id);
}

export function getLab(id) {
    return LABS.find(lab => lab.id === id);
}

export function getQuiz(id) {
    return QUIZZES.find(quiz => quiz.id === id);
}

export function isLessonCompleted(id) {
    if (!getLesson(id)) throw new Error(`Lección desconocida: ${id}`);
    return progress.lessons.includes(id);
}

export function toggleLessonCompleted(id) {
    if (!getLesson(id)) throw new Error(`Lección desconocida: ${id}`);
    progress.lessons = progress.lessons.includes(id)
        ? progress.lessons.filter(lesson => lesson !== id)
        : [...progress.lessons, id];
    persist();
    return progress.lessons.includes(id);
}

export function getLabChecked(labId) {
    if (!getLab(labId)) throw new Error(`Laboratorio desconocido: ${labId}`);
    const checked = progress.labs[labId];
    return Array.isArray(checked) ? [...checked] : [];
}

export function toggleLabStep(labId, step) {
    const lab = getLab(labId);
    if (!lab) throw new Error(`Laboratorio desconocido: ${labId}`);
    if (!lab.steps.includes(step)) throw new Error(`Paso desconocido en ${labId}: ${step}`);
    const checked = getLabChecked(labId);
    progress.labs[labId] = checked.includes(step)
        ? checked.filter(item => item !== step)
        : [...checked, step];
    persist();
    return progress.labs[labId];
}

export function isLabCompleted(labId) {
    const lab = getLab(labId);
    if (!lab) throw new Error(`Laboratorio desconocido: ${labId}`);
    return getLabChecked(labId).length === lab.steps.length;
}

export function gradeQuiz(quizId, answers) {
    const quiz = getQuiz(quizId);
    if (!quiz) throw new Error(`Cuestionario desconocido: ${quizId}`);
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
        throw new Error("Las respuestas no coinciden con las preguntas del cuestionario");
    }

    const results = quiz.questions.map((question, index) => {
        const given = answers[index];
        const valid = given === null || given === undefined || (Number.isInteger(given) && given >= 0 && given < question.options.length);
        if (!valid) throw new Error(`Respuesta inválida en ${question.id}`);
        return {
            id: question.id,
            given: Number.isInteger(given) ? given : null,
            expected: question.answer,
            correct: given === question.answer,
            explanation: question.explanation
        };
    });

    const score = results.filter(result => result.correct).length;
    const percent = Math.round((score / quiz.questions.length) * 100);
    progress.quizzes[quizId] = {
        score,
        total: quiz.questions.length,
        percent,
        at: new Date().toISOString()
    };
    persist();
    return { score, total: quiz.questions.length, percent, passed: percent >= PASSING_PERCENT, results };
}

export function getQuizResult(quizId) {
    const result = progress.quizzes[quizId];
    return result ? { ...result } : null;
}

export function getAcademyStats() {
    const labsCompleted = LABS.filter(lab => getLabChecked(lab.id).length === lab.steps.length).length;
    const bestQuiz = Object.values(progress.quizzes).reduce((best, item) => Math.max(best, item.percent || 0), 0);
    return {
        lessonsCompleted: progress.lessons.length,
        lessonsTotal: LESSONS.length,
        labsCompleted,
        labsTotal: LABS.length,
        bestQuiz,
        quizTotal: QUIZZES.length
    };
}

export function resetAcademy() {
    progress = emptyProgress();
    persist();
}
