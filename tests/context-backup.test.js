import { describe, it, expect } from "vitest";
import {
    QUERY_HISTORY_KEY,
    buildEnvironment,
    buildQueryEnvelope,
    loadQueryHistory,
    recordQuery
} from "../framework/modules/assistant/context.js";
import {
    BACKUP_FORMAT,
    buildBackup,
    collectLocalData,
    parseBackup,
    restoreBackup,
    sha256Hex
} from "../framework/modules/settings/backup.js";

class MemoryStorage {
    constructor(entries = {}) {
        this.map = new Map(Object.entries(entries));
    }
    get length() { return this.map.size; }
    key(index) { return [...this.map.keys()][index] ?? null; }
    getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
    setItem(key, value) { this.map.set(key, String(value)); }
    removeItem(key) { this.map.delete(key); }
}

function locationLike() {
    return { origin: "https://falcon.example", pathname: "/app/" };
}

function navigatorLike() {
    return {
        language: "es-AR",
        languages: ["es-AR", "en"],
        platform: "Win32",
        userAgent: "FalconTest/1.0",
        onLine: true
    };
}

function envelope(overrides = {}) {
    return buildQueryEnvelope({
        question: "¿Cómo verifico un video?",
        notes: "Nota sensible",
        includeNotes: true,
        sources: [{ n: 1, id: "playbook:video", kind: "Playbook", title: "Video", url: "https://example.com/v" }],
        context: "[1] Playbook · Video",
        prompt: "Prompt exacto",
        provider: "openrouter",
        model: "openrouter/auto",
        appVersion: "0.3.0-alpha",
        schemaVersion: 2,
        environment: buildEnvironment({
            locationLike: locationLike(),
            navigatorLike: navigatorLike(),
            screenLike: { width: 1440, height: 900 },
            now: new Date("2026-11-13T12:00:00.000Z")
        }),
        now: new Date("2026-11-13T12:00:00.000Z"),
        ...overrides
    });
}

describe("assistant query context", () => {
    it("captures the environment where the query was produced", () => {
        const context = envelope();
        expect(context.environment).toMatchObject({
            origin: "https://falcon.example",
            path: "/app/",
            locale: "es-AR",
            platform: "Win32",
            online: true,
            screen: "1440x900"
        });
        expect(context.prompt).toBe("Prompt exacto");
        expect(context.sources[0]).toMatchObject({ n: 1, title: "Video" });
    });

    it("omits notes unless the analyst opted in", () => {
        expect(envelope().notes).toBe("Nota sensible");
        const withoutNotes = envelope({ includeNotes: false });
        expect(withoutNotes.notes).toBe("");
        expect(withoutNotes.notes_included).toBe(false);
    });

    it("keeps the newest queries first and respects the limit", () => {
        const storage = new MemoryStorage();
        for (let index = 1; index <= 4; index++) {
            recordQuery(envelope({ question: `Pregunta ${index}` }), { storage, limit: 3 });
        }
        const history = loadQueryHistory(storage);
        expect(history.map(item => item.question)).toEqual(["Pregunta 4", "Pregunta 3", "Pregunta 2"]);
    });
});

describe("local backup", () => {
    it("includes environment, query context and catalog checksum without secrets", async () => {
        const storage = new MemoryStorage({
            "falcon:assistant": "{\"model\":\"local\"}",
            "falcon:openrouter:session": "{\"key\":\"sk-or-secret\"}",
            "falcon:query-history": JSON.stringify([envelope()]),
            "other-app": "ignored"
        });

        const backup = await buildBackup({
            storage,
            databaseBytes: new Uint8Array([1, 2, 3, 4]),
            app: { version: "0.3.0-alpha", schemaVersion: 2 },
            environment: buildEnvironment({
                locationLike: locationLike(),
                navigatorLike: navigatorLike(),
                now: new Date("2026-11-13T12:00:00.000Z")
            }),
            now: new Date("2026-11-13T12:00:00.000Z")
        });

        expect(backup.format).toBe(BACKUP_FORMAT);
        expect(backup.environment.origin).toBe("https://falcon.example");
        expect(backup.queries[0].prompt).toBe("Prompt exacto");
        expect(backup.database).toMatchObject({ bytes: 4, filename: "falcon.db" });
        expect(backup.database.sha256).toBe(await sha256Hex(new Uint8Array([1, 2, 3, 4])));
        expect(backup.local_data).toHaveProperty("falcon:assistant");
        expect(backup.local_data).not.toHaveProperty("falcon:openrouter:session");
        expect(backup.local_data).not.toHaveProperty("other-app");
        expect(backup.local_data).not.toHaveProperty(QUERY_HISTORY_KEY);
    });

    it("never collects credential-like local keys", () => {
        const storage = new MemoryStorage({
            "falcon:api-key": "sk-secret",
            "falcon:theme": "dark",
            "falcon:openrouter:session": "secret"
        });
        expect(collectLocalData(storage)).toEqual({ "falcon:theme": "dark" });
    });

    it("restores local data and query history but skips credentials", () => {
        const storage = new MemoryStorage();
        const result = restoreBackup({
            format: BACKUP_FORMAT,
            format_version: 1,
            created_at: "2026-11-13T12:00:00.000Z",
            local_data: {
                "falcon:theme": "dark",
                "falcon:api-key": "sk-secret",
                "outside": "ignored"
            },
            queries: [envelope()]
        }, { storage, now: new Date("2026-11-13T13:00:00.000Z") });

        expect(storage.getItem("falcon:theme")).toBe("dark");
        expect(storage.getItem("falcon:api-key")).toBeNull();
        expect(storage.getItem("outside")).toBeNull();
        expect(loadQueryHistory(storage)).toHaveLength(1);
        expect(result.skipped).toContain("falcon:api-key");
    });

    it("rejects files that are not Falcon backups", () => {
        expect(() => parseBackup("{}")).toThrow(/backup de Falcon/);
        expect(() => parseBackup("no-json")).toThrow(/JSON válido/);
        expect(() => parseBackup({ format: BACKUP_FORMAT, format_version: 99 })).toThrow(/no soportada/);
    });
});
