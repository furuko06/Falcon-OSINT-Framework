# Privacy impact assessment: notes, prompts and local data

- Scope: case notes, assistant prompts, query history and backup files
- Version: `v1.0.0`
- Related: `docs/security/THREAT_MODEL.md`,
  `docs/development/BACKUP_FORMAT.md`, `framework/modules/privacy/panel.js`

## 1. Roles

Falcon runs entirely in the analyst's browser. There is no Falcon account, no
server that receives investigation data and no telemetry. The analyst is the
**data controller** for everything they type or import; the project only ships
the tool. That is also why Falcon cannot delete, correct or recover data on
someone else's machine.

## 2. What is stored, where and for how long

| Data | Location | Contents | Retention today |
| --- | --- | --- | --- |
| Catalog | `database/falcon.db` downloaded to the origin cache | 182 public tool records | Until the browser cache is cleared |
| Favorites | `localStorage` `falcon:favorites` | Tool ids | Until cleared |
| Collections, graph, IOC, playbooks, Academy | `localStorage` `falcon:collections`, `falcon:graph`, `falcon:iocs`, `falcon:playbooks`, `falcon:academy` | Analyst-created investigation data | Until cleared |
| Assistant settings | `localStorage` `falcon:assistant` | Endpoint, model name, include-notes flag | Until cleared |
| Query history | `localStorage` `falcon:query-history` | Last **25** queries: question, notes if opted in, sources, retrieved context, exact prompt, provider, model, environment, answer | Until cleared with **Borrar historial** in Settings; no automatic expiry |
| OpenRouter session | `sessionStorage` `falcon:openrouter:session` | API key and selected model for the current tab | Deleted when the tab closes or the user disconnects |
| Policy acknowledgment | `localStorage` `falcon:privacy-ack` | Date and policy version accepted | Until cleared |
| Backup file | User-chosen file | `local_data` (all non-sensitive `falcon:` keys), `queries`, optional SQLite snapshot and checksum | Under the user's control; Falcon cannot delete it |

Case notes are not persisted by the assistant: the textarea lives in the page,
and the notes are only stored when the analyst runs a query and the history
records it — which happens only if the analyst wrote them in that query. The
include-notes checkbox controls whether those notes enter the prompt at all.

## 3. Data flows

1. **Local retrieval** — question, catalog, Academy and Playbooks stay in the
   browser. No network call.
2. **Local model** — only loopback endpoints (`localhost`, `127.0.0.1`, `::1`)
   are accepted. The prompt leaves the page and reaches a process on the same
   machine.
3. **OpenRouter** — only after OAuth PKCE and a per-query consent checkbox. The
   prompt (question, cited fragments, notes if opted in) goes to OpenRouter and
   then to the selected model under OpenRouter's terms. The key stays in
   `sessionStorage` and is excluded from backups.
4. **Backup** — written locally by the user. It can contain case notes, prompts
   and sources, so the file is sensitive evidence.

There are no analytics, no remote fonts, no error reporting service and no
automatic sync.

## 4. Risks and controls

| Risk | Likelihood | Impact | Control |
| --- | --- | --- | --- |
| Sensitive notes sent to a model by mistake | Medium | High | Notes are opt-in per query, the exact prompt is previewed before sending, and the model answer is labelled as unverified |
| Shared or stolen device exposes local data | Medium | High | No cloud sync by design; the user can clear site data; the UI states what is stored |
| Backup file leaks investigation data | Medium | High | Credentials are excluded, the file carries a warning and a checksum; encryption is the user's responsibility |
| Another script on the origin reads `localStorage` | Low | High | Strict CSP with no inline script, no third-party scripts, secret scan and dependency audit in CI |
| Prompt injection in a note or a retrieved document | Medium | Medium | Delimited notes, retrieved context marked as data, injection case in the evaluation set, model output never presented as verified fact |
| History keeps more than intended | Medium | Medium | Capped at 25 records; Settings offers **Borrar historial** with a confirmation dialog |
| Data retained by a remote provider | Low | High | Remote calls require consent and OpenRouter applies its own retention; Falcon stores no remote credentials |

## 5. Data subject rights and deletion

- **Access and portability**: the backup JSON contains the local data and the
  query history; `docs/development/BACKUP_FORMAT.md` documents the format.
- **Erasure**: clearing the site data for the Falcon origin removes the catalog
  cache, `localStorage` and `sessionStorage`. The database recovery panel can
  reset the cache without touching `localStorage`, so a recovery never deletes
  investigation data by accident.
- **Correction**: catalog corrections follow `docs/legal/TAKEDOWN.md`; notes are
  edited locally by the analyst.
- **Third parties**: a person named in an investigation must be handled under the
  applicable law. Falcon does not provide a mechanism to notify or erase data
  held by a provider the analyst queried.

## 6. Open work

- The history can be cleared from Settings (Ajustes → Historial de consultas IA
  → Borrar historial, with a confirmation dialog), but there is no per-record
  deletion and no preview of an individual record before deleting it.
- No automatic expiry for investigation data. Retention is manual by design, but
  a retention policy with an explicit prompt (for example, "records older than
  90 days") is not implemented.
- Counsel/DPIA review is pending. This assessment records the current behavior;
  it is not a legal opinion on a specific investigation.
