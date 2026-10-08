# Atlas de mantenimiento · Vocatus

Visor local unificado del sector fotografiado. Se abre en http://127.0.0.1:8766 y escucha únicamente en esta PC. La ficha, fotografías, historial, despiece e IA de cada bomba aparecen dentro de la misma experiencia.

## Abrir

Para presentar la propuesta actual, usar `Iniciar visor.cmd`. El selector antiguo «Fichas de Obsidian / Sector fotografiado» fue retirado: ya no se muestran P-9001 y P-9002 como una planta aparte. Los nueve expedientes temporales BOMBA-A a BOMBA-J, salvo la letra H retirada del levantamiento, concentran fotografías, datos, historial, componentes e IA.

Se necesita Node.js. El lanzador busca primero el runtime disponible en esta PC y después `node` en PATH. Las medidas, asociaciones, códigos e historiales preparados para la propuesta siguen rotulados DEMO / POR CONFIRMAR.

## Trabajar en GitHub Codespaces

El repositorio incluye `.devcontainer/devcontainer.json`. Al abrirlo en Codespaces, el servidor usa automáticamente `demo-vault`, escucha el puerto 8766 y GitHub abre una vista previa privada. Ejecutar `npm start` si la terminal no lo inicia automáticamente.

Codespaces se usa para desarrollar y revisar la propuesta. No es el alojamiento permanente. El puerto debe mantenerse **Private** y los cambios deben guardarse con Git antes de eliminar el Codespace. La bóveda real de Obsidian, las claves y los informes reales no se incluyen en el repositorio.

## Expedientes integrados

- La barra lateral muestra únicamente las nueve posiciones del sector fotografiado.
- Cada selección abre su foto exterior, foto de placa asociada para la demo, ficha, historial, despiece e IA.
- Obsidian continúa como almacenamiento y documentación del proyecto; ya no aparece como una vista de trabajo separada.
- P-9001 y P-9002 permanecen solamente como datos internos de prueba automática y no aparecen en la interfaz.

## Funciones

Vista superior ilustrativa, acercamiento a la bomba, rotación y despiece de 10 piezas según ANSI/ASME B73.1 (desarme posterior): carcasa, empaque de carcasa, impulsor abierto, tapa de carcasa, cámara de sello, sello de cartucho, eje, bancada de rodamientos, acople espaciador y motor brida JM. La arquitectura es la de la norma, verificada contra las placas leídas; las medidas de cada pieza siguen pendientes del catálogo del fabricante. Fichas YAML con sellos, o-rings, historial e informes. Descarga de documentos vinculados que existan en la bóveda.

`public/realismo.js` añade entorno procedural de reflejos, materiales PBR, mapas de rugosidad, luces y sombras, tone mapping ACES Filmic y salida sRGB. Se aplica tras construir la bomba y se refresca al reconstruir la planta. No requiere HDRI ni texturas externas.

La iluminación mejora la apariencia. La arquitectura del despiece es la de la norma B73.1, pero la geometría no está dimensionada: ninguna medida del modelo es una especificación de compra. Las posiciones no proceden del plano real. El dibujo no confirma la construcción de una bomba ni su aptitud para alcohol. La adaptación requiere documentación, datos y despiece verificados del equipo instalado. No convierte DWG/NWD, no utiliza sensores ni hace diagnóstico predictivo.

## Gemini

Agregar la clave API en «Conectar Gemini» o mediante `GEMINI_API_KEY`. La clave introducida en el diálogo solo se conserva en memoria hasta cerrar el servidor.

Cada consulta lee y envía a Google el expediente DEMO integrado de la bomba seleccionada; no envía planos. El contexto identifica los datos ficticios y pendientes. Sin clave no hay respuestas simuladas. Se necesitan internet, un modelo disponible y cuota. La suscripción a un chat no configura la API automáticamente. Las hipótesis requieren revisión técnica. El chat no se guarda automáticamente en Obsidian.

## Configuración

- `VOCATUS_DEMO=1`: usa exclusivamente `demo-vault`, incluso si existe `OBSIDIAN_VAULT`.
- `VOCATUS_DEMO=0` o ausente: usa `OBSIDIAN_VAULT` o la bóveda real por defecto.
- `OBSIDIAN_VAULT`: ruta de la bóveda real con `00-Proyecto/bombas`.
- `GEMINI_API_KEY`, `GEMINI_MODEL`: configuración opcional de Gemini.
- `PORT`: 8766 por defecto.
- `VOCATUS_CLOUD_DEV=1`: habilita el host temporal de Codespaces, escucha en la interfaz del contenedor y fuerza datos DEMO.

## Dependencias

Three.js 0.170.0 y js-yaml 4.1.0 están incluidos localmente con sus licencias. `node setup.mjs` los vuelve a descargar si es necesario. `realismo.js` utiliza Three.js y Canvas del navegador; no añade otra librería. El visor funciona sin internet después de instalar las dependencias; Gemini requiere conexión.

## Verificación

- `node --test test.mjs`: YAML, fichas reales, rutas y controles de acceso.
- `node test-layout.mjs`: separación geométrica de tanques, bombas y pedestales.
- `node test-sector.mjs`: escena fotográfica, expedientes DEMO, 15 tanques y fotografías vinculadas.
- `node test-demo.mjs`: fichas demo, selección inválida, documento vinculado y guardado/lectura de un informe temporal que se elimina al terminar.
- `node --check server.mjs`, `node --check public/app.js`, `node --check public/realismo.js`: sintaxis.

Los parches ya aplicados, la auditoría antigua y el respaldo de app.js están en `archivo/`. No se ejecutan para instalar o iniciar el visor.

Documentación de Gemini: https://ai.google.dev/api/

## Documentación en Obsidian

Abrir `00-Proyecto/Documentacion-visor/00-Inicio.md` en la bóveda real. Incluye manual, arquitectura, pruebas, pendientes y código completo propio en notas legibles. `node tools/documentar.mjs` regenera el inventario y la copia documental de la revisión del 2026-10-07; no ejecuta pruebas. Antes de una nueva revisión, actualizar su fecha y conclusiones. La copia documental no es la aplicación activa.

## Publicar en Vercel (versión DEMO, solo lectura)

`api/index.mjs` y `vercel.json` publican el visor en Vercel con los datos DEMO. En Vercel: **Add New → Project**, importar este repositorio y poner **Root Directory = `visor-bombas`**. Las fotos y el visor se sirven desde `public/`; la API de lectura (`/api/bootstrap`, `/api/pump`) corre como función. En Vercel no funcionan Gemini ni «Guardar informe» (carpeta de solo lectura, sin clave persistente). La bóveda real, los planos y las claves no se incluyen.
