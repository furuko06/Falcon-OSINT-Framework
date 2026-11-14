import { describe, it, expect } from "vitest";
import {
    applyProvenance,
    checkSource,
    classifyHttpStatus,
    provenanceIssues,
    sourceUrl,
    writeToolFile,
    readToolFile
} from "../scripts/verify-sources.mjs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TODAY = new Date("2026-11-13T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

describe("classifyHttpStatus", () => {
    it("treats 2xx and 3xx as verified", () => {
        expect(classifyHttpStatus(200)).toBe("verified");
        expect(classifyHttpStatus(204)).toBe("verified");
        expect(classifyHttpStatus(301)).toBe("verified");
    });

    it("separates bot protection and rate limits from link rot", () => {
        expect(classifyHttpStatus(401)).toBe("restricted");
        expect(classifyHttpStatus(403)).toBe("restricted");
        expect(classifyHttpStatus(400)).toBe("restricted");
        expect(classifyHttpStatus(429)).toBe("restricted");
    });

    it("marks missing pages and server errors as broken", () => {
        expect(classifyHttpStatus(404)).toBe("broken");
        expect(classifyHttpStatus(410)).toBe("broken");
        expect(classifyHttpStatus(503)).toBe("broken");
        expect(classifyHttpStatus(null)).toBe("broken");
    });
});

describe("applyProvenance", () => {
    it("records the check date and resulting status", () => {
        const next = applyProvenance(
            { name: "A", website: "https://example.org", status: "unverified" },
            { status: "restricted", date: "2026-11-13" }
        );
        expect(next.status).toBe("restricted");
        expect(next.last_verified).toBe("2026-11-13");
    });

    it("never overwrites a deliberate beta or deprecated label", () => {
        const beta = applyProvenance(
            { name: "B", website: "https://example.org", status: "beta" },
            { status: "verified", date: "2026-11-13" }
        );
        expect(beta.status).toBe("beta");
        expect(beta.last_verified).toBe("2026-11-13");

        const deprecated = applyProvenance(
            { name: "C", website: "https://example.org", status: "deprecated" },
            { status: "broken", date: "2026-11-13" }
        );
        expect(deprecated.status).toBe("deprecated");
    });

    it("marks an offline tool without URL as unchecked instead of dating it", () => {
        const next = applyProvenance({ name: "D", status: "verified" }, { status: "verified", date: "2026-11-13" });
        expect(next.status).toBe("unchecked");
        expect(next.last_verified).toBeUndefined();
    });
});

describe("provenanceIssues", () => {
    it("accepts complete provenance", () => {
        const issues = provenanceIssues([
            { name: "A", website: "https://example.org", status: "verified", last_verified: "2026-11-13" },
            { name: "B", status: "unchecked" }
        ], { today: TODAY });
        expect(issues).toEqual([]);
    });

    it("reports missing, invalid, future and stale dates", () => {
        const issues = provenanceIssues([
            { name: "no-date", website: "https://a.test", status: "verified" },
            { name: "bad-date", website: "https://b.test", status: "verified", last_verified: "ayer" },
            { name: "future", website: "https://c.test", status: "verified", last_verified: "2027-01-01" },
            { name: "stale", website: "https://d.test", status: "verified", last_verified: new Date(TODAY - 400 * DAY).toISOString() }
        ], { today: TODAY, maxAgeDays: 180 });
        expect(issues).toHaveLength(4);
        expect(issues.join("\n")).toMatch(/no-date: sin last_verified/);
        expect(issues.join("\n")).toMatch(/stale: last_verified vencida/);
    });

    it("reports a URL-less entry that claims to be verified", () => {
        const issues = provenanceIssues([{ name: "local", status: "verified", last_verified: "2026-11-13" }], { today: TODAY });
        expect(issues[0]).toMatch(/sin URL pública/);
    });
});

describe("checkSource", () => {
    it("reports a restricted host instead of a dead one", async () => {
        const fetchImpl = async () => ({ status: 403, body: null });
        await expect(checkSource("https://example.org", fetchImpl)).resolves.toMatchObject({
            status: "restricted",
            http: 403
        });
    });

    it("retries a server error once", async () => {
        let calls = 0;
        const fetchImpl = async () => ({ status: calls++ === 0 ? 503 : 200, body: null });
        await expect(checkSource("https://example.org", fetchImpl)).resolves.toMatchObject({ status: "verified" });
        expect(calls).toBe(2);
    });

    it("marks a network failure as broken and keeps the error", async () => {
        const fetchImpl = async () => { throw new Error("ECONNREFUSED"); };
        const result = await checkSource("https://example.org", fetchImpl);
        expect(result.status).toBe("broken");
        expect(result.error).toMatch(/ECONNREFUSED/);
    });

    it("does not call the network for a missing URL", async () => {
        const fetchImpl = async () => { throw new Error("should not run"); };
        await expect(checkSource("", fetchImpl)).resolves.toMatchObject({ status: "unchecked" });
    });
});

describe("sourceUrl", () => {
    it("prefers the website and rejects non-http urls", () => {
        expect(sourceUrl({ website: " https://a.test ", docs: "https://docs.test" })).toBe("https://a.test");
        expect(sourceUrl({ website: "javascript:alert(1)" })).toBe("");
        expect(sourceUrl({ github: "user/repo" })).toBe("");
    });
});

describe("writeToolFile", () => {
    it("preserves the one-entry-per-line layout", () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "falcon-provenance-"));
        const file = path.join(dir, "pack.json");
        fs.writeFileSync(file, "[\n  {\"name\":\"A\"},\n  {\"name\":\"B\"}\n]\n");
        writeToolFile(file, [{ name: "A", status: "verified" }, { name: "B" }]);
        const content = fs.readFileSync(file, "utf8");
        expect(content).toBe("[\n  {\"name\":\"A\",\"status\":\"verified\"},\n  {\"name\":\"B\"}\n]\n");
        expect(readToolFile(file)).toHaveLength(2);
        fs.rmSync(dir, { recursive: true, force: true });
    });

    it("keeps pretty packs pretty", () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "falcon-provenance-"));
        const file = path.join(dir, "pack.json");
        fs.writeFileSync(file, "[\n  {\n    \"name\": \"A\"\n  }\n]\n");
        writeToolFile(file, [{ name: "A", status: "verified" }]);
        expect(fs.readFileSync(file, "utf8")).toMatch(/\n {2}\{\n {4}"name": "A"/);
        fs.rmSync(dir, { recursive: true, force: true });
    });
});
