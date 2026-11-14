#!/usr/bin/env node
// Regenerates contracts/contract-lock.json. Run it only when the contract
// version changes: the lock is what makes an accidental shape edit fail CI.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadJson, schemaFiles, schemaHash } from "./contracts-check.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACTS = path.join(ROOT, "contracts");
const version = loadJson(path.join(CONTRACTS, "contract-version.json"));

const schemas = {};
for (const file of schemaFiles()) schemas[file] = schemaHash(file);

fs.writeFileSync(
    path.join(CONTRACTS, "contract-lock.json"),
    `${JSON.stringify({ version: version.version, frozenOn: version.frozenOn, schemas }, null, 2)}\n`
);
console.log(`Lock de contratos ${version.version} actualizado con ${Object.keys(schemas).length} esquemas.`);
