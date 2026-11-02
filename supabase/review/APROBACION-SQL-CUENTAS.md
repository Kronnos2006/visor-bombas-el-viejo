# Solicitud de aprobación del SQL · 2 de noviembre de 2026

**Pendiente de aprobación explícita. No se ejecutó DDL/DML en la base compartida.** Esta solicitud abarca únicamente el SQL indicado sobre `gtfqhljbxyanfyrarykw`; no autoriza push, merge, despliegue ni cambios de VISOR_PASSWORD. La subida de rama sigue bloqueada hasta confirmar protección y alcance de secretos en Vercel. La aplicación del SQL también se mantendrá en espera de esa confirmación.

## Artefacto exacto y pruebas

Archivo: `supabase/migrations/20261102193600_vocatus_cloud_accounts.sql`.

SHA-256 definitivo de sus bytes LF:
`50b0263cf0ac6b735ac3d5a85ef988645be44905eefd088be0ea6ef57448a851`.

Se volvió a consultar el historial de migraciones del proyecto temporal `rbiuaucawhmiqvqomqec`. Las dos aplicaciones completas coinciden con esta SHA al normalizar CRLF y la línea vacía terminal que añadió el registro de la herramienta. No existen diferencias de sentencias SQL. La migración completa, rollback completo y reaplicación ya se ejecutaron en esa base con datos exclusivamente sintéticos.

Ejecución completa `68a6fbd0-3e2f-4864-9173-26830d0f90d9`, evidencia `supabase/test/isolated-results.json`:

| # | Prueba real | Resultado |
| --- | --- | --- |
| 1 | Sesión posterior al corte dentro del mismo segundo, sin depender de iat | PASS |
| 2 | Miembro activo sin perfil obtiene perfil aprobado y conserva membresía | PASS |
| 3 | No miembros solicitan acceso y quedan pendientes | PASS |
| 4 | Autoaprobación, cambios del propio rol/estado y gestión directa bloqueados | PASS |
| 5 | Administrador aprueba y rechaza solicitudes | PASS |
| 6 | Miembro previo usa sesión previa para leer, subir, publicar y descargar foto | PASS |
| 7 | Pendiente y rechazado sin lectura/subida/publicación | PASS |
| 8 | Desactivación bloquea sesión abierta y su renovación; reactivar no revive el token antiguo | PASS |
| 9 | Usuario crea orden y la cierra con informe | PASS |
| 10 | Archivado solo administrador y auditado | PASS |
| 11 | Restablecer, cambiar contraseña y volver a entrar inmediatamente | PASS |
| 12 | Cambios simultáneos no dejan cero administradores | PASS |

Resultado: **12/12**. Comprobaciones posteriores del servidor/Storage: **3/3**; última suite `npm test`: **275/275**. Falta navegador del Preview protegido con usuario/admin en móvil y escritorio; no se presenta como realizado.

## Respaldo terminado y verificado sin claves

Ubicación fuera de Git, Documentos y OneDrive:
`C:\Users\josem\VocatusBackups\Supabase\2026-11-02T21-17-48-649Z-d4599c89`.

El script del propietario terminó el 2 de noviembre a las 15:19:32 Costa Rica. `verificacion-independiente.json` declara 119/119 descargados, 119/119 SHA-256 coincidentes en una segunda descarga, y verificación local correcta de 120 archivos. Se volvió a ejecutar `verify()` **sin claves y sin solicitudes de red**: relectura actual de los 119 binarios y `datos.json`, tamaños y SHA-256 correctos, cero fallos.

| Archivo privado | SHA-256 |
| --- | --- |
| manifest.json | `b4c4e11076a13902680ff20ebf5f318fae275b45f442d6bad7f396a1e8232739` |
| verificacion-independiente.json | `533b552d148df7ed9f588103b2d41a47fbe87bcac68d0e87e9b9b66808e812ad` |
| datos.json | `5abf57a61cb47d484511f23f9ee69293d7557e83cbfc50731f920bdcf06e0027` |

Es un respaldo lógico de la aplicación y sus archivos, no un pg_dump de Auth ni prueba de restauración del proyecto entero. Para revertir esta migración se conservan objetos nuevos por separado y se usan los SQL revisados; no se reemplaza el contenido real desde una copia.

## Conteos y huellas actuales de la base compartida

Consulta SELECT a las **15:21:01 Costa Rica del 2 de noviembre** (21:21:01 UTC). No cambió la línea base del respaldo.

| Recurso | Conteo | MD5 de metadatos |
| --- | ---: | --- |
| Fotos | 114 | `5f2d731d63ad1b9ab957b4e68e8cce47` |
| Versiones | 118 | `a7fc6227dfbb7174b287bd8aeaab264c` |
| Objetos Storage | 119 | `83437f1231d627807ed4125ae1bcc7cc` |
| Miembros | 1 | `c293a100984673852f1d4577910f6b3a` |
| Órdenes / informes | 0 / 0 | — |

El esquema `vocatus_access` todavía está ausente. Las MD5 de la tabla describen metadatos; las SHA-256 de cada binario están en el manifiesto privado verificado. Recapturar inmediatamente antes y después de una aplicación autorizada, y detenerse si cambia algún dato inesperadamente.

