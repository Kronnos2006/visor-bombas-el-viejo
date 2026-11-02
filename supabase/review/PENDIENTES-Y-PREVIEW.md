# Respaldo, historial y Preview · 2 de noviembre de 2026

No se aplicó SQL en `gtfqhljbxyanfyrarykw`. No se subió la rama. No se modificaron main, producción ni VISOR_PASSWORD.

## Respaldo privado

Destino preparado fuera del repositorio y de Documentos/OneDrive:
`C:\Users\josem\AppData\Local\VocatusBackups\Supabase`.

La captura lógica existente se copió como `captura-previa.json` y se volvió a comprobar su SHA-256: `d986aab764543a7a60c7e930d7199769b77aed34eda13d8aa7cb55006ac32c38`. La ruta es una carpeta local, sin enlace/junction observado. **Todavía no están descargados/verificados los 119 binarios.**

El conector MCP permite consultar SQL pero no exporta una credencial de descarga; no hay una credencial disponible en el entorno de Node. El control de Edge se detuvo por no poder determinar con suficiente confianza la URL actual y no se continuó por esa vía.

Para terminar, ejecutar en PowerShell:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\josem\Documents\ChatGPT\vocatos\cuentas-vercel\00-Proyecto\scripts\Completar-respaldo-cuentas.ps1"
```

La clave del proyecto compartido se pega exclusivamente en la entrada oculta local del script, desde Supabase → Settings → API Keys. No se solicita en el chat. El script realiza únicamente GET de Storage, guarda la credencial solo en memoria durante su ejecución y la limpia del entorno al terminar. No hace SQL ni modifica claves del proyecto. Puede utilizarse una clave de servidor existente; no requiere crear otra.

El script crea una subcarpeta fechada con JSON y los 119 archivos, verifica tamaño y SHA-256 releyendo los archivos locales y vuelve a descargar cada objeto para comparar una segunda SHA-256 independiente. Solo marca completo si coinciden los 119. El resultado final se guarda en `ultimo-respaldo-verificado.json`; cualquier fallo conserva el respaldo parcial y no lo declara aprobado.

## Auditoría de los commits

`audit-private-history.mjs` revisó refs y reflogs locales: **149 commits, 2.104 objetos únicos, 1.292 blobs**, no solo `git status`. Comparó las huellas de los 6 archivos privados presentes y 29 valores de contraseñas/tokens y contraseñas/hashes de las semillas privadas, y buscó rutas privadas y patrones de claves secretas/service_role. **Cero coincidencias.** Evidencia: `supabase/test/private-history-results.json`.

`work/private-cuentas-qa` y `Respaldos-supabase` están como carpetas hermanas del worktree, fuera de su raíz Git. Se añadieron reglas explícitas para excluirlas incluso si se copian accidentalmente dentro del árbol, además de `/work/` y `VocatusBackups`. El nuevo respaldo está en AppData Local y no es parte de ningún repositorio del proyecto. No se subieron estos datos ni se hará push mientras no se confirme la protección.

## Configuración exacta que debe hacer el propietario en Vercel

1. Abrir Vercel → proyecto `visor-bombas-el-viejo` → **Settings → Deployment Protection**.
2. Activar **Vercel Authentication** y elegir **Standard Protection** (todos los despliegues salvo dominios de producción). No seleccionar All Deployments porque también restringiría el dominio productivo. Guardar.
3. Revisar **Deployment Protection Exceptions**: el futuro dominio/alias de esta rama no debe estar exceptuado. No generar un Shareable Link ni un bypass público. No cambiar VISOR_PASSWORD.
4. Ir a **Settings → Environment Variables** y buscar `SUPABASE_SECRET_KEY`. Para esta integración debe existir únicamente una asignación a **Preview + Git Branch `codex/cuentas-vercel`**. No alcanza con crear una excepción de rama si queda otra asignación general para todo Preview. Si ya existe una asignación general, revisar su uso y quitar/restringir solo ese alcance; no cambiar variables productivas de otras funciones sin revisión.
5. Añadir/editar: nombre `SUPABASE_SECRET_KEY`, tipo **Secret** (en interfaces anteriores, Sensitive); marcar solo **Preview**, desmarcar Production y Development; en **Git Branch** seleccionar/escribir exactamente `codex/cuentas-vercel`, nunca All Branches. Pegar el valor únicamente en Vercel y guardar. Si la rama todavía no aparece y la interfaz no permite escribirla, avisar: no subir nada para resolverlo antes de confirmar la protección del paso 2.
6. Limitar también `VOCATUS_CLOUD_ACCOUNTS=1`, `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` a esa rama de Preview. No habilitar el acceso nuevo antes de la aprobación y aplicación futura del SQL; crear ahora variables no aplica SQL por sí mismo.
7. Confirmar solo los alcances y la protección guardados; no compartir valores ni capturas con claves visibles. Con esa confirmación se podrá verificar configuración y, cuando corresponda, subir la rama. Después del despliegue comprobar URL única y alias de rama desde una visita anónima, sin cookies ni bypass: debe exigir autenticación Vercel (sin servir HTML de la aplicación ni API). Solo entonces declarar el Preview protegido.

Fuentes oficiales consultadas: [variables por rama](https://vercel.com/docs/environment-variables#preview-environment-variables), [tipo Secret](https://vercel.com/docs/environment-variables/sensitive-environment-variables), [Deployment Protection](https://vercel.com/docs/deployment-protection), [excepciones y enlaces compartidos](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection). No hay acceso autenticado a Vercel disponible para afirmar que esta configuración ya fue aplicada.

## Qué ocurrió en Storage

El primer intento recibió HTTP 504: el gateway registró `response.origin_time=60042` ms a las 20:12:03 UTC. Storage registró `storage.object.upload`, `ABORTED RES`, `responseTime≈60000.33` ms. El mismo archivo luego respondió GET 200 a las 20:14:52 UTC y coincidió con la imagen sintética esperada. Las ejecuciones completas posteriores y la comprobación final de Storage pasaron.

**La causa interna no se conoce.** Los registros consultados no identifican qué produjo la demora ni prueban que sea independiente de la migración. No hay evidencia para llamarlo arranque en frío. Se comprobó la recuperación posterior, no una explicación causal.

## Rechazos concurrentes

En la ejecución completa válida, a las 20:32:05 UTC hubo una gestión 200 y otra petición al coordinador QA 403. El coordinador devuelve **`QA_ADMIN_ONLY`** cuando su llamante ya no es administrador. Se comprobó de nuevo con la sesión del administrador degradado: HTTP **403**, cuerpo **`QA_ADMIN_ONLY`**; evidencia en `concurrent-loser-result.json`.

La prueba SQL concurrente independiente produjo exactamente una escritura exitosa y un rechazo **SQLSTATE `42501`, mensaje `ADMIN_ONLY`**, dentro de `vocatus_access.manage`, después de adquirir el bloqueo. En esa ejecución ganó B y A quedó usuario. La ejecución completa posterior volvió a preparar las cuentas y ganó A.

Estado final consultado nuevamente: **adminA = admin, activo, aprobado, sin cambio obligatorio; adminB = usuario, activo, aprobado, sin cambio obligatorio; administradores activos utilizables = 1**. Así se conservó al menos uno: el segundo actor perdió el rol antes de poder modificar al restante. No fue necesario alcanzar el mensaje de último administrador en ese orden de ejecución.

Un HTTP 401 genérico NO se considera evidencia de la regla del último administrador. El runner antiguo agrupaba 401/403; no conservó todos sus cuerpos. No puede afirmarse que cualquier 401 histórico fuera el rechazo esperado. La evidencia aceptada aquí es el 403 con mensaje comprobado y el 42501/ADMIN_ONLY de la prueba SQL, junto con el estado final. Un 5xx o fallo de red tampoco cuenta como rechazo válido.

## SQL y captura actual

SHA-256 definitivo del archivo LF: **`50b0263cf0ac6b735ac3d5a85ef988645be44905eefd088be0ea6ef57448a851`**.

Se consultaron las dos entradas de la migración del proyecto temporal y se recalculó SHA-256 en PostgreSQL: coincide con ese archivo al normalizar CRLF y la línea vacía terminal añadida por el registro de la herramienta. No hay diferencias de sentencias SQL. Los 12 resultados completos siguen disponibles en `supabase/test/isolated-results.json` y detallados en RESULTADOS-AISLADOS.md.

Consulta compartida de solo lectura, 2 de noviembre 15:00:34 Costa Rica (21:00:34 UTC): fotos **114**, versiones **118**, objetos **119**, miembros **1**, órdenes **0**, informes **0**. Esquema `vocatus_access` ausente.

| Metadatos | MD5 actual |
| --- | --- |
| Fotos | `5f2d731d63ad1b9ab957b4e68e8cce47` |
| Versiones | `a7fc6227dfbb7174b287bd8aeaab264c` |
| Objetos | `83437f1231d627807ed4125ae1bcc7cc` |
| Miembros | `c293a100984673852f1d4577910f6b3a` |

Son huellas de filas; los SHA-256 binarios todavía están pendientes. No se pide aprobación compartida hasta completar respaldo y protección. El plan de rollback inicial y recuperación puntual de miembro, ya ensayados en el proyecto temporal, continúa en RESULTADOS-AISLADOS.md y los SQL de revisión.

## Proyecto temporal

Sigue siendo necesario para cerrar validación y preparar pruebas de Preview sin datos reales. No se borró ni se invalidaron sus claves todavía. Cuando dejen de hacer falta, eliminar proyecto/coordinador y credenciales QA locales, y confirmar la eliminación real; no declarar una limpieza que no se ejecutó.
