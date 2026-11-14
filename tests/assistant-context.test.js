/*
 * The retrieved context is a measured contract, not a tuning knob: cutting
 * MAX_CONTEXT_DOCS from six to four for speed dropped the geolocation playbook
 * from the retrieved set and the offline retrieval hit rate fell from 1.0 to
 * 0.9, which the 0.8 threshold accepted in silence.
 *
 * These tests run the real catalog and the real evaluation questions, so a
 * change to the context size or to the ranking fails here within a second
 * instead of only in the release gates. If a change is intended, re-run
 * `npm run eval:model -- --offline` first and update the numbers on purpose.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";
import { describe, it, expect } from "vitest";

import { LESSONS, LABS } from "../framework/modules/academy/academy.js";
import { PLAYBOOKS } from "../framework/modules/playbooks/playbooks.js";
import { MAX_CONTEXT_DOCS, buildDocuments, retrieve } from "../framework/modules/assistant/assistant.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SQL = await initSqlJs({ locateFile: file => path.join(ROOT, "node_modules/sql.js/dist", file) });
const db = new SQL.Database(fs.readFileSync(path.join(ROOT, "database/falcon.db")));
const statement = db.prepare("SELECT name, category, subcategory, description, website FROM tools");
const tools = [];
while (statement.step()) tools.push(statement.getAsObject());
statement.free();
db.close();

const documents = buildDocuments({ tools, lessons: LESSONS, labs: LABS, playbooks: PLAYBOOKS });
const dataset = JSON.parse(fs.readFileSync(path.join(ROOT, "evaluation/model-eval.json"), "utf8"));
const retrievalCases = dataset.cases.filter(evalCase => (evalCase.expected_source_ids || []).length > 0);

describe("assistant context contract", () => {
    it("keeps the six-document context the evaluation was measured with", () => {
        expect(MAX_CONTEXT_DOCS).toBe(6);
    });

    it.each(retrievalCases.map(evalCase => [evalCase.id, evalCase]))(
        "retrieves a source the evaluation expects for %s",
        (_id, evalCase) => {
            const found = retrieve(documents, evalCase.question).map(document => document.id);
            expect(found.length).toBeGreaterThan(0);
            expect(found.some(id => evalCase.expected_source_ids.includes(id))).toBe(true);
        }
    );
});
