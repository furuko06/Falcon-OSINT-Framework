# Roadmap

This roadmap describes the intended Falcon OSINT Framework milestones. Milestones
may shift as security, data quality, and usability findings emerge.

## M3 Explorer

- Complete the offline intelligence browsing workflow.
- Improve search, filtering, favorites, and result presentation.
- Strengthen investigator ergonomics for dense local datasets.
- Document Explorer responsibilities and data boundaries.

## M4 Intelligence Graph

- Introduce graph-oriented relationships between entities, sources, categories,
  and derived intelligence.
- Add visual exploration patterns for entity linkage and relationship context.
- Preserve provenance and avoid implying certainty where relationships are weak.

## M5 Plugin Engine

- Define a plugin model for optional capabilities.
- Establish plugin permissions, manifest requirements, and review expectations.
- Keep plugin execution compatible with offline-first and OPSEC requirements.

## M6 AI Assistant

Status: delivered in `0.2.0-alpha` (E12) with local retrieval, note triage,
optional loopback Ollama and eleven external provider launchers. Next: streaming
responses, evaluation harness and optional embedding-based retrieval.

- Add assistant workflows for summarization, triage, and investigative note
  support.
- Require explicit data handling boundaries for any model-backed features.
- Keep sensitive local context under user control.

## M7 API

- Provide a local-first API for integrations, automation, and advanced workflows.
- Document stable contracts for intelligence records, graph data, and search.
- Include authentication and access controls where needed.

## M8 Academy

Status: delivered in `0.2.0-alpha` (E11) with 8 lessons, 5 labs and 2 quizzes.
Next: synthetic case packs and instructor mode.

- Add educational material for OSINT methodology, OPSEC, data ethics, and Falcon
  workflows.
- Provide safe sample investigations using synthetic or consent-based data.
- Support onboarding for analysts, students, and defenders.

## V1 Launch

The gate plan, evidence requirements and deferred scope live in
[`V1_READINESS.md`](V1_READINESS.md). Falcon stays alpha until every must gate
passes; the version number is not a marketing milestone.

- Stabilize core workflows and documentation.
- Freeze public contracts for supported APIs and plugin interfaces.
- Complete security review, release process, and community governance readiness.
- Publish a production-ready offline-first OSINT toolkit.

