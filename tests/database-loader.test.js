import { describe, it, expect, vi } from "vitest";

import { createLoader } from "../framework/database/database.js";

describe("createLoader", () => {
    it("opens once for every concurrent caller", async () => {
        const open = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 20));
            return { db: true };
        });
        const loader = createLoader(open);

        const results = await Promise.all([loader.get(), loader.get(), loader.get()]);

        expect(open).toHaveBeenCalledTimes(1);
        expect(results).toEqual([{ db: true }, { db: true }, { db: true }]);
    });

    it("reuses the resolved database for later callers", async () => {
        const open = vi.fn().mockResolvedValue("db");
        const loader = createLoader(open);

        await loader.get();
        await loader.get();

        expect(open).toHaveBeenCalledTimes(1);
    });

    it("retries after a failed open instead of caching the rejection", async () => {
        const open = vi.fn()
            .mockRejectedValueOnce(new Error("falcon.db 404"))
            .mockResolvedValueOnce("db");
        const loader = createLoader(open);

        await expect(loader.get()).rejects.toThrow("falcon.db 404");
        await expect(loader.get()).resolves.toBe("db");
        expect(open).toHaveBeenCalledTimes(2);
    });

    it("keeps a single failure shared by concurrent callers", async () => {
        const open = vi.fn().mockRejectedValue(new Error("network down"));
        const loader = createLoader(open);

        const results = await Promise.allSettled([loader.get(), loader.get()]);

        expect(open).toHaveBeenCalledTimes(1);
        expect(results.map(r => r.status)).toEqual(["rejected", "rejected"]);
    });

    it("reset allows a fresh open", async () => {
        const open = vi.fn().mockResolvedValueOnce("first").mockResolvedValueOnce("second");
        const loader = createLoader(open);

        expect(await loader.get()).toBe("first");
        loader.reset();
        expect(await loader.get()).toBe("second");
        expect(open).toHaveBeenCalledTimes(2);
    });
});
