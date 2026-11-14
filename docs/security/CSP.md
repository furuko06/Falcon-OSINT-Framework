# Content Security Policy

Falcon ships a strict CSP in the document head and a defense-in-depth `_headers`
file for static hosts that support response headers (GitHub Pages does not).

## Policy

```text
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
script-src-attr 'none';
style-src 'self';
style-src-attr 'none';
img-src 'self' data:;
font-src 'self';
connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* https://openrouter.ai;
worker-src 'self';
manifest-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-src 'none';
```

The header version additionally sets `frame-ancestors 'none'`, HSTS,
Permissions-Policy, Referrer-Policy, COOP/CORP and `X-Content-Type-Options`.

## Why each exception exists

| Directive | Reason |
| --- | --- |
| `'wasm-unsafe-eval'` | sql.js instantiates WebAssembly for the local SQLite database. It does not allow JavaScript `eval`. |
| `http://localhost:*`, `http://127.0.0.1:*` | Optional Ollama endpoint on loopback. IPv6 literals are not valid CSP host sources in current Chromium, so use `localhost` or `127.0.0.1` if CSP is enforced. |
| `https://openrouter.ai` | User-initiated OAuth exchange, model list and chat completion. No other remote origin is allowed. |
| `img-src data:` | Reserved for local icon/data images; no remote tracking pixels. |
| `style-src 'self'` | The shell stylesheet is external and dynamic UI state uses classes/native elements, not inline styles. |

## Rules for contributors

- Do not add inline `<style>` blocks or `style="..."` attributes.
- Do not add inline event handlers (`onclick`, `onerror`, etc.).
- Do not add remote scripts, fonts, analytics or tracking pixels.
- Add a new `connect-src` origin only with a documented, user-initiated feature
  and a privacy review.
- Update the meta policy, `public/_headers`, this document and the CSP test
  together.

## Verification

```bash
npm run build
npm run preview -- --port 4173 --strictPort
npm run a11y
```

The browser smoke test must show zero `Content Security Policy` messages. The
automated a11y runner also injects axe through the browser runtime so the policy
is active during the audit.

## Known limitation

`frame-ancestors` and `report-uri` are ignored when delivered through a `<meta>`
tag. GitHub Pages cannot set custom response headers, so clickjacking protection
via headers depends on the hosting provider. The `public/_headers` file is ready
for a host that honors it.
