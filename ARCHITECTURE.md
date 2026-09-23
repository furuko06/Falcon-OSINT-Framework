# ARCHITECTURE.md — Falcon OSINT Framework 2.0 (Volumen II)

> Arquitectura Técnica Oficial del Proyecto
>
> Documento de referencia para desarrolladores, contribuidores y agentes de IA (Codex / ChatGPT).
>
> Versión: Architecture v1.0
>
> Estado del proyecto: v0.1 Alpha

# Índice

```
1. Arquitectura General
2. Filosofía Técnica
3. Stack Tecnológico Oficial
4. Estructura del Repositorio
5. Flujo de Datos
6. Arquitectura Offline-First
7. SQLite Engine
8. Intelligence Builder Pipeline
9. Explorer Module
10. Dashboard Module
11. Collections Module (Diseño)
12. Plugin System (Diseño)
13. Country Packs (Diseño)
14. Health Engine (Diseño)
15. Knowledge Graph (Diseño)
16. Theme Engine
17. PWA & Service Workers
18. Configuración del Entorno de Desarrollo
19. Convenciones de Código
20. Git Workflow Oficial
21. Testing Strategy
22. Seguridad del Proyecto
23. ADRs (Architecture Decision Records)
24. Arquitectura Objetivo v1.0
```

# 1. Arquitectura General

## Objetivo

Falcon está diseñado como un Workspace Modular Offline-First.

El sistema se divide en módulos independientes que se comunican únicamente mediante un estado compartido y servicios bien definidos.

## Diagrama General

```
                        Falcon OSINT Framework

                      +------------------------+
                      |      framework/app.js  |
                      +-----------+------------+
                                  |
      +---------------------------+---------------------------+
      |                           |                           |
      |                           |                           |
 Explorer                    Dashboard                    Settings
      |                           |                           |
      +-------------+-------------+-------------+-------------+
                    |                           |
             SQLite Database              Theme Engine
                    |
          Intelligence Builders
                    |
      JSON Datasets / Country Packs / Plugins
```

## Principios Arquitectónicos

* Modular.

* Offline-first.

* Stateless UI.

* SQLite como única fuente de datos en runtime.

* JSON como fuente editable.

* Build reproducible.

# 2. Filosofía Técnica

## Offline First

Toda funcionalidad debe ejecutarse sin conexión.

Internet únicamente agrega capacidades.

Nunca reemplaza funcionalidades existentes.

## Portable

Falcon debe funcionar sin instalación compleja.

Compatible con:

* Windows

* Linux

* Kali

* Parrot

* Qubes

* macOS

## Community Driven

El catálogo de herramientas no está hardcodeado.

Proviene de datasets JSON mantenidos por la comunidad.

# 3. Stack Tecnológico Oficial

## Frontend

|
Tecnología

|

Uso

|
| --- | --- |
|

Vite

|

Bundler y desarrollo.

|
|

Vanilla JavaScript ES Modules

|

Framework UI.

|
|

CSS Modules propios

|

Sistema visual Falcon.

|
|

HTML5

|

Shell principal.

|

## Base de Datos

|
Tecnología

|

Uso

|
| --- | --- |
|

SQLite

|

Base offline principal.

|
|

sql.js (WASM)

|

SQLite en navegador.

|

## Build

|
Herramienta

|

Uso

|
| --- | --- |
|

Node.js 22 LTS

|

Entorno oficial.

|
|

npm

|

Gestión de dependencias.

|
|

PowerShell

|

Scripts Windows.

|

## Testing

|
Tecnología

|

Uso

|
| --- | --- |
|

Vitest

|

Tests unitarios.

|

## Control de Versiones

|
Herramienta

|

Uso

|
| --- | --- |
|

Git

|

Versionado.

|
|

GitHub

|

Repositorio remoto.

|
|

GitHub CLI

|

PRs y automatización.

|

## IA

|
Herramienta

|

Uso

|
| --- | --- |
|

ChatGPT

|

Arquitectura y diseño.

|
|

Codex CLI

|

Implementación.

|

# 4. Estructura del Repositorio

## Árbol Oficial

