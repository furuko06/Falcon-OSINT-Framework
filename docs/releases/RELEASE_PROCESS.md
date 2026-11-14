# Release process (G8)

How a Falcon release is cut, verified, published, upgraded and rolled back.

## 1. Prepare

1. Bump the version in `package.json`, `package-lock.json`,
   `framework/core/state.js`, `framework/modules/assistant/panel.js`,
   `framework/modules/settings/panel.js`, `framework/modules/plugins/sdk.js`,
   `README.md` and `docs/development/BACKUP_FORMAT.md`.
2. Add the release section to `CHANGELOG.md` and a file in `docs/releases/`.
3. If a contract changed, bump `contracts/contract-version.json` and run
   `npm run contracts:freeze` (see `contracts/README.md`).
4. Run `npm run gates` (or `--skip-ai` while the model evaluation is deferred)
   and confirm the report in `docs/audits/GATES_REPORT.md` is green.
5. Commit, tag annotated (`git tag -a v1.0.0 -m "..."`) and push the branch and
   the tag.

## 2. Build the artifact

```bash
npm run release:manifest             # source archive + SHA-256 + manifest
npm run release:manifest -- --verify # recompute every hash
```

Outputs in `docs/releases/`:

- `falcon-osint-framework-<version>.tar.gz` — `git archive` of the tag, not of
  the working tree, so the artifact is reproducible from the tag alone.
- `falcon-osint-framework-<version>-SHA256SUMS` — archive and `database/falcon.db`.
- `falcon-osint-framework-<version>-manifest.json` — tag, commit, tag type, node
  and platform of the build, file sizes and hashes.
- `falcon-osint-framework-<version>-SHA256SUMS.asc` — only when signing.

The tarball is ignored by git: it belongs to the GitHub Release, not to the
repository. The manifest and checksums are committed so the published artifact
can be verified later.

## 3. Sign

Signing needs a maintainer key; generating a throwaway key would produce a
signature that proves nothing. With a key in the keyring:

```bash
gpg --list-secret-keys --keyid-format long
FALCON_GPG_KEY=<fingerprint> npm run release:manifest -- --sign
```

The script signs the checksums, verifies the signature immediately and records
the fingerprint in the manifest. Publish the fingerprint in the release notes so
verifiers can compare it out of band.

## 4. Publish

Create the GitHub Release from the tag with the notes in `docs/releases/`, and
attach:

- `falcon-osint-framework-<version>.tar.gz`
- `falcon-osint-framework-<version>-SHA256SUMS`
- `falcon-osint-framework-<version>-SHA256SUMS.asc` (when signed)
- `falcon-osint-framework-<version>-manifest.json`

Verification for users:

```bash
sha256sum -c falcon-osint-framework-1.0.0-SHA256SUMS
gpg --verify falcon-osint-framework-1.0.0-SHA256SUMS.asc falcon-osint-framework-1.0.0-SHA256SUMS
```

Pages deploys `dist/` from `main`; the release artifact is the tag.

## 5. Upgrade

1. Export a backup from **Ajustes y backup** (catalog, settings and IA context).
2. Open the new build with the same origin; schema migrations run automatically
   and `falcon:last-restore` records the applied step.
3. If the database fails to open, the recovery screen offers retry and a cache
   reset that preserves `localStorage`.

The backup envelope and its checksum are documented in
`docs/development/BACKUP_FORMAT.md`.

## 6. Rollback

1. Restore the previous backup from **Ajustes y backup**; the restore validates
   the checksum before writing.
2. Deploy the previous tag (`git checkout v1.0.0` and redeploy Pages) or serve
   the previous `dist/` if the new build cannot start.
3. Report the regression with the gate report and the manifest of both versions.

Migrations are additive; a rollback that needs to drop a column is a manual
step and must be documented in the release notes of the version that added it.
