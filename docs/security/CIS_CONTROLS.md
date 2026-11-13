# CIS Controls Alignment for a Public Repository

Falcon is a static, client-side application. This document maps the CIS Critical
Security Controls v8.1 to controls that can be enforced in the repository and
separates them from settings that only the repository owner can enable in
GitHub. It is an alignment record, not a certification or a claim of full CIS
compliance.

## Scope

- Public source repository and GitHub Actions.
- Browser application, build pipeline and release artifacts.
- No Falcon backend, user accounts, telemetry or server-side database.

## Implemented in this repository

| CIS control | Repository control | Evidence |
| --- | --- | --- |
| 1. Inventory of assets | Locked dependency graph and generated database input | `package-lock.json`, `database/falcon.db`, `intelligence/` |
| 2. Inventory of software | Dependabot for npm and GitHub Actions; pinned action commits | `.github/dependabot.yml`, `.github/workflows/*.yml` |
| 3. Data protection | No credentials in source; CSP; backup excludes keys; sensitive-backup guidance | `index.html`, `public/_headers`, `framework/modules/settings/backup.js`, `docs/development/BACKUP_FORMAT.md` |
| 4. Secure configuration | CSP with no inline script/style, `object-src 'none'`, frame denial where headers are available, least-privilege workflow permissions | `index.html`, `public/_headers`, `.github/workflows/` |
| 6. Access control | CODEOWNERS, read-only workflow defaults, no long-lived deploy keys | `.github/CODEOWNERS`, workflows |
| 7. Vulnerability management | `npm audit`, Dependabot, CodeQL, secret scan, dependency review | `.github/workflows/security.yml`, `.github/workflows/codeql.yml`, `scripts/security-scan.mjs` |
| 8. Audit logs | Git history, changelog and GitHub audit log | `CHANGELOG.md`, repository settings |
| 10. Malware defenses | Lockfile, dependency review, no remote executable scripts from the app | `package-lock.json`, security workflow |
| 11. Data recovery | Local JSON backup, SQLite snapshot with SHA-256, migration tests | `docs/development/BACKUP_FORMAT.md`, `tests/migrations.test.js` |
| 12. Network controls | Static app; `connect-src` limited to self, loopback Ollama and OpenRouter | `index.html`, `public/_headers` |
| 13. Monitoring | No telemetry; provider-side usage remains with the provider | Privacy panel, `SECURITY.md` |
| 14. Awareness | Security policy, contribution rules and privacy boundaries | `SECURITY.md`, `CONTRIBUTING.md`, `docs/security/` |
| 15. Service providers | GitHub and OpenRouter are documented as external providers with their own terms | `README.md`, privacy panel, `SECURITY.md` |
| 16. Application security | Escaped dynamic output, CSP, unit/integration tests, formal a11y audit, CodeQL | `tests/`, `docs/audits/A11Y_AUDIT.md`, `.github/workflows/codeql.yml` |
| 17. Incident response | Private vulnerability reporting and response targets | `SECURITY.md` |

## Owner actions required in GitHub

These controls cannot be committed as files. They must be enabled in the public
repository settings; see [`GITHUB_HARDENING.md`](GITHUB_HARDENING.md).

- Require MFA for the organization and all maintainers.
- Protect `main` and release branches: pull request, review, status checks,
  signed commits, linear history, no force-push, no deletion.
- Enable secret scanning and push protection.
- Enable Code scanning/CodeQL and Dependabot alerts and security updates.
- Enable private vulnerability reporting.
- Restrict GitHub Pages to the expected branch and Actions deployment.
- Require approval for the `github-pages` environment.
- Review repository access at least quarterly and remove stale collaborators.
- Enable the organization audit log export where the plan supports it.

## Gaps and road map

| Gap | Risk | Next step |
| --- | --- | --- |
| No external penetration test | Unknown implementation flaws | Annual test before 1.0 |
| GitHub Pages ignores `_headers` | Header-based controls depend on host | Use a host that honors `_headers` or keep the meta CSP as baseline |
| No signed releases | Artifact provenance is weaker | Add Sigstore/`npm provenance` when packaging is introduced |
| No SBOM artifact published | Inventory outside the lockfile is manual | Generate CycloneDX SBOM in CI |
| No formal threat model review | Controls may miss abuse cases | Complete before 0.5 beta |

## Verification commands

```bash
npm ci
npm run db:validate
npx vitest run
npm run build
npm run security:scan
npm audit --omit=dev --audit-level=high
npm run a11y
```

The security scan and audit must exit zero. The a11y command requires a built
`dist/` and a running preview server.