```
Falcon-OSINT-Framework/

.github/
database/
docs/
framework/
intelligence/
scripts/
tests/
tools/

index.html
package.json
vite.config.js
AGENTS.md
README.md
```

## framework/

Código de la aplicación.

```
framework/

app.js

components/

database/

layouts/

modules/

services/

styles/

utils/

workers/
```

## database/

```
database/

falcon.db
```

Contiene únicamente la base SQLite compilada.

Nunca se modifica manualmente.

## intelligence/

Fuente editable de conocimiento.

```
intelligence/

build/
categories/
countries/
schema/
```

## tests/

Pruebas unitarias.

## docs/

Toda la documentación oficial.

## scripts/

Scripts de desarrollo PowerShell.

## tools/

Binarios auxiliares (GitHub CLI, etc.).

# 5. Flujo de Datos

## Pipeline Completo

```
JSON Files
      |
      |
validate-json.mjs
      |
seed.mjs
      |
compile-db.mjs
      |
database/falcon.db
      |
SQLite WASM
      |
Explorer / Dashboard
```

## Runtime

```
falcon.db
    |
SQL Queries
    |
State Manager
    |
Cards / Dashboard / Sidebar
```

# 6. Arquitectura Offline-First

## Fuente de Verdad

SQLite.

Todo consulta SQLite.

Nunca JSON en runtime.

## JSON

JSON solo existe durante el build.

Ventajas:

* Fácil colaboración.

* Fácil revisión en Git.

* Portable.

## SQLite

Ventajas:

* Consultas rápidas.

* Índices.

* Escalable.

* Exportable.

# 7. SQLite Engine

## Componentes

```
framework/database/

database.js
queries.js
schema.js
builder.js
migrations.js
seedloader.js
```

## Responsabilidades

### database.js

Wrapper de sql.js.

Responsabilidades:

* abrir DB,

* ejecutar consultas,

* preparar statements.

### queries.js

Consultas reutilizables.

### schema.js

Definiciones del modelo.

### builder.js

Construcción de SQLite.

### migrations.js

Gestión de migraciones.

## Esquema Actual

### categories

SQL

```
id
name
```

### countries

SQL

```
id
code
name
```

### licenses

SQL

```
id
name
```

### tags

SQL

```
id
tag
```

### tools

Tabla principal.

Campos:

```
id
name
category
subcategory
description
country
website
github
license
status
offline
api
docker
vpn_friendly
tor_friendly
opsec_score
quality_score
last_verified
```

### collections

Colecciones del usuario.

### bookmarks

Favoritos persistentes.

### migration_history

Migraciones aplicadas.

## Migraciones

```
001_initial.sql
002_fts.sql
003_graph.sql
```

### Estado

|
Migración

|

Estado

|
| --- | --- |
|

001

|

Activa

|
|

002

|

Deshabilitada (FTS5 pendiente)

|
|

003

|

Placeholder

|

## Política SQLite

`database/falcon.db`

* Versionado.

* No editar manualmente.

* Se regenera mediante builder.

# 8. Intelligence Builder Pipeline

## Objetivo

Convertir cientos de archivos JSON en SQLite.

## Build Scripts

```
intelligence/build/

compile-db.mjs
seed.mjs
validate-json.mjs
```

## validate-json.mjs

Verifica:

* JSON válido.

* BOM.

* Campos obligatorios.

## seed.mjs

Normaliza datos.

## compile-db.mjs

Genera SQLite.

Proceso:

1. Crear tablas.

2. Insertar categorías.

3. Insertar países.

4. Insertar licencias.

5. Insertar herramientas.

6. Crear índices futuros.

## Datasets

```
categories/

humint.json
socmint.json
...
```

## Country Packs

```
countries/

ar/
br/
mx/
...
```

## Política

Cada archivo JSON representa una fuente de conocimiento independiente.

# 9. Explorer Module

## Carpeta

```
framework/modules/explorer/
```

## Archivos

```
cards.js
events.js
explorer.js
favorites.js
filters.js
search.js
sidebar.js
state.js
stats.js
themes.js
toolbar.js
```

## Responsabilidad de cada archivo

