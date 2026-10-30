# Integración de la propuesta · 30 de octubre de 2026

La página principal mantiene sus cinco secciones, identidad, animaciones, botones y motor 3D. Añade órdenes de trabajo, relación con Bodega y Reportar, documentos, actividad del equipo y ajuste del panel. En teléfono se conserva el acceso explícito a 3D y despiece. Tocar una pieza lleva directamente a su información.

## Datos y conexión

- Se mantiene el mismo proyecto Supabase y la misma sesión `vocatus-photo-session`. No se reemplazan las fotos, sus versiones, sus claves ni la lista de miembros.
- Se añaden `vocatus_work_orders` y `vocatus_work_reports`, protegidas por RLS y la autorización existente del equipo. No se usa una clave privilegiada en el navegador.
- Adjuntos de mantenimiento: bucket privado `vocatus-maintenance`, con rutas por usuario y SHA-256. No se permite reemplazar ni borrar archivos.
- Las órdenes se cierran junto con su informe en una misma transacción. Se rechazan revisiones antiguas y reimportaciones con contenido diferente.
- Los informes anteriores de este navegador se comparten al conectar una cuenta autorizada. Se conservan las copias locales; los conflictos quedan pendientes de revisión y no reemplazan informes. No se pueden leer datos que quedaron en otro teléfono: ese dispositivo debe abrir el sitio con su cuenta o exportar su paquete existente.
- Archivar un informe conserva su fila y sus adjuntos. La migración SQL es aditiva y no altera las tablas de fotos existentes.
- En local continúa el guardado en Obsidian. En Vercel, las órdenes e informes usan Supabase al iniciar sesión. Sin sesión se conservan las opciones de guardado en el dispositivo.

## Verificación

`npm test`: pruebas existentes y las nuevas de órdenes/conexión. La migración se verificó con una transacción de prueba revertida: permisos, RLS, versiones, informe de cierre e idempotencia. Los conteos y hashes de las 114 fotos y 118 versiones coincidieron antes y después. Las pruebas de navegador se ejecutan con servicios externos bloqueados y bóvedas temporales.

El despliegue de producción anterior queda conservado en el historial de Vercel; no se hace push forzado. La base previa de Git es `16bfedf0d29a79b46525e2d678f62b429a444ef5`.
