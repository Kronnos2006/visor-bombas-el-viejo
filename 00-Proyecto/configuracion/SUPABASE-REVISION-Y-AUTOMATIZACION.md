# Supabase: revisión y trabajo pendiente · 30 de octubre de 2026

## Estado comprobado

Proyecto: visor-bombas-el-viejo (gtfqhljbxyanfyrarykw). Revisión mediante consultas de solo lectura, asesores de Supabase y código de GitHub. Los tres módulos de integración comparados con la copia pública de Vercel coinciden después de normalizar los saltos de línea.

- 114 fotos actuales, 118 versiones y 119 objetos privados (29.572.512 bytes, unos 28,2 MiB).
- Ninguna foto actual ni versión apunta a un objeto inexistente. Cada foto actual coincide con su versión histórica; tamaños y MIME coinciden con Storage.
- Un objeto no tiene referencia en las tablas actuales ni históricas. No se ha borrado: puede corresponder a una subida que no terminó de publicarse.
- Bucket privado, máximo 8 MiB, JPEG/PNG/WebP. RLS activa. No hay lectura anónima ni escritura directa en las tablas de fotos. Publicar exige RPC, identidad autorizada y revisión esperada.
- Realtime incluye vocatus_photos. Prueba con el rol authenticated y la identidad de un editor confirmado: 114 fotos y 119 objetos visibles. Es una comprobación SQL, no una prueba desde un teléfono.
- Cinco migraciones aplicadas. No se repiten los scripts de instalación sobre la base existente.
- Estadísticas acumuladas: lectura por equipo ~1,56 ms de media (1.025 consultas); permisos ~3,67 ms (2.738 consultas); publicación ~12,15 ms (118 consultas). No son mediciones de red ni de experiencia del teléfono.
- El asesor de rendimiento solo indica un índice sin uso registrado. Se conserva: protege la referencia updated_by hacia auth.users. No hay evidencia que justifique índices adicionales o más capacidad.
- Seguridad: protección de contraseñas filtradas desactivada. Las dos tablas privadas sin políticas son deliberadas: RLS y revocación de permisos impiden el acceso directo. No deben abrirse para eliminar ese aviso.

## Qué sincroniza hoy y qué falta

| Información | Persistencia actual | Trabajo necesario |
| --- | --- | --- |
| Fotos del equipo y sus versiones | Supabase + copia local del navegador | Respaldo de archivos privados y prueba entre dispositivos |
| Datos de ficha y levantamientos | Fichas de Obsidian en local; borradores del navegador en Vercel | Modelo compartido, revisiones, importación y aplicación al visor |
| Informes de mantenimiento | Obsidian en local; navegador en Vercel | Guardado compartido, adjuntos, historial y recuperación |
| PDF y evidencias de intervenciones | Adjuntos de Obsidian o almacenamiento del navegador | Bucket privado específico y referencias verificadas |

El usuario ha elegido sincronizar también fichas e informes. Esa ampliación todavía no está implementada. No se presenta el borrador local como dato ya sincronizado. No se han modificado las fichas reales ni aplicado migraciones de esta ampliación.

## Herramientas implementadas en esta revisión

Comandos desde la raíz, con Node 24:

    npm run audit:supabase
    npm run backup:supabase
    npm run verify:supabase -- --input RUTA/manifest.json

