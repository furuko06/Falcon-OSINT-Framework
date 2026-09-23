# Falcon OSINT Framework 2.0 — PROJECT_BLUEPRINT.md (Volumen I)

> Documento Oficial de Fundación, Visión, Filosofía y Bitácora del Proyecto
>
> Versión: Blueprint v1.0
>
> Estado del proyecto: v0.1 Alpha – Offline Explorer Foundation
>
> Proyecto iniciado: Septiembre 2026

# Índice

```
1. Introducción
2. Historia del Proyecto
3. Misión
4. Visión
5. Filosofía de Falcon
6. Principios Fundamentales
7. Objetivos Estratégicos
8. Usuarios Objetivo
9. Casos de Uso
10. Decisiones de Producto (95 decisiones consolidadas)
11. Alcance del Proyecto
12. Qué NO es Falcon
13. Roadmap General (Resumen)
14. Bitácora Cronológica del Proyecto
15. Incidentes y Lecciones Aprendidas
16. Estado Actual del Proyecto
17. Próximos Pasos
```

# 1. Introducción

## ¿Qué es Falcon?

Falcon OSINT Framework 2.0 es un framework Offline-First, Portable, Modular y Open Source para investigación de fuentes abiertas (OSINT), diseñado para investigadores, periodistas, analistas de inteligencia y profesionales de ciberseguridad.

Falcon nace como una evolución del concepto tradicional de "OSINT Framework", pero deja de ser solamente un sitio web con enlaces para convertirse en un workspace profesional de investigación.

El objetivo es que cualquier persona pueda descargar Falcon y disponer de un entorno completo de investigación sin depender de servicios online, cuentas ni suscripciones.

## Objetivos del documento

Este documento constituye la fuente de verdad del proyecto.

Toda decisión futura deberá ser compatible con este Blueprint.

Este documento define:

* Identidad del proyecto.

* Objetivos.

* Alcance.

* Decisiones funcionales.

* Historia del desarrollo.

* Estado actual.

# 2. Historia del Proyecto

## Origen

El proyecto comenzó como una idea para reemplazar el sitio clásico OSINT Framework por una versión moderna.

Las limitaciones detectadas fueron:

* Árbol estático de enlaces.

* No funciona offline.

* No permite favoritos.

* No permite colecciones.

* No existe búsqueda inteligente.

* No existe salud de herramientas.

* No existe comunidad.

* No existe soporte para Latinoamérica.

A partir de estas limitaciones se definió Falcon.

## Evolución de la idea

### Etapa 0 — Sitio de enlaces

Idea inicial:

> "Crear un OSINTFramework 2.0."

### Etapa 1 — Framework Offline

Se decidió incorporar:

* SQLite.

* JSON Builders.

* Búsqueda.

* Categorías.

* Dashboard.

### Etapa 2 — Workspace Profesional

La visión cambió completamente.

Falcon pasó a ser un producto compuesto por módulos independientes.

# 3. Misión

## Declaración Oficial

> Construir el framework OSINT offline, abierto y modular más completo del ecosistema de ciberseguridad, permitiendo a cualquier investigador trabajar desde cualquier lugar, sin depender de servicios propietarios.

## Misión Técnica

Crear un entorno capaz de:

* Descubrir herramientas.

* Organizar investigaciones.

* Mantener un catálogo actualizado.

* Ejecutar workflows.

* Compartir conocimiento.

* Funcionar completamente offline.

## Misión Comunitaria

Crear una comunidad donde cualquiera pueda:

* contribuir herramientas,

* corregir enlaces,

* mejorar Country Packs,

* desarrollar plugins,

* compartir playbooks.

# 4. Visión

## Visión a Largo Plazo

> Ser el nuevo estándar de facto para investigadores OSINT y profesionales de Threat Intelligence dentro de la comunidad global de ciberseguridad.

## Visión 1.0

* Explorer profesional.

* Dashboard.

* Plugins.

* Country Packs.

* Playbooks.

* Health Engine.

* Academia integrada.

## Visión 2.0

* Knowledge Graph.

* IOC Workspace.

* IA Local.

* Sincronización opcional.

* Marketplace comunitario.

# 5. Filosofía de Falcon

Falcon se construye sobre siete pilares.

## 1. Offline First

Todo debe funcionar sin Internet.

Internet solo mejora la experiencia.

Nunca es obligatorio.

## 2. Portable First

Debe ejecutarse desde:

* Windows.

* Linux.

* Kali.

* Parrot.

* Qubes.

* macOS.

Sin instalación compleja.

## 3. Comunidad Primero

El catálogo pertenece a la comunidad.

Las herramientas pueden proponerse mediante Pull Requests.

## 4. Modularidad

