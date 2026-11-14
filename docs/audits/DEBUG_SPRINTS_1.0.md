# Debug sprints — 1.0.0

Three debug sprints ran after the 1.0.0 tag, without the AI evaluation suites.
Each entry records what was checked, what broke and what changed as a result.

## Sprint 1 — Data and link integrity

**Checked:** `npm run db:validate`, two consecutive `npm run db:import` runs,
`npm run db:compile`, `npm run db:provenance`, a field-by-field comparison of the
182 JSON entries against `database/falcon.db` (name, `status`, `last_verified`)
and the non-AI unit suite (114 tests in 17 files).

**Found:** `npm run db:links` classified every 4xx as broken and exited 1. The
catalog policy is the opposite: a 4xx that is not 404/410 means the host is alive
and refused the automated client, which `verify-sources.mjs` records as
`restricted`. The 18 sources that answer 403/400/406 by design would have turned a
routine link check into a red command, and `checkUrl` returned no state that
allowed telling them apart.

**Fixed:** `check-links.mjs` now shares the status policy with the provenance
check (`classifyStatus`), `checkUrl` returns `state` (`verified`/`restricted`/
`broken`), the CLI prints `ok/restricted/broken`, and only link rot exits
non-zero. `tests/check-links.test.js` covers 403 and 429 as restricted, 404/410/500
as broken.

**Evidence:** catalog JSON and SQLite agree on 182/182 entries with 0 differences;
`db:import` reports `0 inserted, 0 updated, 182 unchanged, 0 removed` and the file
is byte-identical across runs; `db:compile` reports 15 categories and 6 Argentina
entries; provenance is complete; 114/114 non-AI tests pass.

## Sprint 2 — Browser UI

**Checked:** the production build in headless Chrome through the new
`tests/settings-browser.mjs`: seed one query-history record, open **Ajustes**,
read the card, click **Borrar historial**, confirm the dialog, and verify the
stored key, the count, the disabled state, the service-worker version and the
console.

**Found:** the flow itself works — the count updates, `falcon:query-history` is
removed and the button disables. What was wrong was the documentation: the G9
privacy assessment and index claimed there was no deletion control, which would
have sent a reader looking for a missing feature.

**Fixed:** the privacy assessment and `docs/legal/README.md` now describe the
shipped control and the real gaps (no per-record deletion, no automatic expiry).
`tests/settings-browser.mjs` stays as the regression check for the flow.

**Evidence:** 7/7 checks pass, including `service worker is built for 1.0.0` and
`no page errors`.

## Sprint 3 — Release consistency

**Checked:** version in `package.json`, lockfile, app shell, settings, assistant,
README and backup format; the `v1.0.0` tag and its target commit; relative links
across the root and `docs/` markdown; `npm audit`; the security scan including the
new workflow; and `npm run gates -- --skip-ai --skip-browser`.

**Found:** two reporting problems. `--skip-browser` labelled its rows "omitido"
but pushed them as failures, so an explicit skip produced `FAIL`; the same run
also exposed that the README still presented the assistant evaluation as part of
every gate run and did not mention the new weekly source-health workflow.
Separately, the security scan only sees tracked files, so the new workflow had to
be staged before it was covered.

**Fixed:** `quality-gates.mjs` reports an explicit `--skip-browser` as `OMITIDO`
and the global state as `PASS_WITH_OMITTED`, matching `--skip-ai`; the README
documents `--skip-ai`, the omitted-state contract and the scheduled workflow; the
workflow uses only actions already pinned to commit SHAs and read-only
permissions.

**Evidence:** `npm run gates -- --skip-ai --skip-browser` ends in
`PASS_WITH_OMITTED` with 6 PASS and 4 OMITIDO rows; `npm audit` reports 0
vulnerabilities; 0 broken relative links in the documentation; version `1.0.0` in
every declared location; tag `v1.0.0` points at `1609e61`.
