Markdown

````
# UI_SPEC_AND_ROADMAP.md — Falcon OSINT Framework 2.0 (Volumen III)

> **Especificación Oficial de UI/UX, Diseño del Sistema, Roadmap y Backlog Maestro**
>
> Versión: UI/UX Spec v1.0
>
> Estado del proyecto: **v0.1 Alpha**

---

# Índice

1. Filosofía de Diseño
2. Identidad Visual de Falcon
3. Sistema de Diseño
4. Paleta de Colores
5. Tipografía
6. Iconografía
7. Layout General
8. Sidebar
9. Toolbar
10. Explorer UI
11. Dashboard UI
12. Collections UI
13. Playbooks UI
14. Plugin Manager UI
15. Country Packs UI
16. Health Engine UI
17. Theme Engine
18. Animaciones
19. Accesibilidad
20. Diseño Responsive
21. Experiencia Offline
22. Roadmap Oficial
23. Épicas
24. Backlog Maestro
25. Criterios de Calidad
26. Definición de Falcon v1.0

---

# 1. Filosofía de Diseño

## Objetivo

Falcon debe sentirse como una herramienta profesional de investigación, no como una web de enlaces.

La interfaz debe transmitir:

- rapidez,
- claridad,
- confianza,
- productividad.

---

## Inspiraciones Oficiales

| Producto | Qué tomamos |
|----------|-------------|
| Linear | Sidebar, minimalismo, espaciado. |
| Obsidian | Workspace oscuro y modular. |
| GitHub | Componentes, badges y tablas. |
| VS Code | Navegación lateral y paneles. |
| Raycast | Búsqueda rápida y comandos. |

---

## Principios UX

- Todo accesible con teclado.
- Menos clics.
- Sin ventanas invasivas.
- Información jerárquica.
- Acciones visibles.
- Animaciones discretas.

---

# 2. Identidad Visual de Falcon

## Concepto

**Falcon** representa velocidad, precisión e inteligencia.

No es una estética "hacker verde".

Es un producto profesional de inteligencia.

---

## Personalidad

- Elegante.
- Técnica.
- Minimalista.
- Oscura.
- Modular.
- Internacional.

---

## Estilo

- Bordes redondeados suaves.
- Sombras mínimas.
- Mucho espacio negativo.
- Contraste alto.

---

# 3. Sistema de Diseño

## Tokens Globales

```css
--radius-xs
--radius-sm
--radius-md
--radius-lg
--radius-xl

--spacing-1
--spacing-2
--spacing-3
--spacing-4
--spacing-5
--spacing-6
```

---

## Elevaciones

| Nivel | Uso |
|-------|-----|
|0|Background.|
|1|Cards.|
|2|Hover Cards.|
|3|Dialogs.|
|4|Modals.|

---

## Bordes

```css
1px solid rgba(...)
```

Siempre sutiles.

---

## Sombras

Muy pequeñas.

Solo para separar capas.

---

# 4. Paleta Oficial

## Falcon Dark (Default)

| Token | Color |
|-------|--------|
|Background|#0B0F17|
|Surface|#121826|
|Surface Hover|#1A2333|
|Border|#263043|
|Primary|#E5EDF8|
|Secondary|#A7B2C4|
|Accent|#4EA1FF|
|Success|#23C16B|
|Warning|#F59E0B|
|Danger|#EF4444|

---

## Falcon Light

| Token | Color |
|-------|--------|
|Background|#F5F7FA|
|Surface|#FFFFFF|
|Border|#E3E8F0|
|Primary|#18202F|
|Accent|#2563EB|

---

## Estados

| Estado | Color |
|---------|-------|
|Verified|Verde.|
|Working|Azul.|
|Beta|Amarillo.|
|Deprecated|Naranja.|
|Broken|Rojo.|
|Archived|Gris.|

---

# 5. Tipografía

## Fuente Principal

Inter.

---

## Alternativas

- System UI.
- Segoe UI.
- SF Pro.

---

## Escala

| Elemento | Tamaño |
|----------|---------|
|Título Principal|32px|
|H2|24px|
|H3|20px|
|Card Title|18px|
|Body|14–16px|
|Caption|12px|

---

## Pesos

- 400
- 500
- 600
- 700

---

# 6. Iconografía

## Biblioteca Oficial

Lucide Icons.

---

## Categorías

- HUMINT
- SOCMINT
- GEOINT
- IMINT
- Government
- Domains
- Companies
- People
- Threat Intelligence
- Plugins
- Playbooks

---

## Reglas

Siempre íconos lineales.

Sin iconos rellenos.

---

# 7. Layout General

## Estructura

```text
+----------------------------------------------------+
| Sidebar | Toolbar                                  |
|         |------------------------------------------|
|         | Dashboard / Explorer / Collections        |
|         |                                          |
|         |                                          |
+----------------------------------------------------+
```

---

## Ancho Sidebar

