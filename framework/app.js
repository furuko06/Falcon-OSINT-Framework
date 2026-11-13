import { initializeExplorer } from "./modules/explorer/explorer.js";

async function registerServiceWorker() {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
    try {
        const registration = await navigator.serviceWorker.register(
            new URL("sw.js", document.baseURI),
            { scope: new URL("./", document.baseURI).pathname }
        );
        registration.update().catch(() => {});
    } catch (error) {
        console.warn("No se pudo activar el modo offline:", error.message);
    }
}

function mark(name) {
    if (globalThis.performance?.mark) performance.mark(name);
}

function measure(name, start, end) {
    if (!globalThis.performance?.measure) return;
    try {
        performance.measure(name, start, end);
    } catch {
        // A missing mark must never break application startup.
    }
}

window.__falconPerf = () => Object.fromEntries(
    performance.getEntriesByType("measure")
        .filter(entry => entry.name.startsWith("falcon:"))
        .map(entry => [entry.name, Math.round(entry.duration * 100) / 100])
);

window.addEventListener("DOMContentLoaded",()=>{

    mark("falcon:boot-start");
    initializeExplorer()
        .then(() => {
            mark("falcon:explorer-ready");
            requestAnimationFrame(() => {
                mark("falcon:catalog-painted");
                measure("falcon:catalog-ready", "falcon:boot-start", "falcon:catalog-painted");
            });
        })
        .catch(error => {
            mark("falcon:explorer-error");
            console.error("No se pudo iniciar el Explorer:", error);
        });
    registerServiceWorker();

});