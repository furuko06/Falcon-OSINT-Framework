# Salud de fuentes y provenance

- Fecha del chequeo: 2026-11-13
- Modo: write
- Entradas: 182
- Verificadas: 146
- Restringidas para clientes automáticos: 18
- Rotas: 2
- Deprecadas: 1
- Beta conservadas: 13
- Sin URL pública: 2

Método: un GET con user-agent de navegador a la URL de cada entrada, con un
reintento ante 5xx o error de red. 2xx/3xx cuenta como verificada; un 4xx
distinto de 404/410 como restringida (el host responde pero rechaza al cliente:
protección anti-bot, rate limit o login); 404/410, 5xx o un error de red como
rota. Un 403 no distingue bloqueo de contenido real, por eso no se marca rota.
El estado se registra junto con la fecha del chequeo en el pack JSON de origen.

## Entradas que no respondieron 2xx/3xx

| Herramienta | Categoría | URL | Estado | HTTP | Detalle |
| --- | --- | --- | --- | --- | --- |
| Wikidata Query Service | Data & Analysis | https://query.wikidata.org | restricted | 403 | — |
| Blockchain.com Explorer | Finance | https://www.blockchain.com/explorer | restricted | 403 | — |
| ImportYeti | Companies | https://www.importyeti.com | restricted | 403 | — |
| OpenSecrets | Finance | https://www.opensecrets.org | restricted | 403 | — |
| OXT | Finance | https://oxt.me | broken | — | fetch failed |
| Mapillary | GEOINT | https://www.mapillary.com | restricted | 400 | — |
| EUR-Lex | Government | https://eur-lex.europa.eu | restricted | 403 | — |
| Emailrep | Email | https://emailrep.io | restricted | 400 | — |
| Censys | Infrastructure | https://search.censys.io | restricted | 403 | — |
| SecurityTrails | Domains | https://securitytrails.com | restricted | 403 | — |
| AbuseIPDB | Infrastructure | https://www.abuseipdb.com | restricted | 403 | — |
| Flightradar24 | Monitoring | https://www.flightradar24.com | restricted | 403 | — |
| MarineTraffic | Monitoring | https://www.marinetraffic.com | restricted | 403 | — |
| ReliefWeb | Monitoring | https://reliefweb.int | restricted | 406 | — |
| HDX | Monitoring | https://data.humdata.org | restricted | 406 | — |
| DeHashed | Email | https://dehashed.com | restricted | 403 | — |
| Epieos | Email | https://epieos.com | restricted | 403 | — |
| Instant Username Search | Username | https://instantusername.com | restricted | 403 | — |
| Twint | SOCMINT | https://github.com/twintproject/twint | deprecated | 200 | — |
| Namechk | Username | https://namechk.com | restricted | 403 | — |
| Telepathy | SOCMINT | — | unchecked | — | sin URL pública |
| Social Analyzer | SOCMINT | — | unchecked | — | sin URL pública |
| archive.today | Archive | https://archive.ph | broken | — | fetch failed |
