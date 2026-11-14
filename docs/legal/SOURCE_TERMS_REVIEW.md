# Source terms review

- Scope: the 182 catalog entries in `intelligence/tools` and `intelligence/countries`
- Data source: `docs/audits/SOURCE_HEALTH.md` (check of 2026-11-13)
- Applies to: `v1.0.0`

## 1. What Falcon does with a source

Falcon is a **link-only catalog**. A card shows the name, category, description
and status of a tool and links to the provider's own page. The interface never
downloads, scrapes or republishes provider content:

| Action | Where it happens | Network |
| --- | --- | --- |
| Download the local catalog | `framework/database/database.js` | Only `database/falcon.db` from the app origin |
| Open a provider | The analyst clicks the card | The user's browser, to the provider |
| Link health check | `intelligence/build/check-links.mjs`, build time only | One `HEAD` request per URL |
| Model query | `framework/modules/assistant/assistant.js`, `openrouter.js` | Loopback Ollama or OpenRouter, only with per-query consent |

No tool in the catalog shares credentials with Falcon, and Falcon has no field
for a provider API key. There is no proxy, no rotating user agent, no headless
browsing of providers and no bypass of authentication, paywalls, CAPTCHAs or
rate limits.

## 2. How the link check handles a refusal

The health check counts a source as `restricted` when the host answers 4xx
(except 404/410): it responded, but refused the automated client. That is a
statement about **automatic access**, not about the license or the legality of
the source.

- One request per URL with a browser user agent, one retry on 5xx or network
  error, then it stops. A 403 is not retried with another identity.
- Only public `http(s)` hosts are fetched. Loopback, private ranges, link-local,
  CGNAT, IPv6 local ranges and URLs with userinfo are refused before any request,
  so catalog data cannot turn the checker into an SSRF probe.
- Nothing from the response body is stored: only status, error class and date.

## 3. Entries that reject automated clients

Measured in `SOURCE_HEALTH.md`; all of them stay as manual links, none is
automated.

| Entry | Category | HTTP | Access class observed | Decision |
| --- | --- | --- | --- | --- |
| Wikidata Query Service | Data & Analysis | 403 | Anti-bot / requires interactive client | Keep as manual link |
| Blockchain.com Explorer | Finance | 403 | Anti-bot | Keep as manual link |
| ImportYeti | Companies | 403 | Anti-bot, account-gated features | Keep as manual link |
| OpenSecrets | Finance | 403 | Anti-bot | Keep as manual link |
| Mapillary | GEOINT | 400 | Rejects the automated request | Keep as manual link |
| EUR-Lex | Government | 403 | Anti-bot | Keep as manual link |
| Emailrep | Email | 400 | API requires a key; UI rejects the probe | Keep as manual link |
| Censys | Infrastructure | 403 | Account / API key required | Keep as manual link |
| SecurityTrails | Domains | 403 | Account / API key required | Keep as manual link |
| AbuseIPDB | Infrastructure | 403 | Account / API key required | Keep as manual link |
| Flightradar24 | Monitoring | 403 | Account-gated features | Keep as manual link |
| MarineTraffic | Monitoring | 403 | Account-gated features | Keep as manual link |
| ReliefWeb | Monitoring | 406 | Rejects the automated request | Keep as manual link |
| HDX | Monitoring | 406 | Rejects the automated request | Keep as manual link |
| DeHashed | Email | 403 | Paid account required | Keep as manual link |
| Epieos | Email | 403 | Account and quota required | Keep as manual link |
| Instant Username Search | Username | 403 | Anti-bot | Keep as manual link |
| Namechk | Username | 403 | Anti-bot | Keep as manual link |

Entries whose public page no longer exists are not silently deleted either:

| Entry | State | Reason | Decision |
| --- | --- | --- | --- |
| OXT | `broken` | Network error | Kept with `broken` status and a health warning |
| archive.today | `broken` | Network error (CAPTCHA/interstitial) | Kept with `broken` status and a health warning |
| Twint | `deprecated` | Project abandoned after platform API changes | Kept as historical reference, marked deprecated |
| Telepathy, Social Analyzer | `unchecked` | No public URL | Listed without a link, marked unchecked |

## 4. Rules for adding or changing an entry

1. The entry must be reachable without bypassing authentication or a paywall.
   An entry whose only access is a shared credential, a leaked key or a
   circumvention technique is not accepted.
2. The description states what the source is for, not how to evade its limits.
3. `last_verified` and `status` are mandatory; `npm run db:provenance` fails the
   release otherwise.
4. Sources known to forbid third-party automated access stay as manual links and
   are not wired into the assistant's retrieval or into any crawler.
5. A provider that changes its terms can request a correction or removal through
   `docs/legal/TAKEDOWN.md`.

## 5. Known limits and open work

- The review is behavioral: it verifies what Falcon does and how the hosts
  respond to an automated check. It is not a clause-by-clause reading of 182
  third-party terms, and it does not conclude that every listed use is permitted
  in every jurisdiction.
- Counsel review is pending. Until then, the analyst is responsible for checking
  the terms of the provider they use and for the lawfulness of the query itself.
- `status: restricted` describes automated access. A source can be perfectly
  public for a human and still reject a script; the catalog says so in the card
  instead of hiding it.
