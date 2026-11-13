# Release gates

- Fecha: 2026-11-13T18:56:58.846Z
- Versión: 0.5.0-beta
- Estado global: **PASS_WITH_BLOCKED**
- Gate real: informativo (BLOCKED no bloquea el build)

| Gate | Estado | Evidencia |
| --- | --- | --- |
| Tests unitarios e integración | PASS |  |
| Escaneo de secretos y workflows | PASS |  |
| Auditoría de dependencias | PASS |  |
| Validación de datos | PASS |  |
| Build de producción | PASS |  |
| Presupuestos de rendimiento | PASS | PASS |
| Auditoría de accesibilidad | PASS |  |
| Evaluación offline del asistente | PASS | PASS |
| Evaluación de modelo real | BLOCKED | BLOCKED: llama3.2:1b: presupuesto de 60000 ms agotado después de 2/11 casos; qwen2.5:0.5b: presupuesto de 60000 ms agotado después de 0/11 casos |

## Artefactos

- Rendimiento: `docs/audits/PERF_REPORT.md` y `docs/audits/perf-report.json`
- Accesibilidad: `docs/audits/A11Y_AUDIT.md`
- Modelo: `docs/audits/MODEL_EVAL.md` y `docs/audits/model-eval-report.json`
- Seguridad: `docs/security/CIS_CONTROLS.md`

## Reproducción

```bash
npm run gates
npm run gates -- --require-real
```

Un gate real bloqueado se muestra como BLOCKED y no se presenta como aprobado.
Para exigirlo en una release, usar `--require-real` con Ollama o
`OPENROUTER_API_KEY` configurados.
