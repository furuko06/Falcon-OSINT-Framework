/* ==========================================================
   Falcon Plugin Catalog - E5
   Local catalog of declarative plugin manifests. Entries are validated
   by the SDK before they are shown; nothing here runs code.
   ========================================================== */

export const PLUGIN_CATALOG = [
    {
        id: "ct-lookup",
        name: "Certificate Transparency Lookup",
        version: "1.0.0",
        author: "Falcon",
        license: "MIT",
        minFramework: "0.1.0",
        description: "Consulta registros de certificados públicos por dominio.",
        permissions: ["network"]
    },
    {
        id: "local-notes-export",
        name: "Local Notes Export",
        version: "1.0.0",
        author: "Falcon",
        license: "MIT",
        minFramework: "0.1.0",
        description: "Exporta notas de colecciones a un archivo local.",
        permissions: ["filesystem"]
    }
];
