# Falcon Backup Format

Falcon exports a single JSON file from **Ajustes y backup**. The format is
versioned so a future importer can migrate old files.

## Envelope

```json
{
  "format": "falcon-backup",
  "format_version": 1,
  "created_at": "2026-11-13T12:00:00.000Z",
  "app": {
    "name": "Falcon OSINT Framework",
    "version": "0.6.0-beta",
    "schema_version": 2
  },
  "environment": {},
  "database": {},
  "local_data": {},
  "queries": [],
  "warnings": []
}
```

## Sections

| Field | Contents |
| --- | --- |
| `environment` | Origin, path, timezone, locale, languages, platform, user agent, online state and screen size at export time. |
| `database` | `falcon.db` snapshot as base64, byte length and SHA-256 checksum. `null` if SQLite was unavailable. |
| `local_data` | Raw `falcon:*` values from `localStorage`, excluding query history and credential-like keys. Values stay as strings to preserve their original JSON shape. |
| `queries` | Newest-first AI query records: question, exact prompt, context, sources, provider/model, whether notes were included, environment and answer. Limited to the 25 newest records. |
| `warnings` | Human-readable reminders about sensitive content. |

## Exclusions

- OpenRouter API keys and the PKCE verifier (`sessionStorage` only).
- Any local key matching `openrouter`, `authorization`, `api-key`, `api_key`,
  `token`, `secret` or `password`.
- Telemetry, because Falcon does not collect any.

## Restore behavior

`restoreBackup` validates `format` and `format_version`, then merges
`local_data` and `queries` into `localStorage`. It skips values that are not
strings, keys outside the `falcon:` namespace and credential-like keys.

The embedded SQLite bytes are **not** written over the running database. They
are included for external recovery and inspection; replacing a live browser
database from an untrusted file would be unsafe. The UI asks for confirmation
and recommends reloading after a restore.

## Compatibility

- A missing `format_version` or a different format is rejected.
- Version `1` is the only supported format today.
- Additive fields are allowed; readers must ignore unknown fields.
- A future format version must ship with a migration path in the settings panel.

## Sensitive data

The file can contain case notes, prompts, sources and query history. Store it
like investigation evidence: encrypted at rest, access-controlled, and deleted
according to the case retention policy.
