# Security Policy

Falcon OSINT Framework is built for cybersecurity and investigative workflows.
Security reports are handled carefully because vulnerabilities may affect
investigators, sensitive research data, and downstream users.

## Supported Versions

Falcon is currently in alpha. Security fixes target the active development branch
until versioned releases are published.

| Version | Supported |
| ------- | --------- |
| 0.1.x alpha | Yes |
| Older snapshots | No |

## Reporting a Vulnerability

Please do not disclose vulnerabilities publicly until the project maintainers
have had a reasonable opportunity to investigate and remediate them.

To report a vulnerability:

1. Open a private security advisory if GitHub security advisories are available.
2. If private advisories are unavailable, contact the maintainers using the
   repository's published maintainer contact channel.
3. Include a clear description, affected versions or commits, reproduction steps,
   impact, and any suggested remediation.
4. Do not include real victim data, live credentials, or sensitive investigation
   material.

## What to Report

Security-relevant issues include:

- Cross-site scripting or unsafe rendering of intelligence data.
- Insecure handling of local databases, exports, or cached artifacts.
- Supply-chain risks in dependencies, build scripts, or release assets.
- Unsafe plugin, import, or data ingestion behavior.
- Privilege escalation, arbitrary file access, or code execution.
- Privacy leaks that expose investigation targets, sources, or user activity.

## Research Guidelines

When testing Falcon:

- Use local test data or synthetic intelligence records.
- Do not test against third-party services without authorization.
- Do not attempt persistence, lateral movement, credential theft, or destructive
  activity.
- Stop testing and report promptly if you encounter sensitive data.

## Response Process

Maintainers will aim to acknowledge valid reports within 7 days. Confirmed
vulnerabilities will be triaged by severity, remediated in a focused patch, and
documented in the changelog when disclosure is appropriate.

## Disclosure

Coordinated disclosure is preferred. Public disclosure timelines should account
for user safety, exploitability, and the time needed to prepare a fix.