- auditar-supabase.sql: doce comprobaciones de integridad, acceso, bucket y Realtime. Solo SELECT; devuelve cantidades y estados, sin fotos, correos ni tokens.
- supabase-operaciones.mjs audit: consulta el SQL usando la Management API con read_only=true. Sin token falla expresamente. Genera JSON y Markdown en informes-auditoria, excluido de Git.
- exportar-supabase.sql: exporta en una sola consulta los datos de aplicación, objetos y catálogo de estructura (columnas, funciones, permisos, políticas, índices, restricciones, triggers). No exporta contraseñas ni sesiones de Auth.
- backup: crea una carpeta única fuera del repositorio, conserva versiones y descarga todos los objetos catalogados, incluyendo el objeto sin referencia. Revisa el tamaño y calcula SHA-256. No escribe ni borra en Supabase.
- verify: relee los archivos, verifica SHA-256, tamaños y la presencia de todos los objetos. Un respaldo con imágenes ausentes o alteradas falla aunque alguien marque el manifiesto como completo.
- audit --input captura.json permite procesar una captura anterior; el informe indica expresamente la fecha y que no es una consulta actual.
- backup --input datos.json permite completar un export previo con la sesión de Storage. También reconoce el archivo hermano estructura.json de la exportación inicial.
- El JSON y los archivos son un respaldo de aplicación. No sustituyen pg_dump, la configuración completa de Auth ni un ensayo de restauración.

No guardar respaldos dentro de public, GitHub o los artefactos públicos de CI. El script rechaza como destino una carpeta dentro del repositorio. Los secretos se proporcionan por entorno o .env local ignorado por Git; no como argumentos.

## Credenciales necesarias para ejecución desatendida

La conexión de Supabase de este chat permite la auditoría SQL. No entrega sus tokens al equipo local ni a GitHub Actions.

Para las consultas de auditoría y exportación: SUPABASE_ACCESS_TOKEN. Preferir un token acotado al proyecto y lectura de Database; comprobar que el permiso permite leer las tablas privadas de la exportación. Ante un rechazo no se amplían permisos automáticamente.

Para descargar imágenes privadas, una de estas opciones:
- SUPABASE_STORAGE_TOKEN: access token vigente de una cuenta autorizada. Es temporal y no sirve por sí solo para un trabajo diario permanente.
- SUPABASE_SECRET_KEY: clave secreta de servidor de este proyecto, guardada únicamente en el entorno privado del proceso que respalda. Permite más acceso; no incluirla nunca en el frontend.

Sin acceso a Storage se conserva la exportación de datos, pero manifest.json indica complete=false y el proceso termina con código 1. Se ha verificado ese comportamiento con la exportación real: 119 objetos esperados y cero imágenes descargadas. No se afirma que el respaldo esté completo.

## Automatización preparada

.github/workflows/supabase-auditoria.yml permite ejecución manual y tiene una programación diaria a las 06:00 de Costa Rica (12:00 UTC).

Para activarla:
1. Configurar el secret SUPABASE_AUDIT_TOKEN en GitHub con el token acotado de lectura.
2. Ejecutar manualmente y comprobar los resultados.
3. Activar la variable SUPABASE_AUDIT_ENABLED=true.

La programación queda desactivada mientras falta esa variable. No se ha creado ni inventado ningún secreto. El workflow solo conserva el resumen de integridad siete días; no exporta integrantes ni imágenes.

Un control con gravedad error hace fallar el proceso. Los avisos, como un archivo sin referencia, aparecen en el informe sin borrarlo ni convertirlo en fallo de integridad. La protección de contraseñas, SMTP y URLs de Auth requieren una comprobación administrativa aparte.

Los respaldos periódicos necesitan un destino privado, credenciales de Storage duraderas y una política de conservación. No se ha programado una tarea que vaya a fallar por falta de credenciales ni se han enviado los datos privados a GitHub. Antes de aplicar borrados por antigüedad, comprobar una restauración en un proyecto de prueba.

## Orden para terminar la configuración

| Prioridad | Acción | Estado |
| --- | --- | --- |
| 1 | Completar la descarga de imágenes y verificar los 119 objetos | Script listo; falta credencial de Storage |
| 1 | Verificar restauración en entorno de prueba, sin tocar producción | Pendiente |
| 1 | Revisar contraseñas filtradas, URLs de retorno, SMTP y recuperación de cuenta | Asesor detectó contraseñas filtradas desactivadas; resto no comprobado |
| 2 | Activar auditoría diaria con token acotado | Workflow listo; falta secret/variable |
| 2 | Sincronizar fichas, informes y adjuntos | Alcance confirmado; diseño siguiente |
| 3 | Revisar objetos sin referencia con su fecha y cola de subidas | Uno detectado; sin borrado automático |
| 3 | Medir consultas y revisar capacidad conforme aumente el uso | No ampliar por las métricas acumuladas actuales |