280px.

Colapsable.

---

## Toolbar

Fija arriba.

---

## Área Principal

Scroll independiente.

---

# 8. Sidebar

## Orden Oficial

```text
Dashboard

Explorer

Collections

Favorites

Playbooks

Plugins

Country Packs

Academy

Settings
```

---

## Estados

- Normal.
- Hover.
- Activo.
- Colapsado.

---

## Información Mostrada

- Ícono.
- Nombre.
- Contador.
- Indicador activo.

---

## Footer Sidebar

- Versión Falcon.
- Estado SQLite.
- Tema activo.

---

# 9. Toolbar

## Componentes

- Buscador.
- Vista Lista/Grid.
- Ordenar.
- Filtros.
- Tema.
- Configuración.

---

## Buscador

Placeholder:

```
Search tools, domains, usernames...
```

---

## Quick Actions

- Ctrl + K.
- Ctrl + F.
- Ctrl + Shift + P.

---

# 10. Explorer UI

## Vista Lista (Default)

Cada card ocupa ancho completo.

---

## Vista Grid

2–4 columnas.

---

## Card Oficial

Contenido:

- Nombre.
- Categoría.
- Subcategoría.
- Descripción.
- País.
- License.
- Badges.
- OPSEC Score.
- Quality Score.
- Website.
- GitHub.
- Favorite.

---

## Badges

- Offline.
- API.
- Docker.
- VPN.
- TOR.

---

## Ordenamientos

- Nombre.
- Calidad.
- OPSEC.
- Fecha.
- País.

---

## Filtros

### Categoría

### País

### Licencia

### Offline

### Docker

### API

### VPN

### TOR

### Favoritos

### Health

---

## Empty State

Mensaje elegante.

Botón limpiar filtros.

---

# 11. Dashboard UI

## Widgets Oficiales

- Total Tools.
- Categories.
- Countries.
- Favorites.
- Offline Ready.
- APIs.
- Docker.

---

## Segunda Fila

- Recently Verified.
- Broken Tools.
- Deprecated.
- Community Health.

---

## Activity Feed (Futuro)

Últimas verificaciones.

---

## Health Panel

Resumen del catálogo.

---

# 12. Collections UI

## Objetivo

Vault personal.

---

## Funcionalidades

- Crear colección.
- Renombrar.
- Color.
- Descripción.
- Notas.
- Tags.

---

## Card Colección

- Nombre.
- Herramientas.
- Fecha creación.
- Última modificación.

---

## Vista

Lista y Grid.

---

# 13. Playbooks UI

## Objetivo

Investigaciones paso a paso.

---

## Componentes

- Introducción.
- Objetivo.
- Requisitos.
- Pasos.
- Checklist.
- Recursos.

---

## Estado

- Completado.
- En progreso.
- Favorito.

---

## Ejemplos

- Username Investigation.
- Email Investigation.
- Domain Enumeration.
- Telegram Investigation.
- Company Investigation.

---

# 14. Plugin Manager UI

## Marketplace

Listado de plugins.

---

## Card Plugin

- Nombre.
- Autor.
- Versión.
- Licencia.
- Compatibilidad.
- Permisos.

---

## Instalación

Botón Install.

Siempre muestra permisos.

---

## Permisos

- Filesystem.
- Network.
- SQLite.
- Docker.
- Shell.

---

# 15. Country Packs UI

## Objetivo

Herramientas por país.

---

## Selector

- Detectar automáticamente.
- Elegir manualmente.

---

## Card País

- Bandera.
- Nombre.
- Herramientas.
- Estado.

---

## Packs Iniciales

- Argentina.
- Brasil.
- México.
- Global.

---

# 16. Health Engine UI

## Vista Principal

Tabla de estado.

---

## Indicadores

- Verified.
- Working.
- Beta.
- Deprecated.
- Broken.
- Archived.

---

## Score

0–100.

---

## Community Health

Barra de estado.

---

## Acciones

- Report Broken.
- Suggest Update.

---

# 17. Theme Engine

## Temas Oficiales

| Tema | Estado |
|------|--------|
|Falcon Dark|Default|
|Falcon Light|Disponible|
|Nord|Disponible|
|Dracula|Disponible|
|Gruvbox|Disponible|
|Matrix|Disponible|
|Solarized|Disponible|
|Midnight OLED|Disponible|

---

## Configuración

Settings → Appearance.

---

## Persistencia

localStorage.

---

## Opciones

- Compact Mode.
- Comfortable Mode.
- Reduced Motion.

---

# 18. Animaciones

## Principios

Sutiles.

Desactivables.

---

## Duraciones

| Acción | Tiempo |
|--------|---------|
|Hover|120ms|
|Sidebar|180ms|
|Theme|200ms|
|Dialog|150ms|

---

## Animaciones Permitidas

- Fade.
- Slide.
- Scale pequeño.

---

## Animaciones Prohibidas

