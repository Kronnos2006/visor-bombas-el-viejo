# Fotos privadas compartidas de VOCATUS

Proyecto Supabase: gtfqhljbxyanfyrarykw. Visor: https://visor-bombas-el-viejo.vercel.app/?s=historial

## Uso

En Fotos, conectar la cuenta, crearla si hace falta y confirmar el correo. Solo un correo confirmado incluido en la lista privada de miembros puede consultar fotos; admin/editor pueden actualizar; viewer solo consulta. Usar la misma cuenta en cada dispositivo personal. No compartir contraseñas entre personas.

Una foto nueva queda primero en IndexedDB y se sube automáticamente. Realtime y una consulta de respaldo cada 15 segundos actualizan la selección abierta; al volver a la pestaña o recuperar internet se consulta otra vez. El navegador debe estar abierto para terminar subidas pendientes. Sin sesión o internet, conserva la copia local. Las fotos anteriores a esta función y las importadas se comparten mediante «Compartir fotos locales pendientes» en cada equipo/referencia. Este botón no publica otras bombas ni las comparte sin autenticación.

Si otra persona cambió la misma categoría desde la revisión vista, se conserva la local y se muestra la foto en línea para compararlas. Elegir expresamente cuál conservar. Los archivos en Storage son inmutables y las versiones confirmadas quedan en vocatus_photo_versions. Elegir la foto en línea archiva la local en IndexedDB antes de retirarla de la vista.

Los datos de formularios e intervenciones siguen con su almacenamiento existente. La sincronización con Obsidian sigue siendo una acción explícita; confirmar una foto en Supabase no limpia la cola de Obsidian. No se tocaron fichas reales, Revit ni USB.

## Instalación y seguridad

Aplicar fotos-compartidas.sql y luego fotos-compartidas-proteger.sql, en ese orden, solo al instalar en un proyecto nuevo. Ya aplicados en el proyecto indicado; no repetir. Bucket vocatus-photos privado, máximo 8 MB, JPEG/PNG/WebP. La aplicación comprime imágenes a JPEG antes de subirlas. Auth exige correo confirmado y autorización en vocatus_auth.members. No existe acceso anónimo ni escritura directa sobre las tablas; publicar pasa por una función que comprueba identidad, archivo subido y revisión. La función con privilegios elevados vive en un esquema privado, usa search_path vacío y verifica autorización antes de cualquier lectura o escritura.

cloud-photos-config.js contiene únicamente URL y clave PUBLICABLE, diseñada para incluirse en el navegador. No contiene service_role, contraseñas ni tokens MCP. Auth y RLS determinan el acceso. Los correos autorizados no se publican en GitHub.

Configurar en Authentication / URL Configuration: Site URL https://visor-bombas-el-viejo.vercel.app y Redirect URLs https://visor-bombas-el-viejo.vercel.app/**. Este ajuste no está disponible en el MCP instalado y se solicitó al administrador.

Para autorizar integrantes, insertar su correo en minúsculas y rol en vocatus_auth.members desde una sesión administradora de Supabase. Cada integrante crea y confirma su propia cuenta. Poner active=false revoca consultas y escrituras posteriores. No usar claves de servicio en el visor.

Reconstruir el SDK público con npm run build:photos después de npm ci. El archivo generado vendor/supabase.js está versionado para el despliegue estático. No requiere variables secretas de Vercel.

## Comprobaciones del 2026-10-29

- npm test: 176 pruebas aprobadas.
- npm run guard:historial: aprobado.
- test-fotos-compartidas.sql ejecutado en Supabase: editor publica, viewer consulta sin editar, cuenta ajena no lee fotos ni objetos, revisión atrasada falla, versiones se conservan y las identidades no se mezclan. Usuarios y objetos sintéticos revertidos mediante rollback.
- HTTP real con clave publicable sin sesión: tabla y RPC de permisos devuelven 401 / 42501.
- Asesor de seguridad: solo avisos informativos de RLS sin políticas en dos tablas privadas que deben negar acceso directo (members y project_info).
- Pendiente validación visual y prueba de dos dispositivos con la cuenta real. La automatización del navegador falló al inicializar; no se presenta como realizada.

## Recuperación de guardado y lectura — 2026-10-29

Se corrigieron fallos reproducidos mediante pruebas: un error de IndexedDB podía bloquear la consulta de fotos compartidas; los errores de inicio de subida quedaban ocultos; al reemplazar una foto con la caché invalidada podía perderse la revisión anterior y producir un conflicto innecesario. Ahora los errores y las fotos pendientes son visibles, se conserva la revisión confirmada y se consulta Supabase aunque falle el almacenamiento del dispositivo. Se añadió el botón Actualizar fotos en línea y el número de fotos confirmadas de la bomba abierta.

181 pruebas y barrera Historial aprobadas. La consulta real mostró una cuenta confirmada, dos sesiones y una foto de referencia sin TAG con archivo almacenado y permisos de lectura efectivos. Esto no demuestra por sí solo que la visualización funcione en el teléfono del usuario. La automatización visual continuó fallando al inicializar el runtime, por lo que esa comprobación sigue pendiente.

## Fotos HEIC del teléfono — 2026-10-29

En el video del usuario, alrededor del segundo 28, el selector de Placa de la bomba contiene un archivo .heic y la foto anterior sigue visible. La preparación solo usaba createImageBitmap, sin conversión para navegadores que no abren HEIC. Se añadió conversión local dinámica con heic-to 1.6.7, variante CSP, ejecutada en worker, y posterior reducción a JPEG de lado máximo 1800 px. Solo se sube el JPEG al bucket privado. El conversor se descarga al necesitarlo por primera vez, después de intentar la apertura nativa.

Se admiten originales de hasta 32 MB para comprimirlos; el límite remoto de 8 MB permanece. Los errores y el progreso se muestran junto al selector. Se libera el selector para reintentar el mismo archivo y se pausa el refresco automático mientras está abierto o preparando una imagen. La cancelación nativa libera la pausa.

Prueba del decodificador real con HEIC sintético de 64×48 píxeles: dimensiones, cantidad de píxeles, opacidad y variación de color comprobadas en worker. No se usaron fotos privadas como fixture. La automatización visual del teléfono no está disponible; queda pendiente repetir la selección del usuario en su dispositivo.

Resultado final de esta corrección: npm test, 187/187 aprobadas; guard:historial aprobado. SDK HEIC reconstruido con npm run build:heic, sin cambios en credenciales ni políticas de Supabase.
