# Changelog

All notable changes to Falcon OSINT Framework will be documented in this file.

This project follows the spirit of Keep a Changelog and uses semantic versioning
once stable releases begin. Until v1.0, breaking changes may occur between minor
alpha releases and will be called out explicitly.

## [Unreleased]

## [0.6.0-beta] - 2026-11-13

### Added

- Recoverable database failure panel: a failed `falcon.db` download, a corrupt
  file or a failed migration now explains what happened and offers a retry plus
  a cache reset that unregisters the service worker without touching favorites,
  notes, IOC, collections or settings. Classification lives in
  `framework/database/recovery.js`, with tests in
  `tests/database-recovery.test.js`.
- Threat model for local data, imported backups, plugin manifests and model
  endpoints (`docs/security/THREAT_MODEL.md`), marking every control as
  delivered, partial or a gap instead of assuming it works.

### Changed

- Version `0.6.0-beta` across the app shell, settings, assistant, backup format
  and documentation.

### Fixed

- `Database.initialize()` now shares one in-flight open between concurrent
  callers, so startup downloads and migrates `falcon.db` once instead of once
  per caller (seven redundant fetches were observed in the browser) and a
  failed open can be retried instead of being cached.

## [0.5.0-beta] - 2026-11-13

### Added

- `npm run gates` release-gate aggregator: unit tests, security scan, dependency
  audit, data validation, production build, performance budgets, accessibility
  and assistant evaluation, with a reproducible `docs/audits/GATES_REPORT.md`.
- Performance budgets in `config/perf-budgets.json` and `npm run perf`, which
  measures the real production build in headless Chrome plus a deterministic
  1,000-document retrieval corpus. Evidence in `docs/audits/PERF_REPORT.md`.
- Assistant evaluation harness `npm run eval:model`, a reproducible 11-case
  dataset in `evaluation/model-eval.json` and thresholds in
  `evaluation/gates.json`, covering citations, refusal without context and
  prompt injection. Evidence in `docs/audits/MODEL_EVAL.md`.
- Startup performance marks (`falcon:*`) for database open, catalog query and
  first paint, exposed through `window.__falconPerf` for the benchmark.
- Release-gates GitHub Actions workflow.

### Changed

- The real-model evaluation no longer counts a refusal case with no sources as
  a citation failure, matching the offline suite.
- Generated performance and evaluation reports round measurements so the table
  values are stable and readable.
- Version `0.5.0-beta` across the app shell, settings, assistant, backup format
  and documentation.

### Fixed

- The assistant evaluation no longer reports a provider that never answered as
  a quality FAIL. A local server returning 5xx (for example while a model is
  still downloading or with a relative `OLLAMA_MODELS` path), a rejected key or
  a timeout is now `BLOCKED` with the provider error preserved, matching the
  offline suite and the release-gate contract.

## [0.4.0-beta] - 2026-11-13

### Added

- Strict Content Security Policy with external shell styles, no inline
  scripts/styles, a WASM allowance for sql.js, and an allowlist for loopback
  Ollama and OpenRouter.
- Formal accessibility audit: axe-core across 8 views plus keyboard, skip-link,
  reduced-motion and mobile target-size checks; results in
  `docs/audits/A11Y_AUDIT.md`.
- CIS controls alignment and public-repository hardening documentation, with
  CODEOWNERS, Dependabot, CodeQL, dependency review, secret scanning and an
  automated accessibility workflow.
- Repository secret/workflow scan (`npm run security:scan`) and an `npm run a11y`
  audit command.
- `_headers` defense-in-depth for static hosts that honor it (CSP, HSTS,
  Permissions-Policy, frame denial).

### Changed

- Static UI state now uses CSS classes and native `<progress>` elements instead
  of inline style attributes, so the CSP can forbid inline styles.
- Version `0.4.0-beta`; Vite and Vitest were upgraded to resolve known
  vulnerabilities.
- GitHub Actions are pinned to full commit SHAs and use least-privilege
  permissions and non-persistent checkout credentials.

### Removed

- `node_modules/` is no longer tracked in Git. It remains ignored and installed
  from the lockfile.

### Security

- Fixed 5 dependency vulnerabilities, including 2 critical Vitest/tinypool
  findings; `npm audit` now reports 0 vulnerabilities.
- The security scan rejects indexed `.env` files, high-confidence secret
  patterns and unpinned Actions.

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

