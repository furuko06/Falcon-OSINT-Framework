# Lawful-use guidance

- Version: `v1.0.0`
- Audience: analysts using Falcon and contributors adding catalog entries

> This document describes the boundary the tool is built around. It is not legal
> advice and it does not replace a lawyer. Jurisdiction-specific conclusions are
> for counsel to make.

## 1. The premise

Falcon collects public and openly accessible information. It does not create a
legal basis for an investigation: the analyst needs one before opening the tool,
not after collecting the data. "It was public" answers *where* the data came
from; it does not answer whether collecting, combining or publishing it is
lawful and proportionate.

## 2. Uses Falcon does not support

The catalog, the assistant and the documentation must not be used for:

- Accessing systems, accounts or data without authorization.
- Bypassing authentication, paywalls, CAPTCHAs, rate limits or access controls.
- Using leaked credentials, session tokens or breach data to enter an account.
- Stalking, harassment, doxxing, intimate-image collection or coordinated
  targeting of a person.
- Surveillance of a person or group without a lawful basis and, where required,
  judicial authorization.
- Impersonation, social engineering or fraud.
- Collecting data about minors outside a lawful, necessary and supervised process.
- Any use that the applicable law prohibits, even if the source is public.

An entry that only works through one of those techniques is not a valid catalog
entry, per `docs/legal/SOURCE_TERMS_REVIEW.md`.

## 3. Questions to answer before collecting

| Question | Why it matters |
| --- | --- |
| What is the lawful basis (consent, public interest, legal duty, court order)? | Determines whether the collection is allowed at all |
| Is the data necessary and proportionate to the question? | Justifies each field collected, not the tool as a whole |
| Is the person a public figure, a private individual or a vulnerable person? | Changes the threshold of harm and the level of scrutiny |
| Does the source's terms of service allow this use? | Terms are not law, but breaching them carries contractual and reputational risk |
| Who will see the result, and could publishing it cause harm? | Minimizes exposure and avoids collateral damage |
| How long will the data be kept, and how is it deleted? | Retention is part of lawfulness, not an afterthought |

If any answer is missing, stop and escalate before collecting more.

## 4. Data protection

- Collect the minimum: a username or a domain, not a full profile scrape.
- Special categories (health, sexual life, political opinion, religion, union
  membership, biometric data) need a stronger basis; do not add them to notes
  without a specific reason.
- Separate fact from hypothesis in notes. Falcon's triage and the assistant
  require citations and label model output as something to verify.
- Keep case data in the backup or the local workspace, not in issue reports,
  screenshots or shared chats.
- Apply a retention decision at the start: what is deleted, when and by whom.

## 5. Jurisdiction

Falcon is distributed from Argentina and used across jurisdictions. Nothing here
states that a given collection is lawful in a given country. The per-region
rules — data protection, unauthorized-access offenses and publication rules for
Argentina, Brazil, Mexico, Chile, Colombia, Peru, the EU/EEA, the United Kingdom,
the United States, Canada and Australia — are summarized in
[`JURISDICTIONS.md`](JURISDICTIONS.md), together with the cross-border rules and
the minimum record to keep per case.

When the jurisdiction is unclear, or the investigation crosses borders, ask
counsel before collecting. Record the advice and the decision with the case.

Gray areas exist — deleted-but-indexed posts, public records that mix
professional and private data, trivially re-identifiable pseudonyms, archival
copies, bystanders. Falcon does not decide them for the analyst and does not
block them: **the user assumes responsibility for what they collect, store,
publish or act on, including in gray areas and where local law or a source's
terms are stricter than this document.** The limits in section 2 are the
project's own and are not negotiable.

## 6. Enforcement and accountability

- The Policies and Privacy panel records the acknowledgment of this boundary per
  policy version (`falcon:privacy-ack`) and states that use is the user's
  responsibility.
- Catalog entries that violate this guidance are corrected or removed through
  `docs/legal/TAKEDOWN.md`.
- The project does not audit what an analyst does locally; it can only keep the
  tool's own behavior within these limits.

## 7. Open work

Counsel review of this guidance, of [`JURISDICTIONS.md`](JURISDICTIONS.md) and of
the catalog sources is pending. Until it happens, `V1_READINESS.md` records G9 as
delivered with an accepted risk instead of as legally signed off.
