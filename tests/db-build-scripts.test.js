/*
 * `db:validate` and `db:compile` are used as build steps, so running them twice
 * has to be harmless: validate only reads JSON and compile only counts what it
 * reads. These tests run the real scripts twice and pin that contract, so a
 * future edit that starts writing files or depending on prior state fails here
 * instead of producing an unreproducible database.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { describe, it, expect } from "vitest";

const ROOT = path.resolve(__dirname, "..");
const DB = path.join(ROOT, "database/falcon.db");

function runScript(script) {
    return execFileSync(process.execPath, [path.join(ROOT, script)], { cwd: ROOT, encoding: "utf8" });
}

describe("database build scripts", () => {
    it("validates the JSON catalog the same way on every run", () => {
        const first = runScript("intelligence/build/validate-json.mjs");
        const second = runScript("intelligence/build/validate-json.mjs");

        expect(first).toBe(second);
        expect(first).toContain("All JSON files are valid.");
    });

    it("compiles the catalog deterministically without rewriting the database", () => {
        const before = fs.readFileSync(DB);
        const first = runScript("intelligence/build/compile-db.mjs");
        const second = runScript("intelligence/build/compile-db.mjs");

        expect(first).toBe(second);
        expect(first).toContain("Falcon DB compilation finished.");
        expect(fs.readFileSync(DB).equals(before)).toBe(true);
    });
});
