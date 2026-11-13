# Performance report

- Fecha: 2026-11-13T22:48:12.811Z
- Versión: 0.7.0-beta
- Entorno: Intel(R) Core(TM) i5-10210U CPU @ 1.60GHz, 8 cores, 7.7 GB RAM, win32 10.0.19045
- Navegador: Chrome headless
- URL: http://localhost:4173/
- Estado: **PASS**

Este informe mide una máquina de desarrollo, no un portátil normalizado. Los
números son reproducibles con `npm run perf`, pero no deben compararse entre
hardware distinto como si fueran una garantía absoluta.

## Presupuestos

| Métrica | Medido | Presupuesto | Estado |
| --- | ---: | ---: | --- |
| Primer render del catálogo | 1109.1 ms | 2500 ms | PASS |
| Apertura de SQLite | 854.3 ms | 1200 ms | PASS |
| Retrieval p95 (1.000 docs) | 2.157 ms | 100 ms | PASS |
| JavaScript gzip | 66.54 KB | 90 KB | PASS |
| CSS gzip | 4.93 KB | 10 KB | PASS |
| Artefacto dist completo | 1636.35 KB | 2500 KB | PASS |
| Heap con el catálogo completo | 3.47 MB | 96 MB | PASS |
| Heap corpus de 1.000 documentos | 0.2 MB | 32 MB | PASS |

## Detalle

- Catálogo: 182 tarjetas.
- SQLite: 104 KB; apertura 854.3 ms.
- Consulta de herramientas: 40.4 ms.
- Primer contenido: 1064 ms; DOMContentLoaded: 592.7 ms.
- Retrieval de 1.000 documentos: p50 1.467 ms, p95 2.157 ms, máximo 11.974 ms (500 muestras).
- Memoria del corpus de 1.000 documentos: +0.2 MB.
- JS gzip: 66.54 KB; CSS gzip: 4.93 KB; dist: 1636.35 KB.

## Reproducción

```bash
npm run build
npm run perf
```

El comando abre un preview local, mide con Chrome y devuelve código de salida
distinto de cero si un presupuesto falla. La evidencia JSON está en
`docs/audits/perf-report.json`.
