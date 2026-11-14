import { describe, it, expect } from "vitest";
import { collectLinks, checkUrl, isPublicHttpUrl } from "../intelligence/build/check-links.mjs";

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

    it("marks missing pages and server errors as broken", async () => {
        const fetch404 = async () => ({ status: 404 });
        const result = await checkUrl("https://x.example", fetch404);
        expect(result.ok).toBe(false);
        expect(result.state).toBe("broken");
        expect(result.status).toBe(404);

        const fetchGone = async () => ({ status: 410 });
        expect((await checkUrl("https://x.example", fetchGone)).state).toBe("broken");

        const fetch500 = async () => ({ status: 500 });
        expect((await checkUrl("https://x.example", fetch500)).state).toBe("broken");
    });

    it("marks a refused automated client as restricted, not broken", async () => {
        const fetch403 = async () => ({ status: 403 });
        const fetch429 = async () => ({ status: 429 });
        const forbidden = await checkUrl("https://x.example", fetch403);
        expect(forbidden.ok).toBe(false);
        expect(forbidden.state).toBe("restricted");
        expect(forbidden.status).toBe(403);
        expect((await checkUrl("https://x.example", fetch429)).state).toBe("restricted");
    });

    it("marks network errors and non-http protocols as broken", async () => {
        const fetchFail = async () => { throw new Error("ENOTFOUND"); };
        expect((await checkUrl("https://x.example", fetchFail)).ok).toBe(false);
        expect((await checkUrl("ftp://x.example", fetchFail)).ok).toBe(false);
    });

    it("never fetches loopback, private or credential-bearing URLs from catalog data", async () => {
        const urls = [
            "http://localhost:3000/admin",
            "http://127.0.0.1/",
            "http://[::1]/",
            "http://10.0.0.5/",
            "http://192.168.1.1/",
            "http://172.16.0.1/",
            "http://169.254.169.254/latest/meta-data/",
            "https://user:pass@example.org/"
        ];
        let calls = 0;
        const fetchSpy = async () => { calls++; return { status: 200 }; };

        for (const url of urls) {
            const result = await checkUrl(url, fetchSpy);
            expect(result.ok, url).toBe(false);
        }
        expect(calls).toBe(0);
    });

    it("keeps accepting ordinary public hosts", () => {
        expect(isPublicHttpUrl("https://www.fdic.gov/consumers")).toBe(true);
        expect(isPublicHttpUrl("http://8.8.8.8/")).toBe(true);
        expect(isPublicHttpUrl("https://example.org/about?lang=es")).toBe(true);
        // Userinfo is refused even without a password: it can disguise the real
        // target and no catalog entry needs to send credentials to a link check.
        expect(isPublicHttpUrl("https://user@example.org/")).toBe(false);
    });
});
