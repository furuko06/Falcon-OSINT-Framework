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
        exercise: "Armá una checklist de cinco controles previos antes de iniciar una recolección."
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
        exercise: "Tomá una imagen pública y anotá tres pistas verificables y una que no puedas confirmar."
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
