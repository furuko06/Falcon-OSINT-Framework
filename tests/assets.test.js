import { describe, it, expect } from "vitest";
import fs from "node:fs";

const index = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("public/manifest.webmanifest", "utf8").replace(/^\uFEFF/, ""));

describe("public assets", () => {
    it("links the public favicon and manifest from the app shell", () => {
        expect(index).toContain('href="./favicon.svg"');
        expect(index).toContain('href="./manifest.webmanifest"');
        expect(fs.existsSync("public/favicon.svg")).toBe(true);
    });

    it("keeps manifest icons relative to the public root", () => {
        expect(manifest.icons).toHaveLength(1);
        expect(manifest.icons[0]).toMatchObject({ src: "favicon.svg", type: "image/svg+xml", sizes: "any" });
        expect(fs.existsSync("public/favicon.svg")).toBe(true);
        expect(fs.existsSync("manifest.webmanifest")).toBe(false);
    });
});