La protección contra contraseñas filtradas puede depender del plan; comprobar disponibilidad antes de cambiar nada que implique coste.

## Diseño de la ampliación aprobada: fichas e informes

1. Identidad estable: usar TAG validado para fichas existentes y un identificador separado para representaciones sin TAG. No asignar un TAG a una referencia por similitud de nombre o foto.
2. Fichas: tabla de estado actual y tabla de versiones inmutables. Cada actualización exige revisión esperada; un conflicto devuelve 409 y conserva las dos propuestas para revisión. Mantener responsable, fecha, evidencia y motivo de retirada de un dato.
3. Informes: UUID generado antes de subir y clave de idempotencia para no duplicar una intervención si se pierde la respuesta. Equipo, fecha, responsable, texto, mediciones y estado funcional con validación de servidor y restricciones SQL. Ediciones con revisión e historial; bajas mediante archivo recuperable.
4. Adjuntos: bucket privado distinto para PDF/evidencias, rutas inmutables y límites explícitos. Subir primero, confirmar existencia/tamaño/tipo y publicar después en una transacción. No almacenar base64 de PDFs grandes dentro de JSON de la tabla.
5. Permisos: reutilizar la lista privada de miembros (admin/editor/viewer), con comprobación de correo confirmado. Lectura con RLS; escrituras por RPC privada que comprueba identidad y revisión. No publicar claves de servicio ni permitir escrituras directas que eludan las revisiones.
6. Cola local: IndexedDB por cuenta, equipo y operación; estado pendiente/confirmado/conflicto y reintentos limitados. No limpiar una cola hasta recibir confirmación del identificador y revisión correctos. La caída de internet conserva el trabajo.
7. Convivencia con Obsidian: aplicar cambios a la bóveda mediante una acción identificable y con respaldo, evitando un ciclo de importación/exportación. Los datos confirmados de Supabase deben mostrarse y exportarse coherentemente en ficha e informe/PDF.
8. Migración: mostrar un inventario de datos locales antes de importarlos, separar DEMO de registros reales y conservar los originales. No asumir que los informes de distintos navegadores son distintos ni subir automáticamente datos de prueba.
9. Pruebas: dos sesiones y cuentas; editor frente a viewer y usuario ajeno; dos ediciones simultáneas; respuesta perdida; cambio de cuenta; conexión interrumpida; PDF y evidencias; archivo y restauración; copia Obsidian y exportación PDF.

Esta revisión identifica y prepara el trabajo. No habilita todavía el guardado compartido de fichas/informes ni cambia el alojamiento publicado.

## Referencias

- [Backups: los archivos de Storage se respaldan aparte](https://supabase.com/docs/guides/platform/backups)
- [Descargas de buckets privados](https://supabase.com/docs/guides/storage/serving/downloads)
- [API de consulta con read_only](https://supabase.com/docs/reference/api/v1-run-a-query)
- [Tokens acotados para automatizaciones](https://supabase.com/docs/guides/platform/personal-access-tokens)
- [Protección de contraseñas filtradas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [Índices sin uso registrado](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)
- [Tablas privadas con RLS sin políticas](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)

## Validacion de esta entrega

- Auditoria SQL real: 11 controles aprobados y 1 aviso (archivo sin referencia), sin cambios de datos.
- Exportacion SQL real ejecutada correctamente y guardada fuera de Git.
- Suite completa en boveda temporal aislada: 234 pruebas aprobadas, cero fallos.
- Proteccion de Historial: aprobada.
- Pruebas de los scripts: rutas inseguras, descarga truncada, corrupcion de archivo, respuesta 401 y respaldo incompleto.
- El transporte HTTP de los scripts contra la Management API y las descargas privadas reales siguen pendientes de credenciales locales. Las consultas SQL si se verificaron mediante la conexion Supabase del chat.
