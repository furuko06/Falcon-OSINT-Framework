/* ==========================================================
   Falcon AI Assistant - external provider launchers
   Falcon never handles provider credentials, OAuth or Gmail
   access. It only opens the provider's own page and copies
   the prompt so the analyst can paste it there.
   ========================================================== */

export const EXTERNAL_PROVIDERS = [
    { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/", note: "OpenAI" },
    { id: "claude", name: "Claude", url: "https://claude.ai/new", note: "Anthropic" },
    { id: "gemini", name: "Gemini", url: "https://gemini.google.com/app", note: "Google" },
    { id: "deepseek", name: "DeepSeek", url: "https://chat.deepseek.com/", note: "DeepSeek" },
    { id: "qwen", name: "Qwen", url: "https://chat.qwen.ai/", note: "Alibaba" },
    { id: "zai", name: "Z.ai", url: "https://chat.z.ai/", note: "Zhipu" },
    { id: "grok", name: "Grok", url: "https://grok.com/", note: "xAI" },
    { id: "perplexity", name: "Perplexity", url: "https://www.perplexity.ai/", note: "Perplexity" },
    { id: "mistral", name: "Le Chat", url: "https://chat.mistral.ai/chat", note: "Mistral" },
    { id: "copilot", name: "Copilot", url: "https://copilot.microsoft.com/", note: "Microsoft" },
    { id: "kimi", name: "Kimi", url: "https://www.kimi.com/", note: "Moonshot" }
];

export function getExternalProviders() {
    return EXTERNAL_PROVIDERS.map(provider => ({ ...provider }));
}

export function getExternalProvider(id) {
    return EXTERNAL_PROVIDERS.find(provider => provider.id === id) || null;
}

/**
 * Opens the provider in a new window and copies the prompt.
 * The window is opened before awaiting the clipboard so popup
 * blockers see a user gesture.
 */
export async function openExternalProvider({
    id,
    prompt,
    windowImpl = globalThis.window,
    clipboard = globalThis.navigator?.clipboard
}) {
    const provider = getExternalProvider(id);
    if (!provider) throw new Error(`Proveedor desconocido: ${id}`);
    if (!String(prompt ?? "").trim()) throw new Error("No hay prompt para enviar");
    if (!windowImpl || typeof windowImpl.open !== "function") throw new Error("No se puede abrir una ventana en este entorno");

    // Open without the noopener feature so a blocked popup can be detected,
    // then sever the opener reference manually. With noopener, window.open()
    // always returns null, which would look like a blocker.
    const opened = windowImpl.open(provider.url, "_blank");
    if (opened === null) {
        throw new Error("El navegador bloqueó la ventana. Habilitá las ventanas emergentes para Falcon.");
    }
    try {
        opened.opener = null;
    } catch {
        // Cross-origin handles may reject the assignment; the new tab is still isolated by the browser.
    }

    let copied = false;
    if (clipboard && typeof clipboard.writeText === "function") {
        try {
            await clipboard.writeText(prompt);
            copied = true;
        } catch {
            copied = false;
        }
    }

    return { provider, copied };
}
