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

## Estado

Version: 0.1.0-alpha
