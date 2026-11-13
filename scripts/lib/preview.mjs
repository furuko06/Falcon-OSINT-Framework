import { spawn } from "node:child_process";
import path from "node:path";

const VITE = path.resolve("node_modules/vite/bin/vite.js");

export async function waitForUrl(url, timeoutMs = 30000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const response = await fetch(url);
            if (response.ok) return;
        } catch {
            // Server is still starting.
        }
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(`El servidor no respondió en ${timeoutMs} ms: ${url}`);
}

export async function startPreview({ port = 4173 } = {}) {
    const child = spawn(process.execPath, [VITE, "preview", "--port", String(port), "--strictPort"], {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        env: process.env
    });

    let output = "";
    child.stdout.on("data", chunk => { output += chunk.toString(); });
    child.stderr.on("data", chunk => { output += chunk.toString(); });

    const url = `http://localhost:${port}/`;
    try {
        await waitForUrl(url);
    } catch (error) {
        child.kill();
        throw new Error(`${error.message}\n${output.slice(-500)}`);
    }

    return {
        url,
        stop() {
            if (!child.killed) child.kill();
            if (process.platform === "win32" && child.pid) {
                spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
            }
        }
    };
}
