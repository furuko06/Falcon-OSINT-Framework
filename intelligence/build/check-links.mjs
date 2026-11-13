import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve("intelligence");
const TOOL_FOLDERS = ["tools"];
const TIMEOUT_MS = 10000;

export function collectLinks(tools) {
    const links = [];
    for (const tool of tools) {
        for (const field of ["website", "docs"]) {
            if (typeof tool[field] === "string" && tool[field].trim()) {
                links.push({ tool: tool.name, field, url: tool[field].trim() });
            }
        }
    }
    return links;
}

export function loadTools(root = ROOT) {
    const tools = [];
    for (const folder of TOOL_FOLDERS) {
        const full = path.join(root, folder);
        if (!fs.existsSync(full)) continue;
        for (const file of fs.readdirSync(full).filter(f => f.endsWith(".json"))) {
            const raw = fs.readFileSync(path.join(full, file), "utf8").replace(/^\uFEFF/, "");
            tools.push(...JSON.parse(raw));
        }
    }
    return tools;
}

export async function checkUrl(url, fetchImpl = fetch) {
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            return { ok: false, status: null, error: "unsupported protocol" };
        }
        const res = await fetchImpl(url, {
            method: "HEAD",
            redirect: "follow",
            signal: AbortSignal.timeout(TIMEOUT_MS),
            headers: { "user-agent": "falcon-link-check/1.0" }
        });
        return { ok: res.status >= 200 && res.status < 400, status: res.status, error: null };
    } catch (error) {
        return { ok: false, status: null, error: error.message };
    }
}

async function main() {
    const links = collectLinks(loadTools());
    let broken = 0;
    for (const link of links) {
        const result = await checkUrl(link.url);
        if (!result.ok) {
            broken++;
            console.error(`BROKEN ${link.tool} [${link.field}] ${link.url} -> ${result.status ?? result.error}`);
        } else {
            console.log(`OK     ${link.tool} [${link.field}] ${result.status}`);
        }
    }
    console.log(`Checked ${links.length} links, ${broken} broken.`);
    if (broken > 0) process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main();
}