|
Archivo

|

Función

|
| --- | --- |
|

explorer.js

|

Bootstrap del Explorer.

|
|

search.js

|

Búsqueda SQLite.

|
|

filters.js

|

Filtros.

|
|

cards.js

|

Render de tarjetas.

|
|

favorites.js

|

Persistencia favoritos.

|
|

sidebar.js

|

Categorías.

|
|

toolbar.js

|

Buscador y acciones.

|
|

state.js

|

Estado compartido.

|
|

stats.js

|

Métricas Explorer.

|
|

events.js

|

Eventos UI.

|

## Flujo Explorer

```
SQLite Query
     |
Search
     |
Filters
     |
State
     |
Cards Renderer
```

## Estado Compartido

JavaScript

```
state = {
  tools: [],
  filteredTools: [],
  categories: [],
  favorites: [],
  search: "",
  filters: {},
  sort: ""
}
```

## Explorer Pro (Objetivo)

* búsqueda avanzada,

* filtros múltiples,

* vista lista,

* vista grid,

* ordenamientos,

* favoritos,

* health badges.

# 10. Dashboard Module

## Carpeta

```
framework/modules/dashboard/
```

## Componentes

```
dashboard.js
layout.js
widgets.js
stats.js
health.js
```

## Widgets Oficiales

* Total Tools.

* Countries.

* Favorites.

* Categories.

* Offline Ready.

* APIs.

* Docker.

## Health Widget

Placeholder actual.

Futuro:

* Broken tools.

* Deprecated.

* Recently verified.

# 11. Collections Module (Diseño)

Estado: pendiente.

## Objetivo

Vault personal.

## Capacidades

* Crear colecciones.

* Agregar herramientas.

* Notas.

* Tags.

* Exportar.

## Base SQLite futura

```
collections

collection_tools

notes
```

# 12. Plugin System (Diseño)

## Objetivo

Marketplace Open Source.

## Arquitectura

```
plugins/

manifest.json
icon.svg
plugin.js
README.md
```

## Manifest

Campos previstos:

JSON

```
{
  "id":"",
  "name":"",
  "version":"",
  "author":"",
  "permissions":[]
}
```

## Permisos

* filesystem

* network

* sqlite

* shell

* docker

## Política

Nunca instalar automáticamente.

Siempre solicitar confirmación.

# 13. Country Packs (Diseño)

## Objetivo

Herramientas específicas por país.

## Estructura

```
countries/

ar/
br/
mx/
...
```

## Detección

Idioma.

Zona.

Configuración manual.

## Prioridad

1 Argentina.

2 Brasil.

3 México.

4 Global.

# 14. Health Engine (Diseño)

## Objetivo

Monitorear calidad del catálogo.

## Estados

```
Verified

Working

Beta

Deprecated

Archived

Broken
```

## Métricas

* último commit GitHub,

* última verificación,

* score comunidad,

* score OPSEC.

## Health Score

0–100.

# 15. Knowledge Graph (Diseño)

## Objetivo

Relacionar entidades.

## Entidades

* Persona.

* Empresa.

* Dominio.

* Email.

* Usuario.

* Teléfono.

* IOC.

## Relaciones

```
Persona
   |
Usuario
   |
Dominio
   |
Empresa
```

## Tecnología prevista

SQLite Graph Tables inicialmente.

Neo4j opcional futuro.

# 16. Theme Engine

## Objetivo

Cambiar apariencia sin romper Explorer.

## CSS

```
styles/

explorer.css

themes.css
```

## Temas

```
Falcon Dark

Falcon Light

Dracula

Nord

Gruvbox

Matrix

Solarized

Midnight
```

## Variables

CSS

```
--bg
--surface
--primary
--accent
--danger
--success
```

## Persistencia

localStorage.

# 17. PWA & Service Workers

## Objetivo

Instalable.

Offline.

## Manifest

```
manifest.webmanifest
```

## Recursos cacheados

* CSS.

* JS.

* SQLite.

* Iconos.

## Futuro

Actualizaciones incrementales.

# 18. Configuración del Entorno de Desarrollo

## Requisitos Oficiales

|
Herramienta