Cada módulo puede evolucionar independientemente.

Explorer no conoce Plugins.

Plugins no conocen Dashboard.

## 5. Transparencia

Toda información debe ser verificable.

Cada herramienta tendrá:

* fuente,

* licencia,

* estado,

* fecha de verificación.

## 6. Seguridad

Falcon nunca ejecutará código automáticamente.

Toda instalación requiere permiso.

## 7. Investigación Responsable

Falcon facilita herramientas.

El uso queda bajo responsabilidad del investigador.

# 6. Principios Fundamentales

## Arquitectura

* Offline-first.

* SQLite como base principal.

* JSON como fuente editable.

* Builder genera SQLite.

## UX

Inspiración:

* Linear.

* Obsidian.

* GitHub.

* VSCode.

## Diseño

Minimalista.

Oscuro por defecto.

Animaciones sutiles.

Accesibilidad completa.

## Internacionalización

Idiomas oficiales:

* Español.

* Inglés.

* Portugués.

Idiomas planificados:

* Ruso.

* Chino.

# 7. Objetivos Estratégicos

## Objetivo General

Crear un framework de investigación profesional.

## Objetivos Específicos

### Explorer

500 herramientas verificadas.

### Plugins

Marketplace abierto.

### Country Packs

Más de 100 países.

### Health Engine

Monitorear el estado de herramientas.

### Playbooks

Biblioteca de investigaciones.

### Academy

Formación integrada.

# 8. Usuarios Objetivo

## Perfil principal

<table class="_6IUVGW_Table" data-d-column-sizing="equal" data-d-dividers="" style="table-layout: fixed;"><tbody><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Perfil</td><td data-d-component="table-cell" data-d-valign="start">Prioridad</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Investigadores OSINT</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐⭐⭐</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Periodistas</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐⭐⭐</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Pentesters</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐⭐</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">DFIR / Blue Team</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐⭐</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Analistas SOC</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Fuerzas de Seguridad</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Threat Intelligence</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐⭐</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Estudiantes</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">OSINT Hobbyists</td><td data-d-component="table-cell" data-d-valign="start">⭐⭐⭐⭐⭐</td></tr></tbody></table>

## Mercado Inicial

Latinoamérica.

Posteriormente:

América.

Luego Global.

# 9. Casos de Uso

## HUMINT

Buscar una persona.

Guardar evidencia.

## SOCMINT

Buscar usuarios.

Redes sociales.

Telegram.

Twitter/X.

## GEOINT

Herramientas geográficas.

## IMINT

Análisis de imágenes.

## Domains

WHOIS.

DNS.

NIC.

## Companies

CNPJ.

CUIT.

Business registries.

## Government

Boletines oficiales.

Open Data.

Padrones.

## DFIR

IOC.

Hashes.

Artefactos.

## Threat Intelligence

Feeds.

Repositorios.

YARA.

Sigma.

# 10. Decisiones de Producto Consolidadas

## Plataforma

* Offline First.

* Portable.

* Open Source.

* Modular.

## Base de Datos

SQLite.

Persistencia local.

## Sincronización

Opcional.

Nunca obligatoria.

## IA

Local.

Opcional.

Modular.

## Temas Oficiales

* Falcon Dark.

* Falcon Light.

* Dracula.

* Nord.

* Gruvbox.

* Matrix.

* Solarized.

* Midnight OLED.

## Sidebar Oficial

1. Explorer

2. Collections

3. Favorites

4. Playbooks

5. Plugins

6. Countries

7. Settings

## Vista Predeterminada

Lista.

Vista alternativa Grid.

## Dashboard

Incluye:

* Estadísticas.

* Favoritos.

* Health.

* Actividad.

## Plugins

Marketplace comunitario.

Instalación bajo permiso.

Hash obligatorio.

## Country Packs

Detección automática del país.

## Health Engine

Estados:

* Verified

* Working

* Beta

* Deprecated

* Archived

* Broken

## Tool Health

Basado en comunidad.

No bloquea herramientas.

## Licencias

Mostrar licencia.

No filtrar herramientas por legalidad global.

## Advertencias

Mensajes informativos.

Nunca bloqueantes.

## Colecciones

SQLite.

Locales.

## Favoritos

Persistentes.

LocalStorage.

## Playbooks

Interactivos.

Paso a paso.

No bloquean producción.

## Knowledge Graph

Planificado.

## Academy

Tutoriales interactivos.

## IOC Workspace

Planificado.

## AI Assistant

Planificado para v1.0.

# 11. Alcance del Proyecto

## Incluye

* Explorer.

* Dashboard.

* SQLite.

* Plugins.

* Collections.

* Country Packs.

* Health.

* Playbooks.

