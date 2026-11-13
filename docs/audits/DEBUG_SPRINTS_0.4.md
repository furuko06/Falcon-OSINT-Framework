# 0.4 Debug Sprints

Three focused debug sprints were run before the 0.4 push. The results below are
reproducible from the commands in each section.

## Sprint 1 — CSP and supply chain

Findings:

- The initial strict CSP was blocked by inline `style` attributes in the tool
  cards and the app-shell `<style>` block.
- A CSP `connect-src` entry for an IPv6 literal (`http://[::1]:11434`) is rejected
  by Chromium as an invalid source.
- `node_modules/` was tracked in Git: 3,015 files including executables and ZIPs.
- `npm audit` reported 5 vulnerabilities: 2 critical (tinypool/vitest), 2 high
  (vite/source-map-js) and 1 moderate (@vitest/mocker).
- `build.yml` lacked top-level permissions and `pages.yml` still used a tag for
  one action.

Fixes:

- Moved shell CSS to `framework/styles/shell.css`; cards use status classes and
  native `<progress>` instead of inline styles.
- Removed the invalid IPv6 CSP source. `localhost` and `127.0.0.1` remain allowed
  for Ollama; the limitation is documented in `docs/security/CSP.md`.
- Untracked `node_modules/` (kept locally, ignored by Git).
- Upgraded Vite and Vitest; `npm audit` is clean.
- Pinned all Actions to full SHAs, added top-level `permissions`, disabled
  persisted checkout credentials, and added a workflow/secret scanner.

Verification:

```bash
npm run security:scan
npm audit --audit-level=high
npm run build
```

## Sprint 2 — Accessibility

Initial axe run: **2 violations / 41 nodes**.

- `color-contrast`: `.tor` badge at 3.71:1 (needs 4.5:1).
- `target-size`: 40 academy radio inputs at 13×13 px with 22 px spacing.

Fixes:

- Lightened the TOR badge to `#C4B5FD`.
- Set academy radios to 24×24 px and increased row spacing.

A false negative in the skip-link check was also found: the test checked
visibility after pressing Enter, when focus had already moved to `main`. The
check now evaluates visibility while the skip link is focused.

Final result: **0 axe violations across 8 views**, **5/5 manual checks**
(skip link, focus transfer, reduced motion, 44 px mobile targets). The full
report is `docs/audits/A11Y_AUDIT.md`.

## Sprint 3 — Regression, offline and mobile

Exercised in both dev and production builds:

- 165 tools, SQLite schema 2, `Database Version` = 2.
- No CSP console violations in dev or production.
- OpenRouter endpoint allowed by CSP; fake-key test returns a controlled 401.
- Backup exports version `0.4.0-beta`, schema 2 and no credentials.
- Privacy and settings panels render.
- Skip link is first in tab order and moves focus to `#main-content`.
- Service worker controls the page and offline reload keeps 165 tools.
- Mobile 390×844: no horizontal overflow; visible action targets ≥44 px.
- New regression test `tests/security.test.js` covers CSP, headers, pinned
  Actions and security automation.

No new product defects were found in this sprint. Remaining external limits:
no paid OpenRouter model call, no real screen-reader pass, and no GitHub UI
settings can be applied from the repository.

## Final verification

```text
Tests: 98 passed (15 files)
Axe: 0 violations (8 views)
Manual a11y: 5/5
Security scan: 0 secrets, 0 unpinned Actions, 0 missing permissions
npm audit: 0 vulnerabilities
Offline: 165 tools, schema 2
```