|

Versión

|
| --- | --- |
|

Node

|

22 LTS

|
|

npm

|

10+

|
|

Git

|

2.x

|
|

GitHub CLI

|

2.x

|
|

Codex CLI

|

0.154+

|

## Scripts

```
npm install

npm run dev

npm run build

npm test
```

## PowerShell

Scripts oficiales.

```
scripts/

dev.ps1

build.ps1

env.ps1 (planificado)
```

## Builder SQLite

```
npm run db:compile
```

Genera `database/falcon.db`.

# 19. Convenciones de Código

## JavaScript

* ES Modules.

* Un módulo = una responsabilidad.

## CSS

No estilos inline.

Variables globales.

## Nombres

camelCase para JS.

kebab-case para archivos CSS.

## Imports

Absolutos dentro de framework.

## Estado

Centralizado.

# 20. Git Workflow Oficial

## Branches

```
main

feature/*
```

## Convención

```
feature/explorer

feature/dashboard

feature/plugins
```

## Commits

Formato Conventional Commits.

Ejemplos:

```
feat(explorer):

fix(database):

docs(architecture):

refactor(theme):
```

## Pull Requests

Una feature por PR.

Build PASS obligatorio.

Tests PASS obligatorios.

# 21. Testing Strategy

## Unit Tests

Vitest.

## Cobertura Inicial

Explorer.

SQLite.

State.

## QA Checklist

Antes de merge:

* Build PASS.

* Tests PASS.

* Explorer carga SQLite.

* Dashboard renderiza.

* No rompe temas.

# 22. Seguridad del Proyecto

## Principios

No telemetría.

No ejecución automática.

No envío de datos.

## Plugins

Hash SHA256.

Permisos explícitos.

## SQLite

Solo lectura en runtime.

## Datos Usuario

Locales.

# 23. Architecture Decision Records (ADR)

## ADR-001

Offline First

Decisión.

Toda funcionalidad debe funcionar offline.

## ADR-002

SQLite como Runtime Database

JSON solo para build.

SQLite para consultas.

## ADR-003

Marketplace Comunitario

Plugins abiertos.

Permisos obligatorios.

## ADR-004

Country Packs Separados

Cada país mantiene su dataset.

## ADR-005

Explorer Independiente

Explorer no depende de Dashboard.

## ADR-006

Health Engine Modular

No bloquear herramientas.

Solo informar estado.

# 24. Arquitectura Objetivo v1.0

## Estructura Final

```
framework/

app.js

components/
    badges/
    cards/
    dialogs/
    inputs/
    layout/

database/
    database.js
    queries.js
    builder.js
    migrations.js

layouts/
    dashboard-layout.js
    explorer-layout.js

modules/

    explorer/
    dashboard/
    collections/
    playbooks/
    plugins/
    countries/
    health/
    graph/
    academy/
    settings/
    search/

services/
    health-service.js
    plugin-service.js
    country-service.js

styles/
    explorer.css
    dashboard.css
    themes.css
    variables.css

utils/
    storage.js
    debounce.js
    logger.js

workers/
    sqlite.worker.js
    health.worker.js
```

## Arquitectura Objetivo

### Núcleo

* SQLite Engine.

* State Manager.

* Theme Engine.

### Módulos Funcionales

* Explorer.

* Dashboard.

* Collections.

* Playbooks.

* Plugin Manager.

* Country Packs.

* Health Engine.

* Knowledge Graph.

* Academy.

* AI Assistant.

### Infraestructura

* Intelligence Builder.

* PWA.

* Testing.

* Scripts.

* Documentación.

## Estado de Congelamiento Arquitectónico

Esta arquitectura queda congelada como referencia oficial para Falcon OSINT Framework 2.0.

Toda nueva funcionalidad deberá respetar:

1. Arquitectura modular.

2. Offline-first.

3. SQLite como fuente de verdad en runtime.

4. JSON únicamente como fuente editable para el pipeline de compilación.

5. Compatibilidad multiplataforma (Windows, Linux, Kali, Parrot, Qubes y macOS).

6. Convenciones de Git, QA y documentación definidas en este documento.
