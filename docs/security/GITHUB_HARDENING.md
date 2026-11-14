# Public Repository Hardening Checklist

This checklist covers the GitHub settings that cannot be enforced by files in a
public repository. Apply it to the Falcon repository and record the date of each
review.

## Identity and access

- [ ] Require MFA for every maintainer and organization member.
- [ ] Keep a single owner role and at least one recovery owner.
- [ ] Remove inactive collaborators and third-party app access quarterly.
- [ ] Use short-lived GitHub Actions tokens; never add personal access tokens as
      repository secrets.
- [ ] Require signed commits on protected branches where the workflow allows it.

## Branch protection

Protect `main`, `feature/sqlite-engine` while it is the release branch, and every
`v*` tag.

- [ ] Require a pull request before merging.
- [ ] Require at least one approval and dismiss stale approvals.
- [ ] Require status checks: tests, build, CodeQL, dependency review.
- [ ] Require conversation resolution.
- [ ] Require linear history.
- [ ] Block force-pushes and branch deletion.
- [ ] Restrict who can push to the branch.
- [ ] Protect release tags from update and deletion.

## Code and secret security

- [ ] Enable secret scanning and push protection.
- [ ] Enable Dependabot alerts and security updates.
- [ ] Enable CodeQL default setup or the repository CodeQL workflow.
- [ ] Enable dependency review for pull requests.
- [ ] Enable private vulnerability reporting.
- [ ] Review the security tab after every dependency update.

## Actions and deployment

- [ ] Set default `GITHUB_TOKEN` permissions to read-only.
- [ ] Disallow actions that are not pinned to a full commit SHA.
- [ ] Restrict allowed actions to verified creators and the actions used here.
- [ ] Protect the `github-pages` environment with a required reviewer.
- [ ] Deploy Pages only from the intended branch and workflow.
- [ ] Do not expose environment secrets to pull requests from forks.
- [ ] Review workflow logs for unexpected outbound network calls.

## Data handling

- [ ] Do not upload case data, browser profiles or real investigation exports as
      workflow artifacts.
- [ ] Keep `.env` files and local databases out of version control.
- [ ] Treat backups containing notes or prompts as sensitive evidence.
- [ ] Document retention and deletion for maintainers and contributors.

## Release hygiene

- [ ] Update `CHANGELOG.md` and the version before tagging.
- [ ] Run tests, build, security scan and the a11y audit from a clean checkout.
- [ ] Verify the Pages deployment after publishing.
- [ ] Publish release notes with known limitations and upgrade notes.
- [ ] Sign or attest release artifacts when packaging is introduced.

## Review record

| Date | Reviewer | Scope | Notes |
| --- | --- | --- | --- |
| 2026-11-13 | Repository maintainer | Initial checklist | Items requiring GitHub settings remain open until enabled in the UI. |
