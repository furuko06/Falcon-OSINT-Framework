# Release gates

- Fecha: 2026-11-14T01:43:33.696Z
- Versión: 1.0.0
- Estado global: **PASS_WITH_OMITTED**
- Gate real: omitido (evaluación de IA diferida a v1.1)

| Gate | Estado | Evidencia |
| --- | --- | --- |
| Tests unitarios e integración | PASS |  |
| Escaneo de secretos y workflows | PASS |  |
| Auditoría de dependencias | PASS |  |
| Validación de datos | PASS |  |
| Provenance del catálogo | PASS |  |
| Contratos congelados (G6) | PASS |  |
| Build de producción | PASS |  |
| Presupuestos de rendimiento | PASS | PASS |
| Auditoría de accesibilidad | PASS |  |
| Árbol de accesibilidad (lector de pantalla) | PASS |  |
| Evaluación offline del asistente | OMITIDO | omitido con --skip-ai (diferido a v1.1) |
| Evaluación de modelo real | OMITIDO | omitido con --skip-ai (diferido a v1.1) |

## Artefactos

- Rendimiento: `docs/audits/PERF_REPORT.md` y `docs/audits/perf-report.json`
- Accesibilidad: `docs/audits/A11Y_AUDIT.md`
- Modelo: `docs/audits/MODEL_EVAL.md` y `docs/audits/model-eval-report.json`
- Seguridad: `docs/security/CIS_CONTROLS.md`
- Fuentes: `docs/audits/SOURCE_HEALTH.md` y `docs/audits/source-health.json`

## Reproducción

```bash
npm run gates
npm run gates -- --skip-ai
npm run gates -- --require-real
```

Un gate real bloqueado se muestra como BLOCKED y no se presenta como aprobado.
Un gate omitido se muestra como OMITIDO y deja el estado global en
`PASS_WITH_OMITTED`, nunca en `PASS`.
Para exigirlo en una release, usar `--require-real` con Ollama o
`OPENROUTER_API_KEY` configurados.
