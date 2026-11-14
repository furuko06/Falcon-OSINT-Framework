import { describe, it, expect, vi } from "vitest";

import {
    classifyDatabaseFailure,
    clearAppCaches
} from "../framework/database/recovery.js";

describe("classifyDatabaseFailure", () => {
    it("treats a failed download as recoverable without blaming the data", () => {
        const info = classifyDatabaseFailure(new Error("No se pudo descargar falcon.db (404)"));
        expect(info.kind).toBe("download");
        expect(info.title).toMatch(/No se pudo cargar/i);
        expect(info.actions).toEqual(["retry", "clear-cache"]);
    });

    it("detects a corrupt file even when the migration wrapper reports it", () => {
        const info = classifyDatabaseFailure(
            new Error("No se pudo migrar falcon.db: file is not a database")
        );
        expect(info.kind).toBe("corrupt");
    });

    it("keeps migration failures separate from corruption", () => {
        const info = classifyDatabaseFailure(
            new Error("No se pudo migrar falcon.db: no such column: last_verified")
        );
        expect(info.kind).toBe("migration");
        expect(info.detail).toContain("no such column");
    });

    it("falls back to unknown and still offers a retry path", () => {
        const info = classifyDatabaseFailure(new Error("boom"));
        expect(info.kind).toBe("unknown");
        expect(info.actions).toContain("retry");
        expect(info.detail).toBe("boom");
    });

    it("accepts plain strings and always returns a detail", () => {
        expect(classifyDatabaseFailure("SQLITE_NOTADB").kind).toBe("corrupt");
        expect(classifyDatabaseFailure().detail).toMatch(/Sin detalle/);
    });
});

describe("clearAppCaches", () => {
    it("deletes every cache and unregisters the service worker", async () => {
        const caches = {
            keys: vi.fn().mockResolvedValue(["falcon-1", "falcon-2"]),
            delete: vi.fn().mockResolvedValue(true)
        };
        const unregister = vi.fn().mockResolvedValue(true);
        const navigator = {
            serviceWorker: {
                getRegistrations: vi.fn().mockResolvedValue([{ unregister }, { unregister }])
            }
        };

        const result = await clearAppCaches({ caches, navigator });

        expect(caches.delete).toHaveBeenCalledWith("falcon-1");
        expect(caches.delete).toHaveBeenCalledWith("falcon-2");
        expect(unregister).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ cachesDeleted: 2, registrationsRemoved: 2, errors: [] });
    });

    it("never touches user storage and survives a hostile cache", async () => {
        const localStorage = { clear: vi.fn(), removeItem: vi.fn() };
        const caches = {
            keys: vi.fn().mockRejectedValue(new Error("cache exploded")),
            delete: vi.fn()
        };
        const navigator = { serviceWorker: { getRegistrations: vi.fn().mockResolvedValue([]) } };

        const result = await clearAppCaches({ caches, navigator, localStorage });

        expect(localStorage.clear).not.toHaveBeenCalled();
        expect(localStorage.removeItem).not.toHaveBeenCalled();
        expect(result.cachesDeleted).toBe(0);
        expect(result.errors[0]).toContain("cache exploded");
    });

    it("works when the browser exposes no cache or service worker", async () => {
        await expect(clearAppCaches({})).resolves.toEqual({
            cachesDeleted: 0,
            registrationsRemoved: 0,
            errors: []
        });
    });
});
