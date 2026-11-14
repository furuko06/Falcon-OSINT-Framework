#!/usr/bin/env node
// G8 release artifact: reproducible source archive, SHA-256 manifest and an
// optional detached GPG signature over the checksums.
//
//   npm run release:manifest                 # build artifacts for the current version tag
//   npm run release:manifest -- --verify     # recompute and compare against the manifest
//   FALCON_GPG_KEY=<fingerprint> npm run release:manifest -- --sign
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const RELEASES = path.resolve("docs/releases");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const args = process.argv.slice(2);
const verifyOnly = args.includes("--verify");
const sign = args.includes("--sign") || Boolean(process.env.FALCON_GPG_KEY);

function git(...params) {
    return execFileSync("git", params, { encoding: "utf8" }).trim();
}

function sha256(file) {
    return createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function gpgFingerprint() {
    try {
        const key = process.env.FALCON_GPG_KEY;
        const out = execFileSync("gpg", ["--list-secret-keys", "--with-colons", ...(key ? [key] : [])], { encoding: "utf8" });
        const line = out.split("\n").find(row => row.startsWith("fpr:"));
        return line ? line.split(":")[9] : null;
    } catch {
        return null;
    }
}

const tag = `v${pkg.version}`;
const archiveName = `falcon-osint-framework-${pkg.version}.tar.gz`;
const archive = path.join(RELEASES, archiveName);
const sumsFile = path.join(RELEASES, `falcon-osint-framework-${pkg.version}-SHA256SUMS`);
const signature = `${sumsFile}.asc`;
const manifestFile = path.join(RELEASES, `falcon-osint-framework-${pkg.version}-manifest.json`);

if (verifyOnly) {
    if (!fs.existsSync(manifestFile)) {
        console.error(`Falta ${path.relative(process.cwd(), manifestFile)}: generá el manifiesto primero.`);
        process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    const problems = [];
    for (const file of manifest.files) {
        const full = path.resolve(file.path);
        if (!fs.existsSync(full)) {
            problems.push(`falta ${file.path}`);
            continue;
        }
        if (sha256(full) !== file.sha256) problems.push(`${file.path} no coincide con el manifiesto`);
    }
    if (manifest.signature && fs.existsSync(signature)) {
        try {
            execFileSync("gpg", ["--verify", signature, sumsFile], { stdio: "pipe" });
        } catch {
            problems.push("la firma GPG no verifica");
        }
    }
    if (problems.length) {
        console.error(`Manifiesto: ${problems.length} problema(s).`);
        for (const problem of problems) console.error(` - ${problem}`);
        process.exit(1);
    }
    console.log(`Manifiesto ${manifest.version} verificado: ${manifest.files.length} archivo(s).`);
    process.exit(0);
}

fs.mkdirSync(RELEASES, { recursive: true });

function tagRefExists(name) {
    try {
        git("rev-parse", "--verify", `refs/tags/${name}`);
        return true;
    } catch {
        return false;
    }
}

if (!tagRefExists(tag)) {
    console.error(`No existe el tag ${tag}. La release se genera desde un tag anotado.`);
    process.exit(1);
}
const tagType = git("cat-file", "-t", tag);
if (tagType !== "tag") console.error(`Aviso: ${tag} no es un tag anotado (${tagType}).`);

const commit = git("rev-list", "-n", "1", tag);
const dirty = git("status", "--porcelain").split("\n").filter(line => line && !line.endsWith("AGENTS.md")).length > 0;
const prefix = `falcon-osint-framework-${pkg.version}/`;
execFileSync("git", ["archive", `--format=tar.gz`, `--prefix=${prefix}`, `-o`, archive, tag]);

const files = [archive, path.resolve("database/falcon.db")].map(file => ({
    path: path.relative(process.cwd(), file).replace(/\\/g, "/"),
    bytes: fs.statSync(file).size,
    sha256: sha256(file)
}));

const sums = files.map(file => `${file.sha256}  ${file.path}`).join("\n");
fs.writeFileSync(sumsFile, `${sums}\n`);

let signatureInfo = null;
if (sign) {
    const fingerprint = gpgFingerprint();
    if (!fingerprint) {
        console.error("No hay clave secreta GPG disponible. Generá o importá una y pasá FALCON_GPG_KEY.");
        process.exit(1);
    }
    try {
        execFileSync("gpg", ["--batch", "--yes", "--armor", "--detach-sign", "--local-user", fingerprint, "--output", signature, sumsFile], { stdio: "pipe" });
        const verified = execFileSync("gpg", ["--verify", signature, sumsFile], { encoding: "utf8", stdio: "pipe" });
        signatureInfo = { file: path.basename(signature), fingerprint };
        console.log(`Firma GPG creada y verificada (${verified.match(/using [A-Z0-9]+/)?.[0] || fingerprint}).`);
    } catch (error) {
        console.error(`No se pudo firmar: ${error.message}`);
        process.exit(1);
    }
} else {
    console.log("Sin firma: no hay clave GPG. Exportá FALCON_GPG_KEY y repetí con --sign.");
}

const manifest = {
    name: "Falcon OSINT Framework",
    version: pkg.version,
    tag,
    commit,
    tagType,
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: `${os.platform()} ${os.release()}`,
    dirty,
    files,
    signature: signatureInfo
};
fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Archivo: ${path.relative(process.cwd(), archive)} (${(fs.statSync(archive).size / 1024).toFixed(1)} KB)`);
console.log(`Checksums: ${path.relative(process.cwd(), sumsFile)}`);
console.log(`Manifiesto: ${path.relative(process.cwd(), manifestFile)}`);
if (dirty) console.log("Aviso: el árbol de trabajo tiene cambios sin commitear; el archivo se generó desde el tag.");
