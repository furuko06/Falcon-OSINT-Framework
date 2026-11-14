# Catalog correction and takedown path

- Version: `v1.0.0`
- Channel: `https://github.com/furuko06/Falcon-OSINT-Framework/issues/new?template=catalog_correction.yml`
- For vulnerabilities in Falcon itself: `SECURITY.md` (private advisory preferred)

## 1. What can be reported

- **Incorrect data**: wrong name, URL, category, description or status.
- **Dead or hijacked domain**: the entry points to a parked, expired or
  compromised site.
- **Authentication or paywall bypass**: the entry only works by circumventing a
  control.
- **Terms violation**: the provider does not allow the listing or the described
  use.
- **Unlawful content or service**: the entry facilitates an illegal act.
- **Privacy or safety concern**: the entry exposes a person or enables harm.

Owners, providers, rights holders and third parties can use the same channel.
The form does not ask for personal data of third parties and must not contain
investigation material.

## 2. What happens after a report

| Step | Target | What is recorded |
| --- | --- | --- |
| Acknowledgment | 7 business days | Issue is labelled `catalog` and triaged |
| Verification | 30 days | The URL is re-checked with `npm run db:links`, and the claim is compared with the source |
| Decision | With the verification | Correction, status change (`broken`, `deprecated`, `unchecked`), removal, or reasoned rejection |
| Record | Same change | JSON entry, `last_verified`, `docs/audits/SOURCE_HEALTH.md` and `CHANGELOG.md` are updated together |

A removal is a normal catalog change: the entry disappears from the JSON, the
next `npm run db:import` deletes the row, and the provenance gate stays green.
Legal orders and urgent safety reports are handled first; the project can remove
an entry before the 30-day window when waiting would cause harm.

## 3. Outcomes

- **Corrected**: the entry stays with fixed data and a new verification date.
- **Restricted**: the entry stays as a manual link with `status: restricted` when
  the host refuses automated clients.
- **Deprecated or broken**: the entry stays visible with a warning, or is removed
  when it no longer serves an investigative purpose.
- **Removed**: the entry is deleted from the catalog and the source-health report
  no longer lists it.

Every outcome answers the issue with the decision and the commit that applied it.

## 4. What this path does not do

- It does not remove content from third-party sites. Falcon only lists links.
- It does not adjudicate who is right in a dispute between third parties.
- It does not delete data from a user's browser; backups and local workspaces
  stay under the analyst's control (see
  `docs/legal/PRIVACY_IMPACT_ASSESSMENT.md`).
- It is not a legal filing channel. If a request needs a formal legal
  notification, say so in the report and the maintainers will respond through
  the repository's published maintainer channel.