* Academia.

* Knowledge Graph.

## No Incluye

* Servicios cloud obligatorios.

* Recolección de datos de usuarios.

* Telemetría obligatoria.

* Instalación automática de software sin permiso.

# 12. Qué NO es Falcon

Falcon no pretende ser:

* Malware.

* Framework ofensivo.

* Herramienta de explotación.

* Plataforma SaaS cerrada.

* Reemplazo de Kali Linux.

Falcon es un workspace.

# 13. Roadmap General (Resumen)

<table class="_6IUVGW_Table" data-d-column-sizing="equal" data-d-dividers="" style="table-layout: fixed;"><tbody><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Versión</td><td data-d-component="table-cell" data-d-valign="start">Contenido principal</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.1 Alpha</td><td data-d-component="table-cell" data-d-valign="start">Explorer Offline + SQLite.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.2 Alpha</td><td data-d-component="table-cell" data-d-valign="start">Dashboard + Explorer Pro.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.3 Alpha</td><td data-d-component="table-cell" data-d-valign="start">Collections + Vault.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.4 Beta</td><td data-d-component="table-cell" data-d-valign="start">Plugin SDK.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.5 Beta</td><td data-d-component="table-cell" data-d-valign="start">Playbooks.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.6 Beta</td><td data-d-component="table-cell" data-d-valign="start">Country Packs + Health.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.7 RC</td><td data-d-component="table-cell" data-d-valign="start">Knowledge Graph.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.8 RC</td><td data-d-component="table-cell" data-d-valign="start">IOC Workspace.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v0.9 RC</td><td data-d-component="table-cell" data-d-valign="start">Academy.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">v1.0 Stable</td><td data-d-component="table-cell" data-d-valign="start">Falcon OSINT Framework 2.0.</td></tr></tbody></table>

# 14. Bitácora Cronológica del Proyecto

## Sprint M1 — Bootstrap

### Objetivo

Crear la base del proyecto.

### Implementado

* Repositorio Git.

* Vite.

* Vitest.

* PWA.

* GitHub.

### Resultado

Primer build funcional.

## Sprint M2 — SQLite Engine

### Objetivo

Eliminar dependencia de JSON en runtime.

### Implementado

* Builder SQLite.

* compile-db.mjs.

* seed.mjs.

* validate-json.mjs.

### Base creada

`database/falcon.db`

## Sprint M2.1 — JSON Intelligence

Se creó:

* categories/

* countries/

* humint.json

* socmint.json

* Argentina Packs.

## Sprint M2.2 — Migraciones

Se definieron:

* 001_initial.sql

* 002_fts.sql

* 003_graph.sql

## Incidente: FTS5

Error:

`no such module: fts5`

### Decisión

Desactivar migración 002.

Documentar futura implementación.

## Sprint M3.1 — Explorer Offline Foundation

### Objetivo

Construir Explorer.

### Implementado

* SQLite Loader.

* Cards.

* Sidebar.

* Toolbar.

* Search.

* Filters.

* Explorer CSS.

## Incidente: database.js truncado

Explorer dejó de funcionar.

### Resolución

Reescribir archivo completo.

Nueva política:

Nunca reemplazar archivos parcialmente.

## Sprint M3.1.1

### Resultado

Explorer muestra herramientas SQLite.

12 herramientas iniciales.

## Sprint M3.1.2

Cards profesionales.

Badges.

Score.

Botones.

Estado.

## Incidente: Explorer roto por CSS

Themes rompieron layout.

### Resolución

Rollback.

Refactor progresivo.

## Sprint M3.2 — Dashboard

Implementado:

* Dashboard.

* Widgets.

* Stats.

* Health Placeholder.

## Sprint M3.2.1

Favoritos persistentes.

localStorage.

Sidebar actualizado.

## Incidente: Website/GitHub duplicados

Cards mostraban enlaces idénticos.

### Decisión

Mostrar GitHub solo cuando exista.

Website independiente.

## Sprint QA

Build PASS.

Vitest PASS.

PR Draft actualizado.

## GitHub

### Rama principal de desarrollo

`feature/sqlite-engine`

### Pull Request

PR #1 Draft.

### Commits principales

* Bootstrap.

* SQLite Engine.

* Explorer Foundation.

* Explorer UI.

* Dashboard.

* Favorites.

## Toolchain

Se instaló:

* GitHub CLI.

* Codex CLI.

* Node Portable.

* SQLite Builder.

## Entorno Windows

PowerShell.

Node Portable.

Scripts.

# 15. Incidentes y Lecciones Aprendidas

## BOM en JSON

Problema.

UTF-8 BOM.

### Solución

Validación automática.

## Node 20 vs Node 22

Problema.

