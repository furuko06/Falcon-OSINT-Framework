/* ==========================================================
   Falcon Marketplace - E5
   Lists a catalog of plugin manifests, validated with the SDK.
   ========================================================== */

import { validateManifest, getInstalledPlugin } from "./sdk.js";

/**
 * Returns the catalog entries that are valid, annotated with install state.
 * Invalid entries are skipped and reported in `rejected`.
 */
export function listMarketplace(catalog = []) {
    const entries = [];
    const rejected = [];

    for (const manifest of catalog) {
        const check = validateManifest(manifest);
        if (!check.ok) {
            rejected.push({ id: manifest?.id ?? null, errors: check.errors });
            continue;
        }
        const installed = getInstalledPlugin(manifest.id);
        entries.push({
            ...manifest,
            installed: Boolean(installed),
            updateAvailable: Boolean(installed) && installed.version !== manifest.version
        });
    }

    return { entries, rejected };
}
