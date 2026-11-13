# Falcon 1.0 Readiness

Status: planning document for `0.2.0-alpha`. Falcon is **not** 1.0-ready today.
This document defines the gates that must pass before the version number moves
to `1.0.0`, the evidence required for each gate, and the sequence to get there.

## 1. What 1.0 means

A 1.0 release is a compatibility promise, not a feature count. For Falcon it
means an analyst can:

1. Install or open Falcon and work with the full catalog without a network.
2. Upgrade without losing local cases, notes, favorites or settings.
3. Export evidence and import it on another machine with documented formats.
4. Rely on stable data, plugin and API contracts for at least one minor cycle.
5. Use the interface with a keyboard and a screen reader at WCAG 2.2 AA.
6. Understand what leaves the browser, what the assistant can and cannot do,
   and where provider terms apply.
7. Recover from a corrupt database, a blocked model endpoint or a dead source
   link without losing the rest of the workspace.

Anything that cannot meet those promises stays behind a beta label.

## 2. Current baseline (2026-11-13)

| Area | Current state | Evidence |
| --- | --- | --- |
| Version | `0.7.0-beta` | `package.json` |
| Catalog | 182 tools across 9 packs | `npm run db:import`, SQLite `tools` |
| Schema | Version 2 with recorded migrations; legacy empty metadata repaired | `tests/migrations.test.js`, `database/falcon.db` |
| Tests | 117 unit/integration tests | `npx vitest run` |
| Production build | Vite build prepares DB, WASM and service worker | 182 cards, no 404s |
| Offline shell | Precache verified with the browser network disabled | `tests` + browser smoke |
| Assistant | Local retrieval, Ollama option, OpenRouter OAuth PKCE and query test | `tests/openrouter.test.js`, browser smoke |
| Query audit | Environment, exact context, sources and prompt kept in local history | `tests/context-backup.test.js` |
| Backup | JSON with SQLite checksum and query context; credentials excluded | `docs/development/BACKUP_FORMAT.md` |
| Policies | Privacy panel and recorded acknowledgment | Browser smoke |
| CSP | Strict policy, no inline script/style, loopback + OpenRouter allowlist | `index.html`, `public/_headers`, `tests/security.test.js` |
| Accessibility | axe 0 violations across 8 views and 5/5 manual checks | `docs/audits/A11Y_AUDIT.md` |
| Repository security | Secret/workflow scan, audit 0, pinned Actions, CodeQL and Dependabot | `docs/security/CIS_CONTROLS.md` |
| Performance | Budgets measured on the production build and a 1,000-document corpus | `docs/audits/PERF_REPORT.md`, `npm run perf` |
| AI evaluation | 11-case offline suite passes; real-model run reports `BLOCKED` with the provider error instead of a false quality failure | `docs/audits/MODEL_EVAL.md`, `npm run eval:model` |
| Database recovery | A failed download, corrupt file or failed migration shows a recoverable panel with retry and cache reset that never deletes local data | `tests/database-recovery.test.js` |
| Threat model | Assets, trust boundaries and threats for local data, imported files, plugins and model endpoints, with controls and accepted risks | `docs/security/THREAT_MODEL.md` |
| API/plugin contracts | Present but not frozen or versioned as public contracts | Gap |
| Formal audits | Accessibility and CIS alignment delivered; external security, performance and legal audits pending | Gap |

The baseline is enough for an alpha. It is not enough for a compatibility
promise.

## 3. Must-pass gates

Every gate needs a reproducible artifact, not a verbal claim.

### G1. Data integrity and upgrades

- [x] Schema version table plus forward-only migrations tested on a copy of a
      real database.
- [ ] `db:validate`, `db:import` and `db:compile` are idempotent and covered by
      tests, including duplicate names and removed tools.
- [x] Documented backup, restore and export format (JSON + SQLite copy).
- [ ] Import refuses invalid rows without partially writing the database.
- [ ] Catalog metadata policy: provenance, last verification date and status
      for every entry.