Vite requería Node 22.

### Solución

Node Portable.

Scripts de entorno.

## npm 12

Requiere Node 22.22+.

Decisión pendiente.

## GitHub CLI

Token expirado.

Re-login exitoso.

## Codex CLI

Actualizado de:

0.136 → 0.154.

## Sandbox de Codex

Limitaciones:

* index.lock

* npm spawn

* build sandbox

Nueva política:

Codex implementa.

ChatGPT diseña.

# 16. Estado Actual del Proyecto

## Versión

v0.1 Alpha.

## Componentes Terminados

<table class="_6IUVGW_Table" data-d-column-sizing="equal" data-d-dividers="" style="table-layout: fixed;"><tbody><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Módulo</td><td data-d-component="table-cell" data-d-valign="start">Estado</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Explorer</td><td data-d-component="table-cell" data-d-valign="start">✅ Funcional.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">SQLite Engine</td><td data-d-component="table-cell" data-d-valign="start">✅ Funcional.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Dashboard</td><td data-d-component="table-cell" data-d-valign="start">✅ Funcional.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Favorites</td><td data-d-component="table-cell" data-d-valign="start">✅ Persistente.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">PWA</td><td data-d-component="table-cell" data-d-valign="start">✅ Base creada.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Tests</td><td data-d-component="table-cell" data-d-valign="start">✅ PASS.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Build</td><td data-d-component="table-cell" data-d-valign="start">✅ PASS.</td></tr></tbody></table>

## Componentes Pendientes

<table class="_6IUVGW_Table" data-d-column-sizing="equal" data-d-dividers="" style="table-layout: fixed;"><tbody><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Módulo</td><td data-d-component="table-cell" data-d-valign="start">Estado</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Collections</td><td data-d-component="table-cell" data-d-valign="start">⬜ Pendiente.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Plugin SDK</td><td data-d-component="table-cell" data-d-valign="start">⬜ Pendiente.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Playbooks</td><td data-d-component="table-cell" data-d-valign="start">⬜ Pendiente.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Country Packs</td><td data-d-component="table-cell" data-d-valign="start">⬜ Pendiente.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Health Engine</td><td data-d-component="table-cell" data-d-valign="start">⬜ Parcial.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Knowledge Graph</td><td data-d-component="table-cell" data-d-valign="start">⬜ Pendiente.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Academy</td><td data-d-component="table-cell" data-d-valign="start">⬜ Pendiente.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">AI Assistant</td><td data-d-component="table-cell" data-d-valign="start">⬜ Pendiente.</td></tr></tbody></table>

## Estado del Repositorio

Repositorio GitHub inicializado.

Rama principal:

`main`

Rama de desarrollo:

`feature/sqlite-engine`

PR #1 abierta como Draft.

## Stack Tecnológico

<table class="_6IUVGW_Table" data-d-column-sizing="equal" data-d-dividers="" style="table-layout: fixed;"><tbody><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Tecnología</td><td data-d-component="table-cell" data-d-valign="start">Estado</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Vite</td><td data-d-component="table-cell" data-d-valign="start">Frontend.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">SQLite WASM</td><td data-d-component="table-cell" data-d-valign="start">Offline DB.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Vitest</td><td data-d-component="table-cell" data-d-valign="start">Testing.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">GitHub CLI</td><td data-d-component="table-cell" data-d-valign="start">PR Management.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">Codex CLI</td><td data-d-component="table-cell" data-d-valign="start">Implementación asistida.</td></tr><tr data-d-component="table-row"><td data-d-component="table-cell" data-d-valign="start">PowerShell</td><td data-d-component="table-cell" data-d-valign="start">Scripts de desarrollo.</td></tr></tbody></table>

# 17. Próximos Pasos

## Épica E0 — Engineering Foundation

* Blueprint.

* Architecture.

* UI Spec.

* Roadmap.

* ADRs.

## Épica E1 — Explorer Pro

* Filtros avanzados.

* Grid/List.

* Health Badges.

* Country Filters.

* Themes estables.

## Épica E2 — Collections

* Vault.

* Notas.

* Etiquetas.

* Exportación.

## Épica E3 — Plugin SDK

* Manifest.

* Permisos.

* Instalación segura.

* Marketplace.

## Épica E4 — Playbooks

* Tutoriales interactivos.

* Templates.

* Workflows.

## Declaración Final del Blueprint

Falcon OSINT Framework 2.0 se desarrolla bajo una estrategia offline-first, modular, portable y comunitaria, priorizando la transparencia, la reproducibilidad y la colaboración abierta. Este Blueprint constituye la referencia oficial para todas las decisiones de producto y desarrollo desde la versión Alpha hasta la versión Stable 1.0.
