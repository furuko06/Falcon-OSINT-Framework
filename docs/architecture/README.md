# Architecture

Falcon OSINT Framework is an offline-first investigation workspace built around a
Vite front end, modular UI features, and a local SQLite intelligence store. The
architecture favors transparent data provenance, deterministic local workflows,
and clear boundaries between source data, derived intelligence, and presentation.

## Project Architecture Overview

At a high level, Falcon is organized into five layers:

1. Application shell: bootstraps the browser app, routing, shared state, logging,
   and event coordination.
2. UI modules: feature-specific screens such as Explorer that render workflows
   and user interactions.
3. Database access: SQLite initialization, queries, migrations, full-text search,
   and seed loading.
4. Intelligence assets: curated categories, country packs, schema files, and
   build scripts that compile offline data.
5. Distribution layer: Vite build output, PWA assets, and static application
   resources.

The current app is designed to run locally and preserve investigation continuity
without requiring a remote service.

## Explorer Module Diagram

```text
User
  |
  v
Explorer UI
  |
  +-- Toolbar: search input, filters, view controls
  +-- Sidebar: category and source navigation
  +-- Cards: intelligence result presentation
  +-- State: selected filters, query text, result state
  +-- Events: user interaction and module coordination
  |
  v
Database Query Layer
  |
  v
SQLite Intelligence Store
```

Explorer is responsible for helping analysts browse, search, filter, and inspect
offline intelligence records while keeping data access behind the database query
layer.

## SQLite Data Flow

```text
Curated JSON / schema / migrations
  |
  v
Validation and compile scripts
  |
  v
SQLite database artifact
  |
  v
Runtime database loader
  |
  v
Query and FTS helpers
  |
  v
Explorer and future modules
```

SQLite is the local source of truth for compiled intelligence data. Build-time
scripts validate and prepare structured intelligence inputs. Runtime code loads
the database, applies the expected access patterns, and exposes query results to
UI modules.

## Intelligence Pipeline

The intelligence pipeline should preserve provenance and repeatability:

1. Source intelligence is authored as structured data with clear category and
   country boundaries.
2. Validation checks ensure records follow the expected shape.
3. Compilation produces a local SQLite dataset.
4. Runtime search and filtering expose the data to investigators.
5. Future graph, plugin, assistant, and API layers should consume the same
   normalized intelligence foundation instead of duplicating data sources.

Pipeline changes must consider data quality, source attribution, privacy, and the
risk of over-collection.

## UI Module Responsibilities

UI modules should:

- Own their local rendering, interactions, and user workflow state.
- Use shared core services for routing, storage, events, and logging.
- Request data through database/query helpers rather than reading raw assets.
- Keep investigation workflows accessible, responsive, and predictable.
- Avoid hidden network dependencies in offline-first views.
- Surface uncertainty, missing data, and source limitations clearly.

Future modules should follow the same boundary: focused user experience at the
module layer, shared infrastructure in core services, and data access through
well-defined database interfaces.

