# Falcon contracts — frozen at 1.0.0

These schemas are the public shape of everything Falcon stores or installs. They
were frozen for the 1.0 line on 2026-11-13 and stay compatible until 2.0.0.

| Schema | Covers | Stored in |
| --- | --- | --- |
| `tool.schema.json` | Catalog entry | `intelligence/**/*.json`, SQLite `tools` |
| `playbook.schema.json` | Investigation recipe | `framework/modules/playbooks/playbooks.js` |
| `playbook-state.schema.json` | Per-playbook progress | `localStorage` `falcon:playbooks` |
| `ioc.schema.json` | Indicator | `localStorage` `falcon:iocs` |
| `case.schema.json` | Investigation case (the UI calls it collection) | `localStorage` `falcon:collections`, backups |
| `plugin-manifest.schema.json` | Declarative plugin descriptor | `localStorage` `falcon:plugins` |

`contract-version.json` declares the version, the freeze window and the schema
list. `contract-lock.json` holds one SHA-256 per schema: an edit that is not
followed by a freeze fails `npm run contracts:check`, so a shape cannot change by
accident.

## Deprecation policy

- Within 1.x, changes are additive: new optional properties, new enum members,
  new schemas. Removing or renaming a property, tightening a pattern or changing
  a type requires 2.0.0.
- A deprecated property stays readable for at least one minor release and is
  marked `[deprecated since 1.x]` in its schema `description`.
- Every contract change gets a `CHANGELOG.md` entry under the release that ships
  it, naming the affected schema and the migration step.
- Removing a deprecated property is announced in the release notes one minor
  before 2.0.0 and listed in `docs/releases/`.

## Changing a contract

```bash
# edit contracts/*.schema.json and contracts/contract-version.json
npm run contracts:freeze   # regenerates contract-lock.json
npm run contracts:check    # validates catalog, playbooks, plugins, cases and IOCs
```

`npm run contracts:check` runs inside `npm run gates`; a contract that no longer
matches the shipped data fails the release.
