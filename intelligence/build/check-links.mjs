import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve("intelligence");
const TOOL_FOLDERS = ["tools", ...countryFolders()];

function countryFolders() {
    const base = path.join(ROOT, "countries");
    if (!fs.existsSync(base)) return [];
    return fs.readdirSync(base).map(c => path.join("countries", c));
}
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

/**
 * Catalog JSON is data, not a list of trusted targets: a `website` field could
 * name localhost or a private range and turn the link checker into an SSRF probe
 * against the machine that runs the build. Only public http(s) hosts are fetched.
 */
export function isPublicHttpUrl(value) {
    let url;
    try {
        url = new URL(String(value));
    } catch {
        return false;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.username || url.password) return false;

    const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (!host) return false;
    if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
        return false;
    }

    const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
        const first = Number(ipv4[1]);
        const second = Number(ipv4[2]);
        if (first === 0 || first === 10 || first === 127) return false;
        if (first === 192 && second === 168) return false;
        if (first === 172 && second >= 16 && second <= 31) return false;
        if (first === 169 && second === 254) return false;
        if (first === 100 && second >= 64 && second <= 127) return false;
    }

    if (host.includes(":")) {
        if (host === "::1" || host === "::" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
            return false;
        }
    }

    return true;
}

export async function checkUrl(url, fetchImpl = fetch) {
    try {
        if (!isPublicHttpUrl(url)) {
            return { ok: false, status: null, error: "unsupported or non-public URL" };
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