**Current:** migrations, legacy metadata repair and documented backup/restore
are delivered. The 17 entries added in 0.7 carry `last_verified`; the older 165
still have no verification date, so the health dashboard only counts the dated
ones. Invalid-row atomicity and full catalog provenance remain open.

### G2. Offline and recovery

- [x] The app shell and SQLite WASM are precached; a second load works with the
      network disabled.
- [x] A corrupt or missing database shows a recoverable error with a reset path.
- [ ] Source-link health checks run on a schedule and never block offline use.
- [x] Versioned cache invalidation so an upgrade does not serve stale assets.

**Current:** the browser passed an offline reload with 182 tools and schema 2.
A failed download, corrupt file or failed migration now renders a recoverable
panel (retry plus cache/service-worker reset that preserves `localStorage`) and
is covered by `tests/database-recovery.test.js`. Scheduled link checks that never
block offline use are still missing.

### G3. Security and privacy

- [x] Threat model covering local data, imported files, plugins and the model
      endpoint.
- [x] Content Security Policy compatible with SQLite WASM and the optional
      loopback model call.
- [x] Automated secret scanning and dependency audit in CI.
- [x] No telemetry, analytics or remote fonts by default.
- [ ] Plugin permissions enforced at runtime, not only displayed.
- [ ] Documented data retention and case deletion behavior.

**Current:** CSP, secret scanning, dependency audit and credential exclusions
are delivered; model calls require consent and OAuth keys stay in
`sessionStorage`. The G3 threat model is documented in
`docs/security/THREAT_MODEL.md` with each control marked partial, delivered or a
gap. Runtime plugin isolation and the retention policy remain open.

### G4. Accessibility (WCAG 2.2 AA)

- [x] Keyboard-only pass through the catalog, assistant, connectors, Academy
      and dialogs.
- [ ] Screen-reader pass (NVDA or VoiceOver) for the same flows.
- [x] Contrast check for text, badges, disabled states and focus rings.
- [x] Target size at least 24×24 CSS px, 44×44 on coarse pointers.
- [x] Reduced-motion behavior verified; no motion-only status messages.
- [x] Automated axe scan with no serious or critical findings.

**Current:** axe reports 0 violations across 8 views and the manual suite passes
5/5 (skip link, focus transfer, reduced motion, mobile targets). A real
screen-reader pass is still required.

### G5. Performance budgets

- [ ] Measured budgets on a mid-range laptop: time to first catalog render,
      database open time, memory after the full catalog and 1,000 tools.
- [x] Bundle and database size tracked per release; regressions fail CI.
- [x] Assistant retrieval stays under 100 ms for a 1,000-document corpus.

**Current:** `npm run gates` measures catalog render, database open, bundle,
CSS and `dist` size, heap with the full catalog and retrieval over 1,000 documents on
every release. Heap with 1,000 tools is still unmeasured.

### G6. Stable contracts

- [ ] Versioned JSON schema for tool records, playbooks, IOCs and cases.
- [ ] Plugin manifest and permission contract frozen for one minor cycle.
- [ ] Local API (if shipped) with documented auth and error model.
- [ ] Deprecation policy and changelog entries for contract changes.

**Current:** internal shapes exist but are not frozen; the plugin engine is
declarative and partial.

### G7. AI assistant accountability

- [x] Reproducible evaluation set with expected citations and refusal cases.
- [ ] Real Ollama run against at least two model tags, including one failure
      path (model missing, timeout, CORS).
- [ ] Answers label model output, show sources and never present uncited model
      text as verified fact.
- [ ] Prompt-injection tests for retrieved documents and notes.
- [x] Clear boundary: OAuth only through OpenRouter, keys session-only, no Gmail access.

**Current:** retrieval, citations, consent, prompt preview, PKCE and the
evaluation harness are covered. The browser exercised a real 401 from OpenRouter
with a fake key. A real Ollama run against two small tags was attempted: the
provider answered, but the models completed only part of the suite within the
time budget and cited at 0.286, so the gate stays open. A billed model run and a
full real-model pass are still pending. No remote credentials are stored by
Falcon.

