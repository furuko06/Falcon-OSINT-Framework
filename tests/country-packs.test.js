import { describe, it, expect } from "vitest";
import { COUNTRY_PACKS, detectCountry, countryToolCount } from "../framework/modules/countries/packs.js";

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
});