- Bounce.
- Glitch.
- Flash.
- Shake.

---

# 19. Accesibilidad

## Objetivos WCAG

AA.

---

## Navegación

100% teclado.

---

## Focus Visible

Siempre visible.

---

## Contraste

Mínimo AA.

---

## Preferencias Usuario

- Reduced Motion.
- High Contrast.
- Font Size.

---

# 20. Responsive

## Breakpoints

| Resolución | Diseño |
|------------|--------|
|320px|Mobile|
|768px|Tablet|
|1024px|Desktop|
|1440px|Wide|

---

## Sidebar

Colapsa automáticamente.

---

## Explorer

Grid adaptable.

---

# 21. Experiencia Offline

## Indicadores

SQLite Loaded.

---

## Banner

Solo cuando falte conexión para funciones online.

---

## Cache

- SQLite.
- CSS.
- JS.
- Iconos.

---

## Sincronización

Opcional.

Nunca automática.

---

# 22. Roadmap Oficial

## Fase Alpha

### v0.1 Alpha

- SQLite Engine.
- Explorer.
- Dashboard básico.
- Favoritos.

### v0.2 Alpha

- Explorer Pro.
- Theme Engine.
- Dashboard avanzado.

### v0.3 Alpha

- Collections.
- Vault.
- Notes.

---

## Fase Beta

### v0.4 Beta

Plugin SDK.

Marketplace.

### v0.5 Beta

Playbooks.

### v0.6 Beta

Country Packs.

Health Engine.

---

## Release Candidate

### v0.7 RC

Knowledge Graph.

### v0.8 RC

IOC Workspace.

### v0.9 RC

Academy.

---

## Stable

### v1.0

Falcon OSINT Framework completo.

---

# 23. Épicas del Proyecto

## E0

Engineering Foundation.

## E1

Explorer Pro.

## E2

Dashboard Intelligence.

## E3

Collections.

## E4

Plugin SDK.

## E5

Marketplace.

## E6

Country Packs.

## E7

Health Engine.

## E8

Playbooks.

## E9

Knowledge Graph.

## E10

IOC Workspace.

## E11

Academy.

## E12

AI Assistant.

---

# 24. Backlog Maestro

## Prioridad P0

### Explorer

- Multi-filters.
- Grid/List.
- Sort.
- Health Badges.
- Website/GitHub Fix.

### Dashboard

- Stats.
- Health.
- Activity.
- Widgets.

### Theme Engine

- Persistencia.
- 8 temas.

---

## Prioridad P1

### Collections

- Vault.
- Tags.
- Notes.
- Export JSON.
- Export Markdown.

### Plugins

- Manifest.
- Install.
- Update.
- Remove.

---

## Prioridad P2

### Health Engine

- Community Reports.
- Broken Detector.
- Verification History.

### Country Packs

- Argentina.
- Brasil.
- México.
- Chile.
- Uruguay.

---

## Prioridad P3

### Playbooks

- HUMINT.
- SOCMINT.
- GEOINT.
- DFIR.
- Threat Intel.

### Knowledge Graph

- Personas.
- Empresas.
- Dominios.
- Emails.

---

## Prioridad P4

### Academy

- Tutoriales.
- Laboratorios.
- Quizzes.

### AI Assistant

- Local LLM.
- RAG.
- Playbook Assistant.

---

# 25. Criterios de Calidad

## Cada Sprint debe cumplir

- Build PASS.
- Tests PASS.
- Explorer funcional.
- Dashboard funcional.
- SQLite intacta.

---

## Nunca modificar sin aprobación

- database/falcon.db
- schema.sql
- migraciones
- datasets protegidos

---

## Pull Requests

Una épica por PR.

Documentación incluida.

Checklist completado.

---

## QA Obligatorio

- Manual.
- Automático.
- Visual.

---

# 26. Definición de Falcon v1.0

## Falcon v1.0 incluirá

### Workspace

- Dashboard.
- Explorer.
- Collections.
- Playbooks.

### Intelligence

- Country Packs.
- Health Engine.
- Knowledge Graph.
- IOC Workspace.

### Ecosistema

- Plugin SDK.
- Marketplace.
- Academy.

### Plataforma

- Offline First.
- SQLite.
- PWA.
- Portable.
- Multiplataforma.
- Comunidad Open Source.

---

## Declaración Oficial de UI/UX

La interfaz de Falcon debe priorizar **velocidad, claridad y productividad**, inspirándose en herramientas modernas de ingeniería y conocimiento (Linear, Obsidian, GitHub y VS Code), manteniendo una experiencia consistente, accesible y completamente funcional sin conexión.

---

## Objetivo Final

> **Falcon OSINT Framework 2.0** aspira a convertirse en el framework de OSINT preferido por investigadores, periodistas y profesionales de ciberseguridad mediante un entorno abierto, modular, offline-first y mantenido por la comunidad.
````