### G8. Release engineering and governance

- [x] CI runs tests, build, JSON validation, secret scan and dependency audit.
- [x] Reproducible Pages deployment from a clean checkout.
- [ ] Signed release notes, upgrade guide and rollback procedure.
- [x] License metadata consistent with `LICENSE` (AGPL-3.0).
- [x] Security disclosure, contribution and code-of-conduct paths verified.

**Current:** CI, Pages, license metadata and disclosure paths are in place.
Signed release artifacts and the upgrade/rollback guide are still missing.

### G9. Legal and ethical review

- [ ] Source terms review for scraped or login-gated providers; no bypassing
      authentication or paywalls.
- [ ] Privacy impact assessment for case notes and assistant prompts.
- [ ] Jurisdiction and lawful-use guidance reviewed by counsel.
- [ ] Takedown and correction path for catalog entries.

**Current:** OPSEC guidance exists; no formal legal review.

## 4. Sequence to 1.0

| Milestone | Focus | Exit criteria |
| --- | --- | --- |
| `0.3.0-alpha` | Hardening | Delivered G1 migrations/backup and G2 precache |
| `0.4.0-beta` | Contracts and assurance | CSP, formal axe/keyboard audit, CIS repo controls and pinned CI delivered; G5 budgets and G6 frozen schemas remain |
| `0.4.0-beta` | Contracts | G6 schemas and plugin permissions frozen as beta, G5 budgets measured |
| `0.5.0-beta` | Trust | G3 threat model/CSP, G7 evaluation harness and real model run, G9 review started |
| `0.6.0-beta` | Recovery and trust | G2 corrupt-database recovery and G3 threat model delivered; runtime plugin enforcement and data retention remain |
| `0.7.0-beta` | Catalog balance | Every category has at least five verified tools (182 total); no category depends on a single source |
| `0.9.0-rc` | Freeze | All must gates green, docs and upgrade/rollback guides complete, no open criticals |
| `1.0.0` | Promise | Sign-off on every gate, tagged release, published compatibility statement |

Each milestone keeps the previous contracts working; a gate can move later, but
it cannot be silently dropped. If a gate fails at `0.9.0-rc`, the release becomes
`0.9.x` until it passes.

## 5. Main risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Browser SQLite growth or corruption | Loss of workspace | Backup/export, integrity check, migration tests |
| Link rot in 182+ sources | Stale investigations | Scheduled health checks, last-verified dates |
| Plugin permissions are cosmetic | Local data exposure | Runtime enforcement, capability tests |
| Local model hallucination | False confidence | Citations, refusal cases, model badges, evaluation set |
| Scope creep before 1.0 | Delay and unstable contracts | Gate-based roadmap, freeze dates, no new packs without provenance |
| Legal exposure from source terms | Repository or user risk | Terms review, no auth bypass, takedown path |

## 6. What is explicitly deferred

- Multi-user sync, cloud accounts and remote collaboration.
- Autonomous agents that act without per-action approval.
- Hosted model APIs or provider API keys inside Falcon.
- Desktop packaging and auto-updates.
- Full localization beyond Spanish.

Deferred does not mean rejected; it means not part of the 1.0 promise.

## 7. 1.0 release checklist

- [ ] All must gates green with linked evidence.
- [ ] `CHANGELOG.md` has a dated `1.0.0` section and upgrade notes.
- [ ] Version bumped in `package.json`, `package-lock.json`, app shell and docs.
- [ ] Fresh-clone build, test, import and browser smoke pass.
- [ ] Pages deployment verified with network disabled after first load.
- [ ] Backup from `0.9.x` restored on `1.0.0` without data loss.
- [ ] Security, accessibility and legal sign-offs recorded.
- [ ] Tag `v1.0.0` and publish release notes.

Until then, Falcon remains an alpha: useful for local investigation work, not a
guaranteed long-term storage or compatibility platform.
