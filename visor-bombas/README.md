# Atlas de mantenimiento · Vocatus

Visor local unificado del sector fotografiado. Se abre en http://127.0.0.1:8766 y escucha únicamente en esta PC. La ficha, fotografías, historial, despiece e IA de cada bomba aparecen dentro de la misma experiencia.

## Abrir

Para trabajar con Obsidian, usar `Iniciar visor.cmd`. El lanzador detecta la bóveda **Vacatos** de esta instalación. `OBSIDIAN_VAULT` permite seleccionar otra ruta. El sector tiene 12 posiciones Bxx, incluyendo B22 sin uso; los datos técnicos se leen de las fichas `00-Proyecto/equipos/Bxx.md`, mientras el código del sector aporta fotos y geometría ilustrativa.

Se necesita Node.js. El lanzador busca primero el runtime disponible en esta PC y después `node` en PATH. Las medidas, asociaciones, códigos e historiales preparados para la propuesta siguen rotulados DEMO / POR CONFIRMAR.

## Trabajar en GitHub Codespaces

El repositorio incluye `.devcontainer/devcontainer.json`. Al abrirlo en Codespaces, el servidor usa automáticamente `demo-vault`, escucha el puerto 8766 y GitHub abre una vista previa privada. Ejecutar `npm start` si la terminal no lo inicia automáticamente.

Codespaces se usa para desarrollar y revisar la propuesta. No es el alojamiento permanente. El puerto debe mantenerse **Private** y los cambios deben guardarse con Git antes de eliminar el Codespace. La bóveda real de Obsidian, las claves y los informes reales no se incluyen en el repositorio.

## Expedientes integrados

- La barra lateral muestra las doce posiciones del sector fotografiado disponibles en la bóveda.
- Cada selección abre su foto exterior, foto de placa asociada para la demo, ficha, historial, despiece e IA.
- En local, los informes y sus PDF se guardan en `00-Proyecto/Mantenimiento` de la misma bóveda. Al eliminar, pasan a la papelera de Obsidian. Los reportes antiguos del navegador pueden importarse desde Historial; se conservan hasta completar el guardado.
- En Vercel los reportes se guardan solo en ese navegador. El servidor informa que no tiene escritura persistente.
- En modo real el gráfico utiliza solo mediciones registradas. Campos sin presión o caudal quedan vacíos; los informes sin mediciones permanecen en la lista y no añaden puntos al gráfico.
- P-9001 y P-9002 permanecen solamente como datos internos de prueba automática y no aparecen en la interfaz.

## Funciones

### Anatomía de la bomba

Al seleccionar un equipo activo aparece la barra **Anatomía de la bomba**. Ofrece conjunto, corte visual de un cuarto de las cubiertas, transparencia, aislamiento de una pieza seleccionada, centrado y reinicio. Las etiquetas se separan para evitar solapamientos y mantienen líneas hacia sus anclajes. La selección en el modelo o en la lista consulta la misma ficha del componente.

El corte afecta solo las cubiertas; no elimina el impulsor, el eje ni el sello. Es una visualización ilustrativa por clipping, sin superficies de corte cerradas, y no un CAD dimensionado del fabricante. Las piezas no representadas para la familia Goulds continúan ocultas. Los controles no se habilitan para B22 sin uso ni cuando WebGL no está disponible. Se respeta la preferencia de movimiento reducido.

Integración inspirada en el flujo 3D de **Anatomy**, de Ryan, y en la adaptación en español facilitada por el usuario. Se mantiene la biblioteca Three.js ya incluida en el visor. Licencia original: `public/licenses/anatomy-MIT.txt`. Verificar con `node --test test-anatomy.mjs` o con `npm test` desde la raíz.

Vista superior ilustrativa, acercamiento a la bomba, rotación y despiece de 10 piezas según ANSI/ASME B73.1 (desarme posterior): carcasa, empaque de carcasa, impulsor abierto, tapa de carcasa, cámara de sello, sello mecánico, eje, bancada de rodamientos, acople espaciador y motor brida JM. Cuando el Excel documenta Tipo 21, el visor lo identifica como sello mecánico por componentes con fuelle elastomérico; no es un cartucho. En las bombas LF cuyo sellado está vacío, el tipo permanece POR CONFIRMAR. La arquitectura es una referencia de la norma y la geometría no está dimensionada; ninguna medida del modelo sirve para comprar. Fichas YAML con sellos, o-rings, historial e informes. Descarga de documentos vinculados que existan en la bóveda.

`public/realismo.js` añade entorno procedural de reflejos, materiales PBR, mapas de rugosidad, luces y sombras, tone mapping ACES Filmic y salida sRGB. Se aplica tras construir la bomba y se refresca al reconstruir la planta. No requiere HDRI ni texturas externas.

