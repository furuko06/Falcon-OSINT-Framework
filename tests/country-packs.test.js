import { describe, it, expect } from "vitest";
import { COUNTRY_PACKS, detectCountry, getCountry, countryToolCount } from "../framework/modules/countries/packs.js";

describe("country packs", () => {
    it("detects an exact locale match", () => {
        expect(detectCountry("es-MX")).toBe("MX");
        expect(detectCountry("pt-BR")).toBe("BR");
    });

    it("falls back to the language when the region is unknown", () => {
        expect(detectCountry("pt-PT")).toBe("BR");
    });

    it("uses GLOBAL for unsupported locales", () => {
        expect(detectCountry("de-DE")).toBe("GLOBAL");
        expect(detectCountry("")).toBe("GLOBAL");
    });

    it("counts tools per country and keeps all tools for GLOBAL", () => {
        const tools = [{ country: "AR" }, { country: "AR" }, { country: "BR" }];
        expect(countryToolCount(tools, "AR")).toBe(2);
        expect(countryToolCount(tools, "CL")).toBe(0);
        expect(countryToolCount(tools, "GLOBAL")).toBe(3);
    });

    it("covers the five countries of the spec plus Global", () => {
        const codes = COUNTRY_PACKS.map(p => p.code).sort();
        expect(codes).toEqual(["AR", "BR", "CL", "GLOBAL", "MX", "UY"]);
    });

    it("defaults to GLOBAL instead of guessing a pack from the browser locale", () => {
        const saved = new Map();
        globalThis.localStorage = {
            getItem: k => (saved.has(k) ? saved.get(k) : null),
            setItem: (k, v) => saved.set(k, String(v)),
            removeItem: k => saved.delete(k)
        };
        expect(getCountry()).toBe("GLOBAL");
        saved.set("falcon:country", "AR");
        expect(getCountry()).toBe("AR");
        saved.set("falcon:country", "ZZ");
        expect(getCountry()).toBe("GLOBAL");
    });
});
