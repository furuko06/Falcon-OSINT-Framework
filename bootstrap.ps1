# ==========================================================
# Falcon OSINT Framework Bootstrap v0.1.0-alpha
# Author: Falcon Project
# ==========================================================

$ErrorActionPreference = "Stop"

$ProjectName = "Falcon-OSINT-Framework"
$Version = "0.1.0-alpha"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   Falcon OSINT Framework Bootstrap $Version" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

#------------------------------------------------------------
# Validaciones
#------------------------------------------------------------

if (-not (Test-Path ".git")) {
    Write-Host "ERROR: Ejecuta este script desde la raiz del repositorio Git." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git no esta instalado." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js no esta instalado." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Git y Node encontrados." -ForegroundColor Green

#------------------------------------------------------------
# Crear estructura de carpetas
#------------------------------------------------------------

$folders = @(
"framework/core",
"framework/database",
"framework/modules/dashboard",
"framework/modules/explorer",
"framework/modules/intelligence",
"framework/modules/settings",
"framework/ui",
"framework/utils",
"framework/workers",

"themes",

"plugins",

"academy/01-osint-fundamentals",
"academy/02-humint",
"academy/03-socmint",
"academy/04-geoint",
"academy/05-cti",

"docs",

"assets/icons",
"assets/images",
"assets/fonts",

"intelligence/schema",
"intelligence/categories",
"intelligence/countries/ar",
"intelligence/countries/br",
"intelligence/countries/mx",
"intelligence/feeds",
"intelligence/licenses",
"intelligence/replacements",
"intelligence/tags",

".github/workflows",

"tests"
)

foreach($folder in $folders){
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

Write-Host "[OK] Carpetas creadas." -ForegroundColor Green

#------------------------------------------------------------
# package.json
#------------------------------------------------------------

@'
{
  "name":"falcon-osint-framework",
  "version":"0.1.0-alpha",
  "private": true,
  "type":"module",

  "scripts":{
    "dev":"vite",
    "build":"vite build",
    "preview":"vite preview",
    "test":"vitest"
  },

  "dependencies":{
    "lit":"^3.2.0",
    "sql.js":"^1.13.0"
  },

  "devDependencies":{
    "vite":"^7.1.3",
    "vitest":"^3.2.4",
    "eslint":"^9.30.1"
  }
}
'@ | Set-Content package.json -Encoding UTF8

#------------------------------------------------------------
# README
#------------------------------------------------------------

@'
# Falcon OSINT Framework

Offline-first OSINT Framework.

## Objetivos

- OSINT Framework moderno.
- SQLite offline.
- LATAM Intelligence Pack.
- PWA.
- Knowledge Graph.
- Plugin SDK.

## Estado

Version: 0.1.0-alpha
'@ | Set-Content README.md -Encoding UTF8

#------------------------------------------------------------
# LICENSE (placeholder)
#------------------------------------------------------------

@'
GNU AFFERO GENERAL PUBLIC LICENSE Version 3

This repository will use AGPL-3.0.
'@ | Set-Content LICENSE -Encoding UTF8

#------------------------------------------------------------
# Manifest PWA
#------------------------------------------------------------

@'
{
  "name":"Falcon OSINT Framework",
  "short_name":"Falcon",
  "display":"standalone",
  "start_url":".",
  "background_color":"#020617",
  "theme_color":"#22d3ee"
}
'@ | Set-Content manifest.webmanifest -Encoding UTF8

#------------------------------------------------------------
# index.html
#------------------------------------------------------------

@'
<!doctype html>
<html lang="en">

<head>

<meta charset="UTF-8"/>

<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

<title>Falcon OSINT Framework</title>

<link rel="manifest" href="manifest.webmanifest"/>

<style>

body{
margin:0;
background:#020617;
color:#E2E8F0;
font-family:Segoe UI;
}

header{
padding:18px;
background:#0F172A;
border-bottom:1px solid #1E293B;
}

main{
padding:20px;
}

.card{
background:#111827;
padding:18px;
border-radius:12px;
margin-bottom:18px;
}

</style>

</head>

<body>

<header>

<h1>Falcon OSINT Framework</h1>

<small>Version 0.1.0-alpha</small>

</header>

<main id="app">

<div class="card">
<h2>Dashboard</h2>
<p>Framework iniciado correctamente.</p>
</div>

</main>

<script type="module" src="./framework/core/app.js"></script>

</body>
</html>
'@ | Set-Content index.html -Encoding UTF8

#------------------------------------------------------------
# Service Worker
#------------------------------------------------------------

@'
self.addEventListener("install",event=>{
    self.skipWaiting();
});

self.addEventListener("activate",event=>{
    clients.claim();
});
'@ | Set-Content sw.js -Encoding UTF8

#------------------------------------------------------------
# Core Engine
#------------------------------------------------------------

@'
export const state = {
    version:"0.1.0-alpha",
    theme:"falcon-dark",
    databaseReady:false
};
'@ | Set-Content framework/core/state.js -Encoding UTF8

@'
const listeners = new Map();

export const EventBus = {

on(event,callback){

const list = listeners.get(event) || [];

list.push(callback);

listeners.set(event,list);

},

emit(event,payload){

const list = listeners.get(event) || [];

list.forEach(fn=>fn(payload));

}

};
'@ | Set-Content framework/core/eventbus.js -Encoding UTF8

@'
export const router = {

start(){

console.log("Router iniciado.");

history.replaceState({}, "", location.pathname);

}

};
'@ | Set-Content framework/core/router.js -Encoding UTF8

@'
export function info(message){
    console.log("[Falcon]",message);
}
'@ | Set-Content framework/core/logger.js -Encoding UTF8

@'
export const storage = {

set(key,value){

localStorage.setItem(key,JSON.stringify(value));

},

get(key){

const value = localStorage.getItem(key);

return value ? JSON.parse(value) : null;

}

};
'@ | Set-Content framework/core/storage.js -Encoding UTF8

@'
import {router} from "./router.js";
import {state} from "./state.js";
import {info} from "./logger.js";

router.start();

info("Falcon iniciado.");

document.getElementById("app").insertAdjacentHTML(
"beforeend",
`<div class="card">
<h3>Core Engine</h3>
<p>Version ${state.version}</p>
</div>`
);
'@ | Set-Content framework/core/app.js -Encoding UTF8

#------------------------------------------------------------
# SQLite Bootstrap
#------------------------------------------------------------

@'
export async function initDatabase(){

return {
engine:"sql.js",
status:"ready"
};

}
'@ | Set-Content framework/database/sqlite.js -Encoding UTF8

@'
export function parseQuery(query){
return query.trim().split(/\s+/);
}
'@ | Set-Content framework/database/fts.js -Encoding UTF8

#------------------------------------------------------------
# Explorer
#------------------------------------------------------------

@'
export function renderExplorer(){
return [];
}
'@ | Set-Content framework/modules/explorer/explorer.js -Encoding UTF8

#------------------------------------------------------------
# Sidebar
#------------------------------------------------------------

@'
export const sidebar = [
"Dashboard",
"Explorer",
"Intel",
"Cases",
"Academy",
"Settings"
];
'@ | Set-Content framework/ui/sidebar.js -Encoding UTF8

#------------------------------------------------------------
# Schema SQLite
#------------------------------------------------------------

@'
CREATE TABLE IF NOT EXISTS tools(

id INTEGER PRIMARY KEY,

name TEXT NOT NULL,

category TEXT,

subcategory TEXT,

country TEXT,

description TEXT,

website TEXT,

github TEXT,

license TEXT,

status TEXT,

offline INTEGER,

api INTEGER,

docker INTEGER,

vpn_friendly INTEGER,

tor_friendly INTEGER,

opsec_score INTEGER,

quality_score INTEGER,

last_verified TEXT

);

CREATE VIRTUAL TABLE tools_fts
USING fts5(

name,

description,

category,

subcategory,

country,

content='tools',

content_rowid='id'

);
'@ | Set-Content intelligence/schema/schema.sql -Encoding UTF8

#------------------------------------------------------------
# Categorias iniciales
#------------------------------------------------------------

@'
[
{"id":"humint","name":"HUMINT"},
{"id":"socmint","name":"SOCMINT"},
{"id":"geoint","name":"GEOINT"},
{"id":"cti","name":"Cyber Threat Intelligence"},
{"id":"dfir","name":"DFIR"},
{"id":"cloud","name":"Cloud Security"},
{"id":"darkweb","name":"Dark Web"}
]
'@ | Set-Content intelligence/categories/categories.json -Encoding UTF8

#------------------------------------------------------------
# GitHub Actions
#------------------------------------------------------------

@'
name: Build

on:
  push:
    branches:
      - main
      - dev

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm install
      - run: npm run build
'@ | Set-Content .github/workflows/build.yml -Encoding UTF8

#------------------------------------------------------------
# Vite Config
#------------------------------------------------------------

@'
import { defineConfig } from "vite";

export default defineConfig({
  base:"./"
});
'@ | Set-Content vite.config.js -Encoding UTF8

#------------------------------------------------------------
# Test
#------------------------------------------------------------

@'
import { describe,it,expect } from "vitest";

describe("Falcon",()=>{

it("framework exists",()=>{

expect(true).toBe(true);

});

});
'@ | Set-Content tests/core.test.js -Encoding UTF8

#------------------------------------------------------------
# Instalar dependencias
#------------------------------------------------------------

Write-Host ""
Write-Host "Instalando dependencias..." -ForegroundColor Cyan

npm install

#------------------------------------------------------------
# Crear rama
#------------------------------------------------------------

$currentBranch = git branch --show-current

if($currentBranch -eq "main"){
    git checkout -b feature/bootstrap-core
}

#------------------------------------------------------------
# Commit inicial
#------------------------------------------------------------

git add .

try{
    git commit -m "feat(core): bootstrap Falcon OSINT Framework v0.1.0-alpha"
}catch{
    Write-Host "No hubo cambios para commitear o el commit ya existe." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host " Bootstrap completado correctamente." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Siguiente comando:"
Write-Host ""
Write-Host "git push -u origin feature/bootstrap-core" -ForegroundColor Yellow
Write-Host ""
Write-Host "Luego crea el Pull Request desde GitHub."