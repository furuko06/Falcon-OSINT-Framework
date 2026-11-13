# Changelog

All notable changes to Falcon OSINT Framework will be documented in this file.

This project follows the spirit of Keep a Changelog and uses semantic versioning
once stable releases begin. Until v1.0, breaking changes may occur between minor
alpha releases and will be called out explicitly.

## [Unreleased]

## [0.2.0-alpha] - 2026-11-13

### Added

- Repository community health documentation for contributors, security reporting,
  governance, and roadmap planning.
- Documentation structure for architecture, API, database, OPSEC, and development
  notes.
- Falcon favicon and web manifest icon links.
- E12 AI Assistant: local retrieval over the SQLite catalog, Academy and
  Playbooks, deterministic offline briefings, note triage, prompt previews and an
  optional local Ollama connection.
- Academy lessons, labs and a quiz on claim triage, geolocation, corporate
  records and evidence archiving, with source links.
- 31 catalog entries for environmental, archiving, data analysis, corporate
  registry, historical imagery, synthetic media and monitoring work.

### Changed

- Academy lessons and labs now display their reference sources.

### Security

- Added a responsible disclosure policy for reporting vulnerabilities in Falcon.
- The AI Assistant only calls a loopback model endpoint and requires explicit
  per-query consent before sending the prompt; case notes stay in the page and
  are excluded unless the analyst opts in.

## [0.1.0-alpha]

### Added

- Initial offline-first Falcon OSINT Framework foundation.
- SQLite-backed intelligence storage.
- Vite application shell.
- Explorer-focused investigation workflow groundwork.
- LATAM-oriented intelligence pack structure.

