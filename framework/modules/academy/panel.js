/* ==========================================================
   Falcon Academy Panel - E11 (UI)
   ========================================================== */
import {
    LESSONS, LABS, QUIZZES,
    getAcademyStats, getQuizResult, gradeQuiz, isLessonCompleted,
    toggleLessonCompleted, getLabChecked, toggleLabStep, resetAcademy
} from "./academy.js";

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
}

function renderStats(stats) {
    return `
        <span>Lecciones <strong>${stats.lessonsCompleted}/${stats.lessonsTotal}</strong></span>
        <span>Laboratorios <strong>${stats.labsCompleted}/${stats.labsTotal}</strong></span>
        <span>Mejor cuestionario <strong>${stats.bestQuiz}%</strong></span>
    `;
}

function renderSources(sources = []) {
    if (sources.length === 0) return "";
    return `<p class="academy-sources">Fuentes: ${sources.map(source =>
        `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`
    ).join(" · ")}</p>`;
}

function renderLesson(lesson) {
    const completed = isLessonCompleted(lesson.id);
    return `
        <details class="academy-lesson">
            <summary>
                <span>${esc(lesson.title)}</span>
                ${completed ? '<span class="academy-done">✓ completada</span>' : ""}
                <span class="academy-level">${esc(lesson.level)}</span>
            </summary>
            <p>${esc(lesson.summary)}</p>
            <ul>${lesson.keyPoints.map(point => `<li>${esc(point)}</li>`).join("")}</ul>
            <p><strong>Ejercicio:</strong> ${esc(lesson.exercise)}</p>
            ${renderSources(lesson.sources)}
            <button class="btn-small" type="button" data-lesson="${esc(lesson.id)}">
                ${completed ? "Marcar pendiente" : "Marcar como completada"}
            </button>
        </details>`;
}

function renderLab(lab) {
    const checked = getLabChecked(lab.id);
    return `
        <div class="academy-lab">
            <h3>${esc(lab.title)}</h3>
            <p>${esc(lab.scenario)}</p>
            <ul class="academy-steps">
                ${lab.steps.map(step => `
                    <li>
                        <label>
                            <input type="checkbox" data-lab="${esc(lab.id)}" data-step="${esc(step)}" ${checked.includes(step) ? "checked" : ""}>
                            <span>${esc(step)}</span>
                        </label>
                    </li>`).join("")}
            </ul>
            <p class="collections-empty">${checked.length}/${lab.steps.length} pasos · ${checked.length === lab.steps.length ? "laboratorio completado" : "en progreso"}</p>
            ${renderSources(lab.sources)}
        </div>`;
}

function renderQuiz(quiz) {
    const result = getQuizResult(quiz.id);
    return `
        <form class="academy-quiz" data-quiz="${esc(quiz.id)}">
            <h3>${esc(quiz.title)}</h3>
            ${quiz.questions.map((question, index) => `
                <fieldset class="academy-question">
                    <legend>${index + 1}. ${esc(question.question)}</legend>
                    ${question.options.map((option, optionIndex) => `
                        <label>
                            <input type="radio" name="${esc(quiz.id)}_${esc(question.id)}" value="${optionIndex}">
                            <span>${esc(option)}</span>
                        </label>`).join("")}
                </fieldset>`).join("")}
            <div>
                <button class="btn-small" type="submit">Corregir</button>
                ${result ? `<span class="collections-empty"> · último intento: ${result.score}/${result.total} (${result.percent}%)</span>` : ""}
            </div>
            <div class="academy-result" data-quiz-result role="status"></div>
        </form>`;
}

export function renderAcademyPanel(container) {
    container.innerHTML = `
        <section class="academy-panel" aria-label="Academy">
            <header class="health-header">
                <h2>Academy</h2>
                <p>Metodología, OPSEC y verificación con casos sintéticos. El progreso se guarda en este navegador.</p>
            </header>
            <p class="academy-stats" data-academy-stats>${renderStats(getAcademyStats())}</p>
            <div>
                <h3 class="playbook-tactic">Lecciones</h3>
                ${LESSONS.map(renderLesson).join("")}
            </div>
            <div>
                <h3 class="playbook-tactic">Laboratorios</h3>
                ${LABS.map(renderLab).join("")}
            </div>
            <div>
                <h3 class="playbook-tactic">Cuestionarios</h3>
                ${QUIZZES.map(renderQuiz).join("")}
            </div>
            <button class="btn-small btn-danger" type="button" data-reset-academy>Reiniciar progreso</button>
        </section>`;

    container.querySelectorAll("[data-lesson]").forEach(button => {
        button.addEventListener("click", () => {
            toggleLessonCompleted(button.dataset.lesson);
            renderAcademyPanel(container);
        });
    });

    container.querySelectorAll("[data-step]").forEach(input => {
        input.addEventListener("change", () => {
            toggleLabStep(input.dataset.lab, input.dataset.step);
            renderAcademyPanel(container);
        });
    });

    container.querySelectorAll("[data-quiz]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();
            const quiz = QUIZZES.find(item => item.id === form.dataset.quiz);
            const answers = quiz.questions.map(question => {
                const chosen = form.querySelector(`input[name="${quiz.id}_${question.id}"]:checked`);
                return chosen ? Number(chosen.value) : null;
            });
            const result = gradeQuiz(quiz.id, answers);
            container.querySelector("[data-academy-stats]").innerHTML = renderStats(getAcademyStats());
            form.querySelector("[data-quiz-result]").innerHTML = `
                <p>Resultado: <strong>${result.score}/${result.total} (${result.percent}%)</strong> · ${result.passed ? "Aprobado" : "Repasar y volver a intentar"}</p>
                <ul>
                    ${result.results.map(item => {
                        const question = quiz.questions.find(q => q.id === item.id);
                        return `<li>${item.correct ? "✓" : "✘"} ${esc(question.question)} — ${esc(question.options[item.expected])}. ${esc(item.explanation)}</li>`;
                    }).join("")}
                </ul>`;
        });
    });

    container.querySelector("[data-reset-academy]").addEventListener("click", () => {
        if (!confirm("¿Reiniciar el progreso de Academy?")) return;
        resetAcademy();
        renderAcademyPanel(container);
    });
}
