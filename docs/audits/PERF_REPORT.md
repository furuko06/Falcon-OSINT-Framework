# Performance report

- Fecha: 2026-11-13T21:56:13.285Z
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
| Primer render del catálogo | 710.8 ms | 2500 ms | PASS |
| Apertura de SQLite | 463.7 ms | 1200 ms | PASS |
| Retrieval p95 (1.000 docs) | 1.657 ms | 100 ms | PASS |
| JavaScript gzip | 66.32 KB | 90 KB | PASS |
| CSS gzip | 4.93 KB | 10 KB | PASS |
| Artefacto dist completo | 1631.62 KB | 2500 KB | PASS |
| Heap con el catálogo completo | 4.11 MB | 96 MB | PASS |
| Heap corpus de 1.000 documentos | 0.2 MB | 32 MB | PASS |

## Detalle

- Catálogo: 182 tarjetas.
- SQLite: 100 KB; apertura 463.7 ms.
- Consulta de herramientas: 29.9 ms.
- Primer contenido: 796 ms; DOMContentLoaded: 139.5 ms.
- Retrieval de 1.000 documentos: p50 0.993 ms, p95 1.657 ms, máximo 3.972 ms (500 muestras).
- Memoria del corpus de 1.000 documentos: +0.2 MB.
- JS gzip: 66.32 KB; CSS gzip: 4.93 KB; dist: 1631.62 KB.

## Reproducción

```bash
npm run build
npm run perf
```

El comando abre un preview local, mide con Chrome y devuelve código de salida
distinto de cero si un presupuesto falla. La evidencia JSON está en
`docs/audits/perf-report.json`.
