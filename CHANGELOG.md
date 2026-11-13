# Changelog

All notable changes to Falcon OSINT Framework will be documented in this file.

This project follows the spirit of Keep a Changelog and uses semantic versioning
once stable releases begin. Until v1.0, breaking changes may occur between minor
alpha releases and will be called out explicitly.

## [Unreleased]

## [0.3.0-alpha] - 2026-11-13

### Added

- 25 live-verified tools across GEOINT, data, finance, archive, monitoring,
  environment and SOCMINT packs, bringing the catalog to 165 entries.
- OpenRouter connection through OAuth PKCE: the user authorizes on OpenRouter,
  returns to Falcon and can test and query models from OpenAI, Anthropic, Google,
  DeepSeek, Qwen, xAI, Mistral and others without copying prompts.
- Query audit trail with environment, exact context, sources and prompt for each
  AI call, included in local backups.
- JSON backup with SQLite snapshot, checksum, local settings and query history;
  restore merges local data and never includes API keys.
- Settings panel with schema migrations, storage inventory and backup/restore,
  plus a Policies and Privacy tab with a recorded acknowledgment.
- Versioned service worker that precaches the app shell, database and both
  sql.js WASM builds, with an offline navigation fallback.

### Changed

- Replaced the copy-prompt provider launchers with a real connected-AI flow.
  Session credentials stay in `sessionStorage` and are removed on disconnect.
- The suggested local model is now `qwen3.5:9b`, with `gemma4` and `qwen3.8`
  alternatives; the tag remains editable.
- `npm run build` now copies the database and WASM files and generates the
  service worker, so `dist/` is directly deployable.
- The SQLite schema is now version 2 with recorded migrations and an `app_meta`
  table.

### Fixed

- The dashboard no longer shows `Database Version: Unknown`: legacy databases
  with an empty `schema_version` are repaired and upgraded on open.
- The web manifest icon no longer points at `assets/assets/favicon.svg` after
  Vite relocates the manifest into `dist/assets/`.
- The Pages workflow no longer needs a separate asset-copy step.

### Security

- PKCE with S256 and a CSRF `state` parameter; the verifier is single-use and
  API keys live only in the current tab.
- Backups exclude OpenRouter sessions and any credential-like local key.
- OpenRouter requests opt out of provider data collection where supported.

## [0.2.0-alpha] - 2026-11-13

### Added

- Repository community health documentation for contributors, security reporting,
  governance, and roadmap planning.
- Documentation structure for architecture, API, database, OPSEC, and development
  notes.
- Falcon favicon and web manifest icon links.
- E12 AI Assistant: local retrieval over the SQLite catalog, Academy and
  Playbooks, deterministic offline briefings, note triage, prompt previews and an
  optional local Ollama connection.
- Academy lessons, labs and a quiz on claim triage, geolocation, corporate
  records and evidence archiving, with source links.
- 31 catalog entries for environmental, archiving, data analysis, corporate
  registry, historical imagery, synthetic media and monitoring work.

### Changed

- Academy lessons and labs now display their reference sources.

### Security

- Added a responsible disclosure policy for reporting vulnerabilities in Falcon.
- The AI Assistant only calls a loopback model endpoint and requires explicit
  per-query consent before sending the prompt; case notes stay in the page and
  are excluded unless the analyst opts in.

## [0.1.0-alpha]

### Added

- Initial offline-first Falcon OSINT Framework foundation.
- SQLite-backed intelligence storage.
- Vite application shell.
- Explorer-focused investigation workflow groundwork.
- LATAM-oriented intelligence pack structure.

