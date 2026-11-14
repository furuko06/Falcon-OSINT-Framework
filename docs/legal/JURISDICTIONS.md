# Jurisdiction matrix (G9)

- Version: `v1.0.0`
- Audience: analysts using Falcon outside a single country, and contributors
  reviewing catalog entries for a region
- Companion: [`LAWFUL_USE.md`](LAWFUL_USE.md), [`SOURCE_TERMS_REVIEW.md`](SOURCE_TERMS_REVIEW.md)

> This is a map of the rules that usually apply, not legal advice. It is written
> for orientation and for the questions to bring to counsel. **The user decides
> what to collect and bears responsibility for that decision**, including when a
> case sits in a gray area, when the applicable law is unclear or when a source's
> terms are stricter than the law. Falcon does not authorize anything listed here
> and does not audit what an analyst does locally.

## 1. What does not change with jurisdiction

Falcon is link-only: it opens public pages and stores what the analyst types. It
never authenticates, never loads leaked credentials, never bypasses a paywall,
CAPTCHA or rate limit, and never automates collection against a third-party
service. Those limits are in the code and in `SOURCE_TERMS_REVIEW.md`; no
jurisdiction makes an exception for them.

Everything below changes the *perimeter around* that behavior: whether a public
post may be stored, how long, whether it may be published, and what has to be
recorded.

## 2. Matrix

The three columns on the right are the recurring questions: personal data,
unauthorized access and publication.

| Jurisdiction | Personal data | Unauthorized access / computer misuse | Publication and reputation | What changes for a Falcon user |
| --- | --- | --- | --- | --- |
| **Argentina** | Ley 25.326 (data protection), AAIP as authority; draft reform pending | Ley 26.388 amended the Criminal Code: art. 153 bis punishes unauthorized access to a system | Civil and criminal defamation; right to honor and privacy in the Civil Code | Default distribution country. Purpose limitation, minimization and retention apply; a legal basis is needed before storing notes about a private person |
| **Brasil** | LGPD (Lei 13.709/2018), ANPD as authority | Lei 12.737/2012 added art. 154-A to the Penal Code (unauthorized device access) | Defamation and "dano moral" claims are common | LGPD has explicit legal bases and data-subject requests; recording the basis per case matters |
| **México** | LFPDPPP (private sector) and LGPDPPSO (public sector), INAI | Código Penal Federal art. 211 bis (unauthorized access to systems) | Civil liability for moral damage; right of reply | Public-sector sources are governed by transparency law; private data still needs consent or a legal exception |
| **Chile** | Ley 19.628, replaced by Ley 21.719 (published 2024, in force from December 2026) | Ley 21.459 (2024) updated computer-crime offenses | Civil defamation and privacy actions | The 2026 reform raises obligations and creates a data protection authority; cases spanning 2026 need both regimes |
| **Colombia** | Ley 1581/2012, SIC as authority | Ley 1273/2009 modified the Penal Code (informatics crimes) | Civil defamation; habeas data | Habeas data gives data subjects a direct action; keep a deletion path for stored case data |
| **Perú** | Ley 29733, ANPD as authority | Ley 30096 (informatics crimes) | Defamation and privacy actions | Consent-based model with narrow exceptions; storing personal notes needs a documented basis |
| **European Union / EEA** | GDPR (Reg. 2016/679), national supervisory authorities; ePrivacy Directive for communications metadata | Each member state criminalizes unauthorized access (for example §202a StGB in Germany, art. 323-3 in France, art. 197 in Spain) | Defamation, privacy and personality rights under national law; DSA rules for publishing on platforms | GDPR applies to anyone targeting people in the EU, wherever the analyst sits. Data-subject rights, records of processing and erasure requests are expected |
| **United Kingdom** | UK GDPR plus Data Protection Act 2018, ICO as authority | Computer Misuse Act 1990 | Defamation Act 2013; misuse of private information | Same GDPR-style duties; the CMA adds a separate criminal layer for access |
| **United States** | Sectoral federal law and state privacy statutes (for example CCPA/CPRA in California); no single federal law | CFAA, 18 U.S.C. §1030; ECPA and the Stored Communications Act for stored communications | State defamation and privacy torts; right of publicity | Public-records law differs by state; "publicly available" is broader than in the EU, but terms of service and the CFAA still bound automation |
| **Canada** | PIPEDA federally, plus provincial laws (for example Quebec's Law 25) | Criminal Code s. 342.1 (unauthorized use of a computer) | Defamation and privacy torts (intrusion upon seclusion) | Quebec's Law 25 adds privacy-by-default duties; province matters |
| **Australia** | Privacy Act 1988 and the Australian Privacy Principles, OAIC as authority | Criminal Code s. 477.1 (unauthorized access to data) | Defamation law reformed in 2021; serious invasions of privacy | Public-interest exemptions are narrow; publishing identifies people quickly |

## 3. Cross-border

- The **Budapest Convention on Cybercrime** underpins unauthorized-access
  offenses in most of the countries above; an act that is lawful where the
  analyst sits can still be an offense where the target or the server sits.
- **GDPR Art. 3** reaches an analyst outside the EU when the processing targets
  people in the EU. The same logic appears in Brazil's LGPD and in the newer
  Chilean and Canadian rules.
- When a case crosses borders, record: the jurisdictions involved, the basis
  used, who reviewed it and the date. If that record cannot be produced, treat
  the collection as not authorized.

## 4. Gray areas are the user's call

These are the places where analysts most often disagree, and where Falcon will
not decide for them:

- A public post that is indexed but was later deleted, or that was scraped from
  a private group and republished.
- Public records that mix professional and private data (addresses, family
  members, vehicle plates).
- Pseudonymous accounts that are trivially re-identifiable.
- Archival copies of pages that no longer exist.
- Data about bystanders who appear in a target's public content.

In all of them the tool will still open the page if it is public, because
blocking on a subjective judgment would make the catalog unusable and would
replace the analyst's decision with the project's. That is a deliberate boundary:
**the analyst assumes the legal and ethical responsibility for what they collect,
store, publish or act on, including in gray areas and including where local law
or a source's terms are stricter than this document.** The project's own limits —
no authentication or paywall bypass, no leaked credentials, no harassment — are
not negotiable.

## 5. Minimum record per case

| Field | Example |
| --- | --- |
| Jurisdiction(s) | Argentina, target in Brazil |
| Legal basis | Public interest, internal fraud investigation, court order |
| Necessity | Why each personal field is needed |
| Retention | Delete notes 90 days after closing |
| Publication decision | Internal only / published with redactions |
| Review | Who approved it and when |

## 6. Open work

The matrix is written at the level of "which law applies and what it requires in
principle". It has not been reviewed by counsel, and it is not a substitute for
local advice in a specific case. `docs/roadmap/V1_READINESS.md` records G9 as
delivered with that accepted risk.
