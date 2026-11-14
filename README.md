# Falcon OSINT Framework

Offline-first OSINT Framework.

## Objetivos

- OSINT Framework moderno.
- SQLite offline.
- LATAM Intelligence Pack.
- PWA.
- Knowledge Graph.
- Plugin SDK.

## Cómo ejecutar

La app necesita un servidor HTTP: no funciona abriendo `index.html` con doble clic, porque el navegador bloquea los módulos ES y la carga de la base de datos.

```bash
npm install
npm run dev
```

Luego abre `http://localhost:5173/`.

Para probar el build de producción: `npm run build` y `npm run preview`.
El build copia la base y los WASM y genera el service worker: `dist/` queda listo para publicar.

## IA conectada

En **Asistente IA → Conectar IA**, Falcon usa OAuth PKCE de OpenRouter. Autorizás en
openrouter.ai, volvés a Falcon y podés probar la conexión y consultar el modelo elegido.
La clave vive sólo en `sessionStorage` de esa pestaña y no se incluye en los backups.
Falcon no recibe tu contraseña ni accede a Gmail. El modelo local de Ollama sigue disponible.

## Offline, backup y privacidad

Tras la primera carga, el service worker precarga la app, SQLite y los WASM para abrir sin red.
**Ajustes y backup** exporta un JSON con catálogo, configuración y el entorno/contexto de cada
consulta IA; **Políticas y privacidad** registra la aceptación y deja el uso bajo tu responsabilidad.

## Gates de calidad

`npm run gates` ejecuta las compuertas de release sobre el build real: tests,
escaneo de secretos, auditoría de dependencias, validación de datos, build,
presupuestos de rendimiento, accesibilidad y evaluación del asistente. Escribe
`docs/audits/GATES_REPORT.md`.

```bash
npm run gates                      # navegador incluido
npm run gates -- --skip-ai         # difiere la evaluación del asistente a 1.1
npm run gates -- --skip-browser
npm run gates -- --require-real    # exige un modelo real
```

Un gate omitido se informa como OMITIDO y el estado global queda en
`PASS_WITH_OMITTED`, nunca en PASS. La evaluación real usa Ollama en
`127.0.0.1:11434` o `OPENROUTER_API_KEY`; está diferida a 1.1. Si usás una copia
local de Ollama, `OLLAMA_MODELS` debe ser una ruta absoluta.

La salud de las fuentes corre en un workflow semanal independiente
(`.github/workflows/source-health.yml`): revisa las 182 fuentes y publica el
resultado en el resumen del run, sin commitear nada ni bloquear el build, el
despliegue o el uso offline.

## Estado

Version: 1.0.0
