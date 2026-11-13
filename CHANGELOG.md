# Changelog

All notable changes to Falcon OSINT Framework will be documented in this file.

This project follows the spirit of Keep a Changelog and uses semantic versioning
once stable releases begin. Until v1.0, breaking changes may occur between minor
alpha releases and will be called out explicitly.

## [Unreleased]

### Added

- 25 live-verified tools across GEOINT, data, finance, archive, monitoring,
  environment and SOCMINT packs, bringing the catalog to 165 entries.
- Eleven external AI connectors (ChatGPT, Claude, Gemini, DeepSeek, Qwen, Z.ai,
  Grok, Perplexity, Le Chat, Copilot and Kimi) that open the provider in its own
  window and copy the prompt. Falcon never handles OAuth, credentials or Gmail.
- Assistant empty-state examples, a copy-answer action, a model/local-source
  badge and Ollama model suggestions with VRAM guidance.
- Skip link, global focus-visible styling, coarse-pointer target sizes and
  reduced-motion support.

### Changed

- The suggested local model is now `qwen3.5:9b`, with `gemma4` and `qwen3.8`
  alternatives; the tag remains editable.
- Favicon and web manifest moved to `public/` so production URLs stay relative
  and valid under the Pages subpath.

### Fixed

- External windows are opened without the `noopener` feature and detached with
  `opener = null`, because `window.open()` always returns `null` with noopener
  and every launch looked like a popup blocker.
- The web manifest icon no longer points at `assets/assets/favicon.svg` after
  Vite relocates the manifest into `dist/assets/`.
- The Pages workflow copies both `sql-wasm.wasm` and `sql-wasm-browser.wasm` so
  SQLite initialization cannot fail on the deployed site.

### Security

- Connector consent is per launch and resets after use; no provider tokens or
  Google account access are stored by Falcon.

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

