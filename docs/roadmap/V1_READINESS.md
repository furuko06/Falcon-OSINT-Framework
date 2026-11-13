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
| Version | `0.2.0-alpha`, tag `v0.2.0-alpha` | `package.json`, git tag |
| Catalog | 165 tools across 9 packs | `npm run db:import`, SQLite `tools` |
| Tests | 77 unit/integration tests | `npx vitest run` |
| Production build | Vite build + Pages-style preview verified | 165 cards, no 404s |
| Assistant | Local retrieval, offline briefing, note triage, optional loopback Ollama | E12 tests and browser smoke |
| External connectors | 11 providers, explicit consent, new window + prompt copy | E12 connector tests |
| Accessibility | Skip link, focus-visible, 44 px coarse targets, reduced motion | Manual browser checks |
| Secrets | Manual grep audit found no live credentials | Repository audit |
| Offline shell | Data is local, but there is no precache service worker | Gap |
| API/plugin contracts | Present but not frozen or versioned as public contracts | Gap |
| Formal audits | None (security, accessibility, performance, legal) | Gap |

The baseline is enough for an alpha. It is not enough for a compatibility
promise.

## 3. Must-pass gates

Every gate needs a reproducible artifact, not a verbal claim.

### G1. Data integrity and upgrades

- [ ] Schema version table plus forward-only migrations tested on a copy of a
      real database.
- [ ] `db:validate`, `db:import` and `db:compile` are idempotent and covered by
      tests, including duplicate names and removed tools.
- [ ] Documented backup, restore and export format (JSON + SQLite copy).
- [ ] Import refuses invalid rows without partially writing the database.
- [ ] Catalog metadata policy: provenance, last verification date and status
      for every entry.

**Current:** idempotent import and JSON validation pass; migrations, backup and
export formats are missing.

### G2. Offline and recovery

- [ ] The app shell and SQLite WASM are precached; a second load works with the
      network disabled.
- [ ] A corrupt or missing database shows a recoverable error with a reset path.
- [ ] Source-link health checks run on a schedule and never block offline use.
- [ ] Versioned cache invalidation so an upgrade does not serve stale assets.

**Current:** data is local after load, but there is no precache and no tested
cache upgrade path. This is the largest gap in the offline-first claim.

### G3. Security and privacy

- [ ] Threat model covering local data, imported files, plugins and the model
      endpoint.
- [ ] Content Security Policy compatible with SQLite WASM and the optional
      loopback model call.
- [ ] Automated secret scanning and dependency audit in CI.
- [ ] No telemetry, analytics or remote fonts by default.
- [ ] Plugin permissions enforced at runtime, not only displayed.
- [ ] Documented data retention and case deletion behavior.

**Current:** manual secret audit is clean, model calls require per-query consent
and are loopback-only, connectors never handle credentials. Runtime plugin
isolation, CSP and automated scanning are pending.

### G4. Accessibility (WCAG 2.2 AA)

- [ ] Keyboard-only pass through the catalog, assistant, connectors, Academy
      and dialogs.
- [ ] Screen-reader pass (NVDA or VoiceOver) for the same flows.
- [ ] Contrast check for text, badges, disabled states and focus rings.
- [ ] Target size at least 24×24 CSS px, 44×44 on coarse pointers.
- [ ] Reduced-motion behavior verified; no motion-only status messages.
- [ ] Automated axe scan with no serious or critical findings.

**Current:** skip link, global focus-visible, coarse-pointer targets, reduced
motion and live status are in place. No screen-reader or axe audit has run.

### G5. Performance budgets

- [ ] Measured budgets on a mid-range laptop: time to first catalog render,
      database open time, memory after 165 tools and 1,000 tools.
- [ ] Bundle and database size tracked per release; regressions fail CI.
- [ ] Assistant retrieval stays under 100 ms for a 1,000-document corpus.

**Current:** no measurements recorded. Do not claim speedups without numbers.

### G6. Stable contracts

- [ ] Versioned JSON schema for tool records, playbooks, IOCs and cases.
- [ ] Plugin manifest and permission contract frozen for one minor cycle.
- [ ] Local API (if shipped) with documented auth and error model.
- [ ] Deprecation policy and changelog entries for contract changes.

**Current:** internal shapes exist but are not frozen; the plugin engine is
declarative and partial.

### G7. AI assistant accountability

- [ ] Reproducible evaluation set with expected citations and refusal cases.
- [ ] Real Ollama run against at least two model tags, including one failure
      path (model missing, timeout, CORS).
- [ ] Answers label model output, show sources and never present uncited model
      text as verified fact.
- [ ] Prompt-injection tests for retrieved documents and notes.
- [ ] Clear boundary: no remote provider credentials, no Gmail/OAuth access.

**Current:** retrieval, citations, consent and prompt preview are tested with a
simulated model; no evaluation harness and no real model run in CI.

### G8. Release engineering and governance

- [ ] CI runs tests, build, JSON validation, link checks and secret scan.
- [ ] Reproducible Pages deployment from a clean checkout.
- [ ] Signed release notes, upgrade guide and rollback procedure.
- [ ] License metadata consistent with `LICENSE` (AGPL-3.0).
- [ ] Security disclosure, contribution and code-of-conduct paths verified.

**Current:** manual release process worked for `0.2.0-alpha`; CI coverage and
signed upgrade/rollback docs are incomplete.

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
| `0.3.0-alpha` | Hardening | G1 migrations/backup, G2 precache, G4 axe + keyboard, CI secret/dependency checks |
| `0.4.0-beta` | Contracts | G6 schemas and plugin permissions frozen as beta, G5 budgets measured |
| `0.5.0-beta` | Trust | G3 threat model/CSP, G7 evaluation harness and real model run, G9 review started |
| `0.9.0-rc` | Freeze | All must gates green, docs and upgrade/rollback guides complete, no open criticals |
| `1.0.0` | Promise | Sign-off on every gate, tagged release, published compatibility statement |

Each milestone keeps the previous contracts working; a gate can move later, but
it cannot be silently dropped. If a gate fails at `0.9.0-rc`, the release becomes
`0.9.x` until it passes.

## 5. Main risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Browser SQLite growth or corruption | Loss of workspace | Backup/export, integrity check, migration tests |
| Link rot in 165+ sources | Stale investigations | Scheduled health checks, last-verified dates |
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
