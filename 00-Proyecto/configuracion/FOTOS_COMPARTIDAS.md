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