## Historial y secretos

Nueva auditoría sobre refs y reflogs: **151 commits, 1.304 blobs**, hasta `d2f060e`. Comparó 124 huellas de archivos privados —incluido el respaldo terminado— y 29 valores sensibles de QA/semillas. Cero rutas privadas, coincidencias de archivos, contraseñas/tokens, claves secretas o JWT service_role. La auditoría vuelve a ejecutarse después de guardar esta documentación; el resultado final se mantiene fuera del repositorio para no crear una referencia circular al propio commit.

Las carpetas de usuarios/sesiones QA y respaldo no están versionadas y tienen exclusiones explícitas si se copian al árbol. Sí hay código de cuentas, configuración pública de Supabase e identificadores/resultados sintéticos de pruebas; no son archivos de cuentas privadas ni sesiones o contraseñas reales. No se hará push antes de confirmar protección.

## Storage y concurrencia

Storage: HTTP 504, gateway ≈60042 ms, evento `ABORTED RES`, operación `storage.object.upload` ≈60000 ms. El archivo luego respondió GET 200 y las pruebas posteriores pasaron. **No se conoce la causa interna ni está demostrada su relación o independencia respecto de la migración.** No afirmar arranque en frío.

Concurrencia: ejecución completa registró un 200 y un 403. Se volvió a comprobar el rechazo con la cuenta degradada: **403 `QA_ADMIN_ONLY`**. La prueba SQL concurrente independiente devolvió un éxito y **42501 `ADMIN_ONLY`** después del bloqueo. Estado final comprobado: adminA administrador activo/aprobado, adminB usuario activo/aprobado; **1 administrador utilizable**. En ese orden, la protección opera porque el segundo actor perdió su rol antes de modificar al restante. Un 401 genérico histórico sin cuerpo conservado **no** se acepta como evidencia de esa regla; tampoco se aceptan 5xx ni fallos de red.

## Configuración pendiente de Vercel

1. Proyecto `visor-bombas-el-viejo` → Settings → Deployment Protection → Vercel Authentication → Standard Protection → guardar. Ese alcance protege los despliegues excepto los dominios de producción; no seleccionar All Deployments.
2. Revisar que el futuro Preview no esté en Deployment Protection Exceptions y no tenga Shareable Link ni bypass compartido.
3. Settings → Environment Variables → añadir/editar `SUPABASE_SECRET_KEY`: tipo Secret (Sensitive en interfaces anteriores), solo Preview, Git Branch exactamente `codex/cuentas-vercel`. No Production, Development ni All Branches. Pegar el valor solo en Vercel. No basta sobrescribir por rama si permanece una asignación general para todo Preview.
4. Limitar también la activación y configuración nueva a esa rama. Si el selector no permite escribir la rama porque aún no está subida, avisar; no subirla para resolverlo sin confirmar primero la protección. No modificar VISOR_PASSWORD.
5. Confirmar configuración sin compartir valores. Tras un despliegue futuro autorizado, comprobar URL única y alias de rama desde visita anónima sin cookies/bypass: deben exigir autenticación Vercel y no servir el visor ni la API. No hay todavía un Preview nuevo ni confirmación de estos ajustes.

Fuentes: [variables por rama](https://vercel.com/docs/environment-variables#preview-environment-variables), [Secret](https://vercel.com/docs/environment-variables/sensitive-environment-variables), [protección](https://vercel.com/docs/deployment-protection).

## Reversión y límites de la aprobación

1. Aplicar solo la transacción completa aprobada. Un error SQL revierte la transacción; no continuar por partes. Comparar conteos/huellas inmediatamente después.
2. Si un miembro pierde acceso, detener/restringir Preview y conservar respaldo, perfiles y bitácora. No quitar globalmente RLS ni restaurar fotos encima de actividad legítima.
3. Sin actividad de cuentas ni cambios de miembros, usar `cuentas-preview-rollback.sql`, probado completo en la base temporal. Quita solo objetos nuevos, después de exportar los nuevos perfiles/bitácora y revisar aprobación de la reversión; no borra fotos, versiones, miembros, órdenes ni informes.
4. Con actividad, el rollback completo aborta. Para pérdida involuntaria de un miembro inicial activo/confirmado, revisar la recuperación puntual ya probada: requiere su UUID y confirmación explícita; conserva rol, corte de sesiones y cambio obligatorio de contraseña, y exige iniciar sesión de nuevo. Otras causas requieren una recuperación específica conservando datos y bitácora.
5. No se cambia main, producción ni VISOR_PASSWORD. El SQL sí cambia autorización de la base compartida y puede afectar a clientes existentes: por eso requiere esta aprobación independiente del futuro despliegue.

La solicitud es: **autorizar exclusivamente la migración con SHA-256 indicada en `gtfqhljbxyanfyrarykw`, manteniendo su ejecución pendiente de confirmar alcance de secretos y protección del Preview.** No incluye push ni despliegue. El proyecto temporal sigue necesario para la validación pendiente y no se eliminó todavía.
