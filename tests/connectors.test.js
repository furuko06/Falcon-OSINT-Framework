import { describe, it, expect, vi } from "vitest";
import { EXTERNAL_PROVIDERS, getExternalProvider, openExternalProvider } from "../framework/modules/assistant/connectors.js";

describe("external AI connectors", () => {
    it("ships unique https providers without credentials in the URL", () => {
        expect(EXTERNAL_PROVIDERS.length).toBeGreaterThanOrEqual(8);
        expect(new Set(EXTERNAL_PROVIDERS.map(p => p.id)).size).toBe(EXTERNAL_PROVIDERS.length);
        for (const provider of EXTERNAL_PROVIDERS) {
            const url = new URL(provider.url);
            expect(url.protocol).toBe("https:");
            expect(url.username).toBe("");
            expect(url.password).toBe("");
            expect(provider.name).toBeTruthy();
        }
        expect(EXTERNAL_PROVIDERS.map(p => p.id)).toEqual(
            expect.arrayContaining(["chatgpt", "claude", "gemini", "deepseek", "qwen", "zai"])
        );
    });

    it("looks up providers by id and rejects unknown ones", () => {
        expect(getExternalProvider("claude")).toMatchObject({ name: "Claude" });
        expect(getExternalProvider("nope")).toBeNull();
    });

    it("opens the provider before copying the prompt", async () => {
        const calls = [];
        const windowImpl = { open: vi.fn(() => { calls.push("open"); return {}; }) };
        const clipboard = { writeText: vi.fn(async () => { calls.push("copy"); }) };

        const result = await openExternalProvider({ id: "chatgpt", prompt: "prompt local", windowImpl, clipboard });

        expect(result).toMatchObject({ copied: true, provider: { id: "chatgpt" } });
        expect(windowImpl.open).toHaveBeenCalledWith("https://chatgpt.com/", "_blank");
        expect(windowImpl.open.mock.results[0].value.opener).toBeNull();
        expect(clipboard.writeText).toHaveBeenCalledWith("prompt local");
        expect(calls).toEqual(["open", "copy"]);
    });

    it("still opens the provider when the clipboard is unavailable", async () => {
        const windowImpl = { open: vi.fn(() => ({})) };
        const result = await openExternalProvider({ id: "qwen", prompt: "x", windowImpl, clipboard: null });
        expect(result.copied).toBe(false);
        expect(windowImpl.open).toHaveBeenCalledTimes(1);
    });

    it("reports blocked windows and invalid input", async () => {
        const blocked = { open: vi.fn(() => null) };
        await expect(openExternalProvider({ id: "gemini", prompt: "x", windowImpl: blocked }))
            .rejects.toThrow(/ventanas emergentes/);

        await expect(openExternalProvider({ id: "nope", prompt: "x", windowImpl: { open: vi.fn() } }))
            .rejects.toThrow(/Proveedor desconocido/);
        await expect(openExternalProvider({ id: "zai", prompt: "   ", windowImpl: { open: vi.fn() } }))
            .rejects.toThrow(/prompt/);
        await expect(openExternalProvider({ id: "zai", prompt: "x", windowImpl: null }))
            .rejects.toThrow(/ventana/);
    });
});