La iluminación mejora la apariencia. La arquitectura del despiece es la de la norma B73.1, pero la geometría no está dimensionada: ninguna medida del modelo es una especificación de compra. Las posiciones no proceden del plano real. El dibujo no confirma la construcción de una bomba ni su aptitud para alcohol. La adaptación requiere documentación, datos y despiece verificados del equipo instalado. No convierte DWG/NWD, no utiliza sensores ni hace diagnóstico predictivo.

## Gemini

Agregar la clave API en «Conectar Gemini» o mediante `GEMINI_API_KEY`. La clave introducida en el diálogo solo se conserva en memoria hasta cerrar el servidor.

Cada consulta lee y envía a Google el expediente DEMO integrado de la bomba seleccionada; no envía planos. El contexto identifica los datos ficticios y pendientes. Sin clave no hay respuestas simuladas. Se necesitan internet, un modelo disponible y cuota. La suscripción a un chat no configura la API automáticamente. Las hipótesis requieren revisión técnica. El chat no se guarda automáticamente en Obsidian.

## Configuración

- `VOCATUS_DEMO=1`: usa exclusivamente `demo-vault`, incluso si existe `OBSIDIAN_VAULT`.
- `VOCATUS_DEMO=0` o ausente en local: usa `OBSIDIAN_VAULT`, la bóveda `Vacatos` junto al visor si existe, o la base `00-Proyecto` del checkout.
- `OBSIDIAN_VAULT`: ruta de la bóveda real con `00-Proyecto/bombas` y `00-Proyecto/equipos`.
- `GEMINI_API_KEY`, `GEMINI_MODEL`: configuración opcional de Gemini.
- `PORT`: 8766 por defecto.
- `VOCATUS_CLOUD_DEV=1`: habilita el host temporal de Codespaces, escucha en la interfaz del contenedor y fuerza datos DEMO.

## Dependencias

Three.js 0.170.0 y js-yaml 4.1.0 están incluidos localmente con sus licencias. `node setup.mjs` los vuelve a descargar si es necesario. `realismo.js` utiliza Three.js y Canvas del navegador; no añade otra librería. El visor funciona sin internet después de instalar las dependencias; Gemini requiere conexión.

## Verificación

- `node --test test.mjs`: YAML, fichas reales, rutas y controles de acceso.
- `node test-layout.mjs`: separación geométrica de tanques, bombas y pedestales.
- `node test-sector.mjs`: escena fotográfica, expedientes DEMO, 15 tanques y fotografías vinculadas.
- `node test-sector-confirmado.mjs`: B22 visible como SIN USO sin fabricante atribuido; sello registrado separado de la referencia del fabricante (la consulta no modifica la ficha).
- `node test-demo.mjs`: fichas demo, selección inválida, documento vinculado y guardado/lectura de un informe temporal que se elimina al terminar.
- `node --test test-integration.mjs test-config.mjs test-reportes.mjs`: Bxx, cambios en Obsidian, guardado y recarga de informes/PDF, papelera, importación idempotente, fechas, modos de nube y mediciones ausentes.
- Desde la raíz del repositorio: `python -B 00-Proyecto/scripts/test_exportar_cmms.py` comprueba formatos nuevo y antiguo, activos Bxx, exclusión DEMO y referencias válidas.

El exportador lee `Mantenimiento` y también la carpeta histórica `informes-mantenimiento`. Acepta `tag` o el antiguo campo `bomba`, recupera el responsable antiguo del cuerpo y excluye informes DEMO. `OBSIDIAN_VAULT` selecciona la misma bóveda que el visor.
- `node --check server.mjs`, `node --check public/app.js`, `node --check public/realismo.js`: sintaxis.

Los parches ya aplicados, la auditoría antigua y el respaldo de app.js están en `archivo/`. No se ejecutan para instalar o iniciar el visor.

Documentación de Gemini: https://ai.google.dev/api/

## Documentación en Obsidian

Abrir `00-Proyecto/Documentacion-visor/00-Inicio.md` en la bóveda real. Incluye manual, arquitectura, pruebas, pendientes y código completo propio en notas legibles. `node tools/documentar.mjs` regenera el inventario y la copia documental de la revisión del 2026-10-07; no ejecuta pruebas. Antes de una nueva revisión, actualizar su fecha y conclusiones. La copia documental no es la aplicación activa.

## Publicar en Vercel (versión DEMO, solo lectura)

`api/index.mjs` y `vercel.json` publican el visor en Vercel con los datos DEMO. En Vercel: **Add New → Project**, importar este repositorio y poner **Root Directory = `visor-bombas`**. Las fotos y el visor se sirven desde `public/`; la API de lectura (`/api/bootstrap`, `/api/pump`) corre como función. En Vercel no funcionan Gemini ni «Guardar informe» (carpeta de solo lectura, sin clave persistente). La bóveda real, los planos y las claves no se incluyen.
