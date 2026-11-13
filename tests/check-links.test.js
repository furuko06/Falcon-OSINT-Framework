import { describe, it, expect } from "vitest";
import { collectLinks, checkUrl } from "../intelligence/build/check-links.mjs";

describe("check-links", () => {
    it("collects website and docs links, skipping empty ones", () => {
        const links = collectLinks([
            { name: "A", website: "https://a.example", docs: "" },
            { name: "B", website: "https://b.example", docs: "https://b.example/docs" },
            { name: "C" }
        ]);
        expect(links.map(l => l.url)).toEqual([
            "https://a.example",
            "https://b.example",
            "https://b.example/docs"
        ]);
    });

    it("marks 2xx and 3xx responses as ok", async () => {
        const fetchOk = async () => ({ status: 200 });
        const fetchRedirect = async () => ({ status: 301 });
        expect((await checkUrl("https://x.example", fetchOk)).ok).toBe(true);
        expect((await checkUrl("https://x.example", fetchRedirect)).ok).toBe(true);
    });

    it("marks 4xx/5xx responses as broken", async () => {
        const fetch404 = async () => ({ status: 404 });
        const result = await checkUrl("https://x.example", fetch404);
        expect(result.ok).toBe(false);
        expect(result.status).toBe(404);
    });

    it("marks network errors and non-http protocols as broken", async () => {
        const fetchFail = async () => { throw new Error("ENOTFOUND"); };
        expect((await checkUrl("https://x.example", fetchFail)).ok).toBe(false);
        expect((await checkUrl("ftp://x.example", fetchFail)).ok).toBe(false);
    });
});
