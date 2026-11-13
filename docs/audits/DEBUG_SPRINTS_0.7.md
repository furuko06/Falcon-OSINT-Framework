# Debug sprints — 0.7.0-beta

Four debug sprints ran before the 0.7 release, in this order: data integrity,
browser UI, security and recovery, then performance and the full release gates.
Each entry records what was checked, what broke and what changed as a result.

## Sprint 1 — Data integrity

**Checked:** `npm run db:validate`, import idempotency, required fields and
`last_verified` on the new entries, category counts, duplicate names.

**Found:** the first batch of additions reused eight names that already existed
in other catalog files — OpenSanctions, OCCRP Aleph, ICIJ Offshore Leaks, SEC
EDGAR and Companies House (finance.json), Sherlock and Maigret (humint.json) and
Blackbird (recon.json). The importer resolves entries by name, so those rows were
re-categorized and the counts drifted (Finance 9 → 8, Companies 15 → 11) instead
of growing the short categories.

**Fixed:** the duplicated rows were removed from the new files and replaced with
sources that were not in the catalog (OFAC Sanctions Search, EU Sanctions Map,
OpenOwnership, Federal Register, EUR-Lex, Namechk, social-analyzer, Instant
Username Search, UserSearch.org). `database/falcon.db` was restored from HEAD
before importing again so no stale row survived.

**Evidence:** `db:validate` reports all JSON valid; the import reports
`17 inserted, 0 updated, 165 unchanged`; a second run reports
`0 inserted, 0 updated, 182 unchanged`; 0 duplicate names across the catalog;
all 17 new entries carry `last_verified: 2026-11-13`; every
category has at least five tools.

## Sprint 2 — Browser UI

**Checked:** `tests/explorer-browser.mjs` against the production build, plus a
targeted check of the balanced categories.

**Found:** nothing broken. The category group in the sidebar starts collapsed by
design, so a click on a hidden category button times out until the group is
expanded.

**Evidence:** 9/9 browser checks pass — 182 cards render, the dashboard total
matches 182, search narrows to 1 result for "Sherlock", the category filter works
and there are no page errors. A second pass confirms 20 sidebar categories, with
Identity, Open Data, Username and Video at 5 and Government at 6, a Video filter
returning 5 cards and "yt-dlp" returning 1.

## Sprint 3 — Security and recovery

**Checked:** `npm run security:scan` and the database failure path in a real
browser (falcon.db aborted, service workers blocked).

**Found:** nothing broken.

**Evidence:** the secret scan covers 184 versioned files and 6 workflows with 0
potential secrets and 0 workflow findings. The recovery panel appears as an
alert, the cache reset recovers the app to 182 cards, a `localStorage` probe
survives and no uncaught page errors are logged.

## Sprint 4 — Performance and release gates

**Checked:** `npm run gates` on the production build.

**Found:** nothing broken; the real-model evaluation remains `BLOCKED` for the
same CPU-budget reason as 0.5 and 0.6.

**Evidence:** `PASS_WITH_BLOCKED`, exit 0, 117 tests. Performance: first catalog
render 710.8 ms, SQLite open 463.7 ms, retrieval p95 1.657 ms over 1,000
documents, JavaScript 66.32 KB gzip, dist 1631.62 KB, heap 4.11 MB with the full
catalog. Accessibility: 0 axe violations across 8 views, 5/5 manual checks.

## Known issues left open

- The 165 pre-0.7 catalog rows still have no `last_verified` date, so the health
  dashboard counts only the 17 dated entries. Gate G1 (catalog provenance)
  remains open rather than being backfilled with invented dates.
- The real-model assistant gate is `BLOCKED` on a 60 s CPU budget, as documented
  in `docs/audits/MODEL_EVAL.md`.
