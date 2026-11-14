# Auditoría de accesibilidad

- Fecha: 2026-11-14T00:19:33.450Z
- Versión: 1.0.0
- Base Git: `d9fcc25` + cambios de la auditoría
- URL: http://localhost:4173/
- Alcance: WCAG 2.2 A/AA, 8 vistas principales
- Motor: axe-core 4.14.0 en Chrome headless
- Resultado: **0 violaciones** (0 nodos)

## Resumen por vista

| Vista | Violaciones | Nodos | Pases | Incompletos |
| --- | ---: | ---: | ---: | ---: |
| Catálogo | 0 | 0 | 26 | 2 |
| Asistente IA | 0 | 0 | 26 | 1 |
| Ajustes y backup | 0 | 0 | 32 | 1 |
| Políticas y privacidad | 0 | 0 | 27 | 1 |
| Academy | 0 | 0 | 28 | 1 |
| Playbooks | 0 | 0 | 28 | 1 |
| Knowledge Graph | 0 | 0 | 28 | 1 |
| IOC Workspace | 0 | 0 | 28 | 1 |

## Comprobaciones manuales

| Comprobación | Resultado | Detalle |
| --- | --- | --- |
| El primer Tab llega al skip link | PASA | Saltar al catálogo |
| El skip link se hace visible al enfocar | PASA |  |
| El skip link mueve el foco al contenido principal | PASA |  |
| prefers-reduced-motion desactiva transiciones | PASA | 1e-05s / 1e-05s |
| Objetivos táctiles de 44 px en móvil | PASA |  |

## Hallazgos

No se detectaron violaciones automatizadas para las etiquetas WCAG 2.2 A/AA.
## Cómo reproducir

```bash
npm run build
npm run preview -- --port 4173 --strictPort
npm run a11y
```

El informe se regenera en `docs/audits/A11Y_AUDIT.md`. Un resultado distinto de cero
hace fallar el comando. La auditoría automatizada no sustituye una prueba manual con
teclado, zoom al 200% ni lector de pantalla.

## Límites

- axe-core detecta reglas automatizables; no evalúa toda la semántica ni la experiencia real.
- No se ejecutó un lector de pantalla (NVDA/VoiceOver) en este entorno.
- El contraste se evalúa sobre el tema oscuro por defecto.
