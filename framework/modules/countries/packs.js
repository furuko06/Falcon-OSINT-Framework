/* ==========================================================
   Falcon Country Packs - E6
   Country metadata and the official sources shipped with each pack.
   Tools themselves stay in the database and are filtered by `country`.
   ========================================================== */

export const COUNTRY_PACKS = [
    { code: "GLOBAL", name: "Global", locales: [] },
    { code: "AR", name: "Argentina", locales: ["es-AR"], flag: "🇦🇷" },
    { code: "BR", name: "Brasil", locales: ["pt-BR", "pt"], flag: "🇧🇷" },
    { code: "MX", name: "México", locales: ["es-MX"], flag: "🇲🇽" },
    { code: "CL", name: "Chile", locales: ["es-CL"], flag: "🇨🇱" },
    { code: "UY", name: "Uruguay", locales: ["es-UY"], flag: "🇺🇾" }
];

export const STORAGE_KEY = "falcon:country";

/** Picks a pack from a BCP-47 locale such as "es-MX" or "pt". */
export function detectCountry(locale = "", packs = COUNTRY_PACKS) {
    const lang = String(locale || "");
    const exact = packs.find(p => p.locales.some(l => l.toLowerCase() === lang.toLowerCase()));
    if (exact) return exact.code;
    const base = lang.split("-")[0].toLowerCase();
    const byLang = packs.find(p => p.locales.some(l => l.split("-")[0].toLowerCase() === base));
    return byLang ? byLang.code : "GLOBAL";
}

export function getCountry(packs = COUNTRY_PACKS) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && packs.some(p => p.code === saved)) return saved;
    const browser = typeof navigator !== "undefined" ? navigator.language : "";
    return detectCountry(browser, packs);
}

export function setCountry(code) {
    localStorage.setItem(STORAGE_KEY, code);
}

/** Tools for a pack: a country code filters tools by `country`; GLOBAL keeps all tools. */
export function countryToolCount(tools, code) {
    if (code === "GLOBAL") return tools.length;
    return tools.filter(t => t.country === code).length;
}
