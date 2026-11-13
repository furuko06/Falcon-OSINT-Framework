# Performance report

- Fecha: 2026-11-13T18:54:04.629Z
- Versión: 0.5.0-beta
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
| Primer render del catálogo | 573.6 ms | 2500 ms | PASS |
| Apertura de SQLite | 382.8 ms | 1200 ms | PASS |
| Retrieval p95 (1.000 docs) | 1.66 ms | 100 ms | PASS |
| JavaScript gzip | 64.98 KB | 90 KB | PASS |
| CSS gzip | 4.7 KB | 10 KB | PASS |
| Artefacto dist completo | 1626.12 KB | 2500 KB | PASS |
| Heap con 165 herramientas | 5.27 MB | 96 MB | PASS |
| Heap corpus de 1.000 documentos | 0.2 MB | 32 MB | PASS |

## Detalle

- Catálogo: 165 tarjetas.
- SQLite: 100 KB; apertura 382.8 ms.
- Consulta de herramientas: 42.4 ms.
- Primer contenido: 920 ms; DOMContentLoaded: 150.5 ms.
- Retrieval de 1.000 documentos: p50 0.854 ms, p95 1.66 ms, máximo 4.909 ms (500 muestras).
- Memoria del corpus de 1.000 documentos: +0.2 MB.
- JS gzip: 64.98 KB; CSS gzip: 4.7 KB; dist: 1626.12 KB.

## Reproducción

```bash
npm run build
npm run perf
```

El comando abre un preview local, mide con Chrome y devuelve código de salida
distinto de cero si un presupuesto falla. La evidencia JSON está en
`docs/audits/perf-report.json`.
