import { describe, it, expect, beforeEach, vi } from "vitest";

const store = new Map();
globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
};

let academy;

async function loadModules() {
    vi.resetModules();
    store.clear();
    academy = await import("../framework/modules/academy/academy.js");
}

describe("academy (E11)", () => {
    beforeEach(loadModules);

    it("ships lessons, labs and a quiz with valid answers", () => {
        expect(academy.LESSONS.length).toBeGreaterThanOrEqual(4);
        for (const lesson of academy.LESSONS) {
            expect(lesson.keyPoints.length).toBeGreaterThan(0);
            expect(lesson.exercise).toBeTruthy();
        }
        for (const lab of academy.LABS) {
            expect(lab.steps.length).toBeGreaterThan(2);
        }
        for (const quiz of academy.QUIZZES) {
            for (const question of quiz.questions) {
                expect(question.answer).toBeGreaterThanOrEqual(0);
                expect(question.answer).toBeLessThan(question.options.length);
                expect(question.explanation).toBeTruthy();
            }
        }
    });

    it("toggles lessons and persists the progress", () => {
        expect(academy.isLessonCompleted("opsec")).toBe(false);
        expect(academy.toggleLessonCompleted("opsec")).toBe(true);
        expect(academy.isLessonCompleted("opsec")).toBe(true);
        expect(academy.getAcademyStats().lessonsCompleted).toBe(1);
        expect(academy.toggleLessonCompleted("opsec")).toBe(false);
        expect(JSON.parse(store.get("falcon:academy")).lessons).toEqual([]);
    });

    it("toggles lab steps and counts a lab as completed only with every step", () => {
        const lab = academy.LABS[0];
        for (const step of lab.steps.slice(0, -1)) academy.toggleLabStep(lab.id, step);
        expect(academy.getAcademyStats().labsCompleted).toBe(0);
        academy.toggleLabStep(lab.id, lab.steps.at(-1));
        expect(academy.getAcademyStats().labsCompleted).toBe(1);
        academy.toggleLabStep(lab.id, lab.steps[0]);
        expect(academy.getLabChecked(lab.id)).not.toContain(lab.steps[0]);
    });

    it("grades quizzes, stores the last result and flags passing scores", () => {
        const quiz = academy.QUIZZES[0];
        const allCorrect = quiz.questions.map(question => question.answer);
        const perfect = academy.gradeQuiz(quiz.id, allCorrect);
        expect(perfect).toMatchObject({ score: quiz.questions.length, percent: 100, passed: true });
        expect(academy.getQuizResult(quiz.id)).toMatchObject({ percent: 100 });

        const partial = allCorrect.map((answer, index) => (index === 0 ? (answer + 1) % 2 : answer));
        const result = academy.gradeQuiz(quiz.id, partial);
        expect(result.score).toBe(quiz.questions.length - 1);
        expect(result.results.find(item => !item.correct).explanation).toBeTruthy();
        expect(academy.getAcademyStats().bestQuiz).toBe(80);
    });

    it("rejects unknown lessons, labs, steps and malformed answers", () => {
        expect(() => academy.toggleLessonCompleted("nope")).toThrow();
        expect(() => academy.toggleLabStep("nope", "x")).toThrow();
        expect(() => academy.toggleLabStep(academy.LABS[0].id, "no such step")).toThrow();
        expect(() => academy.gradeQuiz("nope", [])).toThrow();
        expect(() => academy.gradeQuiz(academy.QUIZZES[0].id, [0])).toThrow();
        expect(() => academy.gradeQuiz(academy.QUIZZES[0].id, new Array(academy.QUIZZES[0].questions.length).fill(99))).toThrow();
    });

    it("resets the stored progress", () => {
        academy.toggleLessonCompleted("opsec");
        academy.gradeQuiz(academy.QUIZZES[0].id, academy.QUIZZES[0].questions.map(q => q.answer));
        academy.resetAcademy();
        expect(academy.getAcademyStats()).toMatchObject({ lessonsCompleted: 0, labsCompleted: 0, bestQuiz: 0 });
    });
});
