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

window.addEventListener("DOMContentLoaded",()=>{

    initializeExplorer();
    registerServiceWorker();

});