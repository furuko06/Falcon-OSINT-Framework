# Changelog

All notable changes to Falcon OSINT Framework will be documented in this file.

This project follows the spirit of Keep a Changelog and uses semantic versioning
once stable releases begin. Until v1.0, breaking changes may occur between minor
alpha releases and will be called out explicitly.

## [Unreleased]

### Added

- Frozen API contracts (G6): six versioned JSON schemas in `contracts/` for tool
  records, playbooks, playbook progress, IOCs, cases and plugin manifests, with a
  SHA-256 lock, a deprecation policy and `npm run contracts:check` wired into the
  release gates. The plugin engine now reports framework version 1.0.0 instead of
  the stale 0.1.0.
- Automated screen-reader tree audit (G4): `npm run screenreader` reads the Chrome
  accessibility tree on eight views and checks accessible names, headings,
  landmarks, dialogs and live regions. It runs inside `npm run gates`.
- Jurisdiction matrix (G9): `docs/legal/JURISDICTIONS.md` covers Argentina, Brazil,
  Mexico, Chile, Colombia, Peru, the EU/EEA, the United Kingdom, the United
  States, Canada and Australia, states that gray areas are the user's
  responsibility, and keeps the project's no-bypass limits non-negotiable.
- Release engineering (G8): `npm run release:manifest` produces a reproducible
  `git archive` of the tag, SHA-256 checksums, a manifest and an optional
  detached GPG signature, with `--verify` for re-checking. Process, upgrade and
  rollback steps live in `docs/releases/RELEASE_PROCESS.md`.
- Scheduled source-health workflow (`.github/workflows/source-health.yml`): a
  weekly `npm run db:verify -- --dry-run` over all 182 sources with a run
  summary rendered by `scripts/source-health-summary.mjs`. It does not run on
  push or pull request, commits nothing and is not a release gate, so a dead
  provider cannot block a build, a deployment or offline use.
- `tests/settings-browser.mjs` checks the Settings flow against the production
  build: the history card shows the stored count, **Borrar historial** removes
  `falcon:query-history`, the count returns to zero and the service worker is
  built for the running version.

### Fixed

- Accessibility: the app had no `h1`, the sidebar was an unlabelled `aside`
  instead of a `navigation` landmark, and a Spanish UI declared `lang="en"`. The
  shell now ships a skip-visible `h1`, a labelled navigation landmark, the right
  language and a document title that follows the open view.
- `npm run db:links` reported every 403/429 as broken and exited 1, contradicting
  the catalog policy where a refused automated client is `restricted`. It now
  shares that classification, prints `ok/restricted/broken`, and only fails on
  real link rot.
- Documentation: the privacy assessment and the G9 index claimed the query
  history had no deletion control, but Settings already exposes **Borrar
  historial** with a confirmation dialog. The documents now describe the shipped
  behavior and the remaining gaps (no per-record deletion, no automatic expiry).

## [1.0.0] - 2026-11-13

### Added

- `tests/assistant-context.test.js` pins the retrieved-context contract: it
  checks `MAX_CONTEXT_DOCS` against the six documents the evaluation was
  measured with and re-runs retrieval over the real evaluation questions, so a
  smaller context fails in a second instead of lowering the offline hit rate
  quietly.
- `tests/db-build-scripts.test.js` runs `db:validate` and `db:compile` twice and
  fails if they stop being deterministic or start writing the database.
- Legal gate G9 artifacts in `docs/legal/`: source terms review, privacy impact
  assessment for case notes and assistant prompts, lawful-use guidance and the
  catalog takedown path, plus the `catalog_correction` issue template.
- `npm run gates -- --skip-ai` renders the release report without the assistant
  evaluation, marking those rows `OMITIDO` and the overall state
  `PASS_WITH_OMITTED` instead of a misleading `PASS`.

### Changed

- Assistant prompt: analyst notes are delimited and placed before the retrieved
  context, the refusal rule covers only "Falcon context has no relevant fact",
  and the copyable format example is gone because both evaluated models returned
  the example line as their answer. Answers are capped at 160 tokens, since 260
  took about 50 s per case on a laptop CPU.
- Model evaluation gives each model its own time budget instead of one shared
  deadline that left the second model with 0 of 11 cases and reported BLOCKED for
  a model that never ran. The release gate raises the default to 8 minutes per
  model (`GATES_EVAL_MAX_MS`).
- Version `1.0.0` across `package.json`, the lockfile, the app shell, settings,
  the assistant, the backup format and the README.
- The assistant and real-model evaluation are deferred to `1.1`; the 1.0 gate
  report records them as omitted, with the offline suite unchanged.
- Model evaluation no longer auto-detects the first two installed Ollama models:
  it measures the reference model `llama3.2:3b`, the smallest model the interface
  offers, unless `FALCON_EVAL_MODELS` or `--model` names another one. Two measured
  runs showed that auto-detection is not a gate: `qwen2.5:0.5b` refused questions
  whose context held the answer (citations 0.5, injection 0) and `llama3.2:1b`
  refused the same questions and flipped its injection result between runs, so a
  model below the 3B floor turned the release gate red for a configuration the
  product does not support. A missing reference model reports BLOCKED with the
  `ollama pull` command instead of a false quality failure.

### Fixed

- `npm run db:compile` crashed on the UTF-8 BOM of the catalog JSON and never
  finished; it now parses the same files as `db:validate` and `db:import`.
- `npm run db:import` deletes catalog entries that were removed from the JSON
  (`removed` in the summary), refuses an empty catalog instead of wiping the
  table, and stays byte-identical when nothing changed.

### Upgrade notes

- From `0.7.0-beta`: no manual migration. The schema stays at version 2, the
  browser data under `falcon:*` keys is compatible and the shipped
  `database/falcon.db` is rebuilt from the JSON catalog on the next build.
- `db:import` now removes entries that are no longer in the JSON. If a local
  database was extended by hand, move those entries into a pack JSON file first.
- To roll back, check out the previous tag, run `npm install`, `npm run build`
  and reload with the service worker reset offered by the recovery panel.
- The AI evaluation (`npm run eval:model`) is not part of the 1.0 gate; run it
  with `llama3.2:3b` installed when 1.1 is prepared.

### Known limitations

- No counsel review of the G9 documents yet; the 1.0 release carries it as an
  accepted risk recorded in `docs/roadmap/V1_READINESS.md`.
- The 1.0 gate report is `PASS_WITH_OMITTED` because the assistant evaluation is
  deferred, and the scheduled source-health workflow and the screen-reader pass
  are still open items from G2 and G4.

## [0.7.0-beta] - 2026-11-13

### Added

- 17 catalog entries so no category ships with fewer than five tools:
  Identity (GLEIF LEI Search, OFAC Sanctions Search, EU Sanctions Map,
  OpenOwnership), Open Data (UNdata, World Bank Open Data, Eurostat, Data.gov),
  Username (Namechk, social-analyzer, Instant Username Search, UserSearch.org),
  Video (yt-dlp, Watch Frame by Frame, MediaInfo) and Government (Federal
  Register, EUR-Lex). Every new entry records `last_verified`.
- `createLoader` unit coverage for the shared database open, including retry
  after a failure and reset.
- Release debug sprint log (`docs/audits/DEBUG_SPRINTS_0.7.md`) recording the
  four sprints, including the duplicate-name rollback from sprint 1.

### Changed

- Version `0.7.0-beta` across the app shell, settings, assistant, backup format
  and documentation.
- Catalog grows from 165 to 182 tools; the performance report labels the heap
  measurement by name instead of a hardcoded count.

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

