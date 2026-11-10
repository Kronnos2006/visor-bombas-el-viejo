Continúa el levantamiento técnico, despiece y reconstrucción CAD de las bombas de la planta Vocatus / Azucarera El Viejo. Trabaja sobre el expediente y los CAD adjuntos (ZIP «Vocatus-Claude-parte-01»). La primera mitad (Hidromac 2196, Hidromac AZ, Titan 4196, Durco Mark 3, Goulds e-SH, LL-124 y PACO) ya está hecha: sus tablas están en la carpeta `00-Proyecto/despiece-bombas/` de la rama `codex/despiece-bombas` y en los documentos del proyecto «vocatus». Úsalas como ejemplo de formato.

ALCANCE: un modelo a la vez, en este orden
1. Multisteel RSA 25/205 — B15, B16
2. Multisteel RA65/300 — B48, B55, B57
3. Multisteel RSA32/2025 (RSA 32/205 candidata) — B61
4. Ebara EVMSU5-9 (AEVMSU5-9F0500T3S) — B69, B70
5. Grundfos CR15-6 (CR15-6K-GJ-A-E-HQQE-NX2) — B71, B72
6. KSB Movitec VF 4/8 B — B73
7. SB 15-5(M), marca por confirmar — B59
8. SB 20-6(M), marca por confirmar — B77–B80

Si varias bombas comparten una configuración verificada, vincula todos sus TAG al mismo despiece y CAD.

ANTES DE EMPEZAR
- Usa la skill `levantamiento-bombas-vocatus` si está disponible.
- Lee la guía del ZIP y, del expediente, solo la sección del modelo (busca con grep por modelo o TAG y abre ese rango de líneas).
- Lee el documento del proyecto `claude/placas-visor-cotejo-2026-11-09.md` para ver cómo se leyeron las placas.

PRIMERO, LAS PLACAS DEL VISOR (las fotos ya están ahí; no pidas fotos que ya existen)
1. Las fotos van por LUGAR, no por TAG. Para saber qué lugar corresponde a cada TAG, abre `visor-bombas/public/modelos/asignacion-bombas.json` del repositorio Kronnos2006/visor-bombas-el-viejo. El campo `id` es el lugar y `tag` es el TAG actual.
2. Lista las fotos en Supabase (proyecto `gtfqhljbxyanfyrarykw`, SOLO LECTURA) con:
   `select entity_key, slot, object_path from vocatus_photos where slot like 'placa%' and entity_key in (...)`.
3. El bucket es privado. Para ver las fotos, abre el visor en Chrome (https://visor-bombas-el-viejo.vercel.app, ya con sesión) y en la consola de la página usa `import('/cloud-photos.js')` → `workflowConnection()` → `client.storage.from('vocatus-photos').createSignedUrls(paths, 1800)`.
   - No hagas capturas sobre la página del visor: el 3D congela las capturas. Navega a una página liviana del mismo sitio (por ejemplo `/modelos/asignacion-bombas.json`), pasa las URLs con localStorage (y bórralo después) y muestra las fotos reducidas con canvas, de 2 a 4 por pantalla.
   - Para leer una placa, amplíala o rótala sola en pantalla.
   - Cierra la pestaña al terminar.
4. Anota marca, modelo, tamaño, serie, diámetro y material de cada placa. Anota también los rodamientos que aparezcan en la placa del motor.

LECCIONES DE LA PRIMERA MITAD (aplícalas)
- Los rodamientos del Excel suelen ser del MOTOR, no de la bomba (confirmado con placas en B24, B39, B41, B44 y B45). No los asignes a la bomba sin la placa del soporte o el código grabado en el rodamiento.
- Una foto vieja puede tener el TAG anterior del lugar (la placa «B41» era de B24). Cruza siempre con `asignacion-bombas.json`.
- Si una norma fija cotas por designación (como ASME B73.1 en las ANSI, o EN 733 / ISO 2858 en las bombas DIN de Multisteel, ABS y otras), úsala para el patrón de pies, el eje y las bocas. Indica la norma como fuente y deja como pendiente lo que la norma no fija: rodamientos, camisa y sello.
- Los códigos del Excel pueden ser códigos de kit o de pedido, no el modelo (15SH06K6 era el kit de la parte de bomba). Verifícalo en el catálogo.
- Si los datos del Excel no cuadran entre sí (caudal, altura, potencia, rpm y diámetro), haz una verificación rápida con leyes de afinidad y márcala como «estimada».

BÚSQUEDA CON POCOS TOKENS
- Usa TinyFish search y fetch antes que el buscador normal.
- Si un PDF sale vacío (escaneado) o bloqueado, cambia el criterio de búsqueda una sola vez. Si sigue sin dato, regístralo como pendiente y pide al usuario el PDF local por nombre y página.
- La consola del espacio de trabajo no descarga de sitios externos. Guarda las respuestas largas de fetch en un archivo y busca dentro con grep.
- No repitas investigación que el expediente ya tiene.

REGLAS DE EVIDENCIA
- Distingue la posición del despiece del código de pedido. Si falta el código: «pendiente por serie».
- Estado de cada medida: catálogo, medida en campo, estimada por foto o pendiente.
- Si el Excel y la placa no coinciden, conserva ambos datos y di qué evidencia falta para resolverlo.
- Etiqueta cada DXF por su alcance (pieza acotada, interfaz parcial, envolvente exterior o vista explotada). Ninguno es plano de fabricación.
- DXF con ezdxf, en mm (`$INSUNITS` = 4), con capas por estado. Reabre cada DXF y comprueba unidades, capas, medidas y que `audit()` no dé errores.

ENTREGABLES POR MODELO
1. Archivo `<Modelo>-tabla-piezas-y-pendientes.md` con la tabla: Posición | Pieza | Código de repuesto | Variante y TAG | Medidas y unidades | Material | Estado | Fuente y página | Archivo CAD.
2. Lista de cotas pendientes de campo: pieza, medida exacta, cara o eje de referencia, y foto o plano que la verifica.
3. CAD solo si hay medidas nuevas que lo justifiquen; si no, vincula al DXF existente.
4. Nota breve en el expediente junto a la sección del modelo, con enlaces.
5. Registro de sesión al final de la tabla: fecha, modelo, qué se resolvió, archivos, pendiente clave y siguiente acción.

GUARDAR
- Copia los archivos .md a `00-Proyecto/despiece-bombas/` en la rama `codex/despiece-bombas`. Haz commit y push (sin push forzado). NO fusiones a `main`.
- `.gitignore` excluye DXF y XLSX: no lo cambies sin permiso, porque el repositorio es público.
- Guarda cada tabla en el proyecto con project_write (`claude/<modelo>-tabla-piezas-y-pendientes.md`).
- No subas claves, informes reales ni respaldos. En Supabase, solo lectura.

FORMATO DE RESPUESTA
Español sencillo. Archivos cambiados y un resumen de hasta cinco líneas por modelo: qué se resolvió, con qué evidencia y qué falta. Al terminar los 8 modelos, una lista corta de las fotos y medidas de campo que faltan, por TAG.
