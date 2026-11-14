# OPSEC Documentation

This directory documents operational security guidance for using and extending
Falcon.

Topics should include safe handling of investigation data, source protection,
offline workflows, export hygiene, plugin risk, browser storage considerations,
and ethical boundaries for OSINT collection and analysis.

## AI Assistant (E12)

- Retrieval, prompt building and note triage run in the browser over the local
  SQLite catalog, Academy and Playbooks. They need no network connection.
- The optional model is a user-managed local Ollama server. Falcon only accepts
  loopback endpoints (`localhost`, `127.0.0.1`, `::1`) and has no remote provider
  or API key setting.
- A model call happens only after the analyst ticks the consent box for that
  query. The panel shows the exact prompt preview before sending.
- Case notes are never persisted by the assistant and are only added to the
  prompt when the analyst opts in. Endpoint, model and that preference are the
  only values stored in `localStorage` under `falcon:assistant`.
- Model output is untrusted text: the prompt requires citations and the UI labels
  it as something to verify, not as confirmed intelligence.

