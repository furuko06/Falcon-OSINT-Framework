import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const index = fs.readFileSync("index.html", "utf8");
const cards = fs.readFileSync("framework/modules/explorer/cards.js", "utf8");
const headers = fs.readFileSync("public/_headers", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

function workflowFiles() {
    return fs.readdirSync(".github/workflows")
        .filter(file => file.endsWith(".yml"))
        .map(file => ({ file, content: fs.readFileSync(path.join(".github/workflows", file), "utf8") }));
}

describe("security hardening", () => {
    it("ships a strict CSP without inline scripts or styles", () => {
        const csp = index.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] || "";
        expect(csp).toContain("script-src 'self' 'wasm-unsafe-eval'");
        expect(csp).toContain("script-src-attr 'none'");
        expect(csp).toContain("style-src 'self'");
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain("https://openrouter.ai");
        expect(index).not.toContain("<style");
        expect(index).not.toMatch(/\sstyle="/);
        expect(cards).not.toMatch(/\sstyle="/);
    });

    it("documents defense-in-depth headers for compatible hosts", () => {
        expect(headers).toContain("frame-ancestors 'none'");
        expect(headers).toContain("X-Content-Type-Options: nosniff");
        expect(headers).toContain("Permissions-Policy:");
    });

    it("pins every third-party action and grants least privilege", () => {
        for (const { file, content } of workflowFiles()) {
            expect(content, `${file} needs top-level permissions`).toMatch(/^permissions:/m);
            const actions = [...content.matchAll(/^\s*uses:\s*([^\s#]+)/gm)].map(match => match[1]);
            for (const action of actions) {
                if (action.startsWith("./")) continue;
                expect(action, `${file} action ${action} must be pinned to a SHA`).toMatch(/@[0-9a-f]{40}$/i);
            }
        }
    });

    it("ships dependency, secret and accessibility automation", () => {
        expect(pkg.scripts["security:scan"]).toBeTruthy();
        expect(pkg.scripts.a11y).toBeTruthy();
        expect(fs.existsSync(".github/dependabot.yml")).toBe(true);
        expect(fs.existsSync(".github/CODEOWNERS")).toBe(true);
        expect(fs.existsSync(".github/workflows/codeql.yml")).toBe(true);
        expect(fs.existsSync("docs/audits/A11Y_AUDIT.md")).toBe(true);
    });
});
