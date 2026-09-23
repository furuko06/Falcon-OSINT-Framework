# Contributing to Falcon OSINT Framework

Thank you for helping improve Falcon. This project is an offline-first OSINT
platform for investigators and security professionals. Contributions should make
the tool more reliable, transparent, ethical, and safe to use.

## Code of Conduct

All contributors are expected to follow the project Code of Conduct. Be
professional, constructive, and respectful when discussing investigations,
security topics, or sensitive use cases.

## Ethical Scope

Falcon is intended for lawful, consent-based, and public-interest research. Do
not contribute features, datasets, examples, or documentation that enable
harassment, stalking, credential theft, unauthorized access, doxxing, evasion of
platform safeguards, or targeting private individuals without a legitimate basis.

When contributing OSINT capabilities:

- Prefer public, documented, and rate-limit-respecting sources.
- Avoid collecting unnecessary personal data.
- Document provenance, freshness, and limitations of intelligence data.
- Keep defensive, investigative, and educational use cases explicit.
- Treat operational security as a first-class design requirement.

## Getting Started

1. Fork the repository and create a topic branch.
2. Install dependencies with `npm install`.
3. Run `npm run build`.
4. Run `npm test -- --run`.
5. Keep the diff focused on a single feature, bug fix, or documentation change.

## Development Guidelines

- Preserve offline-first behavior unless the change is explicitly about optional
  connectivity.
- Do not modify SQLite schema, migrations, or generated databases unless the issue
  or sprint explicitly requests it.
- Keep UI changes accessible, responsive, and usable by investigators working with
  dense data.
- Favor clear data boundaries between source intelligence, derived intelligence,
  and user-created investigation notes.
- Avoid adding dependencies unless they materially reduce risk or maintenance
  cost.
- Include tests for behavior changes and documentation for new user-facing
  workflows.

## Commit and Pull Request Standards

Use concise commit messages that describe the change and its intent. Pull
requests should include:

- A short summary of the change.
- Linked issue or sprint reference when available.
- Validation commands and results.
- Screenshots or recordings for UI changes.
- Notes on security, privacy, OPSEC, or data model impact.

## Reporting Bugs

Use the bug report template and include reproduction steps, expected behavior,
actual behavior, browser or runtime details, and relevant logs. Remove sensitive
investigation data before sharing screenshots, databases, or exports.

## Requesting Features

Use the feature request template and explain the investigative workflow, threat
model, data sources, and privacy implications. Features that increase collection
scope or automation should include abuse prevention considerations.

## Security Issues

Do not open public issues for suspected vulnerabilities. Follow the instructions
in `SECURITY.md`.

