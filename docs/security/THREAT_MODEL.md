# Threat Model

Scope: Falcon OSINT Framework `0.6.0-beta`, the static browser application and
the local files it produces. This document records the assets, trust boundaries
and threats behind gate **G3** of `docs/roadmap/V1_READINESS.md`. It describes
what the code enforces today; anything listed as a gap is **not** a control and
must not be presented as one.

## 1. Assets

| Asset | Where it lives | Why it matters |
| --- | --- | --- |
| Catalog database | `falcon.db` fetched from the app origin at boot, exported in backups | Data integrity of every investigation; a tampered copy feeds false sources |
| Analyst workspace | `localStorage` keys `falcon:*` (favorites, collections, IOC, notes, assistant history, settings) | Case notes and prompts can identify people, targets and methods |
| Query history | `falcon:query-history` in `localStorage` | Stores the exact prompt, retrieved context, sources and environment |
| Model credentials | `sessionStorage` `falcon:openrouter:session` (PKCE verifier and key) | A leaked key bills the user's account and exposes provider access |
| Backup files | JSON downloaded and later re-imported by the user | Contains the database copy, notes and prompts; usually leaves the machine |
| App shell and caches | Service worker Cache Storage, versioned `falcon-<version>-*` | A poisoned or stale shell can run the wrong code offline |

## 2. Trust boundaries

1. **Origin → browser**: only same-origin scripts and styles run. CSP in
   `index.html` (plus `public/_headers` where the host honours headers) blocks
   inline script/style, `object-src`, frames and foreign connections.
2. **Browser → loopback model**: `connect-src` allows `http://localhost:*` and
   `http://127.0.0.1:*` only. Every call needs an explicit `allowNetwork: true`
   and a per-request consent checkbox.
3. **Browser → OpenRouter**: `https://openrouter.ai` is the only remote origin
   allowed. OAuth uses PKCE; the key never touches `localStorage`, backups or
   logs.
4. **User → imported files**: backups and plugin manifests are untrusted input
   parsed in the page.
5. **Catalog sources → analyst**: catalog entries and links point outwards;
   Falcon never fetches them automatically at runtime.

## 3. Threats and controls

| # | Threat | Impact | Control in code | Status |
| --- | --- | --- | --- | --- |
| T1 | Script injection through catalog fields, plugin metadata or assistant answers | Theft of the OpenRouter key and workspace data | Strict CSP without inline script; every render path escapes with `esc()`; plugin output is declarative HTML built from validated manifests | Partial: no automated XSS corpus for every panel |
| T2 | Malicious or corrupt backup overwrites local data | Workspace loss or planted case data | `parseBackup` validates format and `format_version`, only string values under `falcon:` keys are restored, keys matching `openrouter\|authorization\|api[-_]?key\|token\|secret\|password` are skipped, the SHA-256 of the SQLite copy is recorded | Partial: per-key value schemas are not validated |
| T3 | Plugin declares permissions it never gets enforced | Local data exposure once executable plugins land | Manifests are validated against a fixed permission list, the caller must pass exactly the permissions the user approved, and the UI shows the list | **Gap**: permissions are declared and displayed, not enforced at runtime. The engine is declarative today, which limits, but does not remove, the risk |
| T4 | Key exfiltration by a compromised dependency | Provider account abuse | Key kept in `sessionStorage` for the tab, excluded from backups, never logged; dependency audit and CodeQL in CI | Partial: supply chain is monitored, not sandboxed |
| T5 | Prompt injection through notes, catalog text or a retrieved document | Misleading answers presented as fact, attempts to exfiltrate the prompt | Retrieved text is truncated and passed as context, never as instructions; answers carry the provider and model label plus the retrieved sources; the evaluation set includes an injection case | Partial: only offline fixtures plus a real-model attempt, no live red-team pass |
| T6 | Uncited model text treated as verified | Analyst acts on a hallucination | Offline evaluation fails answers without citations; the UI asks the analyst to verify each citation and records provider/model | Partial: citation rate is measured, not enforced on the model output |
| T7 | Shared-machine disclosure of case data | Third-party reads notes or history | Data stays in the browser profile; no analytics, telemetry or remote fonts; retention is described in the privacy panel | Accepted risk: no encryption at rest, documented for the user |
| T8 | Stale or poisoned service worker shell | Running old or wrong code offline | Cache name is versioned per build, registrations update on load, recovery panel deletes caches and unregisters the worker without touching `localStorage` | Partial: no signed asset manifest |
| T9 | Catalog provenance and terms violations | Legal exposure, unreliable sources | Provenance fields (`source`, `last_verified`, `status`) and a health engine; no authentication or paywall bypass | Partial: legal review is still gate G9 |

## 4. Out of scope

- Multi-user sync, hosted accounts and remote collaboration (deferred in the
  roadmap).
- Autonomy: the assistant cannot call tools, write files or act on the network
  without the analyst pressing a button.
- Compromised operating system, browser extensions or a hostile local user with
  access to the browser profile.
- Provider-side retention policies of Ollama or OpenRouter; the user chooses the
  provider and accepts its terms.

## 5. Residual risks accepted for 0.6

- Local data is readable by anyone with access to the browser profile; Falcon
  recommends a dedicated profile or machine for sensitive work.
- Plugin permissions are informational until the runtime enforces them.
- A malicious catalog entry can still mislead an analyst; the health engine and
  last-verified dates reduce, but do not remove, that risk.

## 6. Maintenance

Review this model when any of the following changes: CSP directives, storage
keys, backup format, plugin permission list, model endpoints, or the release of
the first executable plugin. Each release artifact must cite the evidence for
every control claimed here; unproven controls move to the gap list instead.
