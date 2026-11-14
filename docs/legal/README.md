# Legal and ethical review (G9)

This directory holds the gate G9 artifacts of
[`docs/roadmap/V1_READINESS.md`](../roadmap/V1_READINESS.md): the source terms
review, the privacy impact assessment, the lawful-use guidance and the takedown
and correction path.

> These documents record how Falcon is built and what it does not do. They are
> **not legal advice** and they do not replace a review by counsel. Where a
> conclusion depends on a jurisdiction, the text says so instead of assuming
> one.

## Status

| Artifact | State | Evidence |
| --- | --- | --- |
| Source terms review, no auth or paywall bypass | Delivered, counsel review pending | [`SOURCE_TERMS_REVIEW.md`](SOURCE_TERMS_REVIEW.md), `intelligence/build/check-links.mjs` |
| Privacy impact assessment for notes and prompts | Delivered, counsel review pending | [`PRIVACY_IMPACT_ASSESSMENT.md`](PRIVACY_IMPACT_ASSESSMENT.md), `framework/modules/privacy/panel.js` |
| Jurisdiction and lawful-use guidance | Delivered, counsel review pending | [`LAWFUL_USE.md`](LAWFUL_USE.md) |
| Takedown and correction path | Delivered and operational | [`TAKEDOWN.md`](TAKEDOWN.md), `.github/ISSUE_TEMPLATE/catalog_correction.yml` |

## What is still open

- A lawyer has not reviewed these documents. The 1.0 release carries this as an
  accepted risk, recorded in `docs/roadmap/V1_READINESS.md`.
- The source terms review covers Falcon's behavior (link-only catalog, no
  automated collection) and the hosts that reject automated clients. It does not
  include a clause-by-clause reading of 182 third-party terms of service.
- The privacy assessment documents the current retention behavior: the query
  history is capped at 25 records and can be cleared from Settings, but there is
  no per-record deletion or automatic expiry.
