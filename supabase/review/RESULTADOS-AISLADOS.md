# Correcciones y pruebas aisladas · 2 de noviembre de 2026

Estado actual: SQL aprobado únicamente para pruebas en el proyecto temporal. **No aplicado en `gtfqhljbxyanfyrarykw`. No solicitar todavía aprobación de la base compartida.** Este informe reemplaza los estados históricos de REVISION-CUENTAS.md.

## Correcciones

- `session_allowed` comprueba la sesión real por UUID/usuario y `sess.created_at > revoked_before`. No compara `iat`. Se eliminó la espera artificial después de cambiar contraseña.
- `manage/update` rechaza siempre actor=destinatario, tanto para cambiar rol como estado. Los controles propios también quedan deshabilitados en la pantalla cloud.
- Un miembro activo confirmado sin perfil obtiene perfil aprobado con el rol correspondiente a su membresía admin/editor. Un miembro viewer recibe un error explícito, sin crear perfil pendiente ni modificar su membresía de consulta. La respuesta y la pantalla distinguen aprobado de pendiente.
- El rollback captura la huella inicial de miembros de cada instalación; no depende de una huella fija de la base compartida.
- Build, middleware y API rechazan habilitar cuentas fuera de Preview y de la rama exacta `codex/cuentas-vercel`. Esta guardia de código NO configura el alcance real de una variable en Vercel ni protege el despliegue por sí sola.

## Resultados reales en base separada

Organización autorizada: Kronnos2006's Org. Proyecto temporal `vocatus-cuentas-pruebas-20261102`, referencia `rbiuaucawhmiqvqomqec`, creado después de confirmar costo informado de $0/mes. Sin ramas disponibles en el plan y sin Docker/WSL utilizable en esta PC. Solo se trasladaron definiciones actuales de tablas, funciones, grants, RLS, índices y configuración de buckets. Usuarios, contraseñas, imágenes, órdenes e informes de prueba son sintéticos; no se copiaron filas reales.

| Verificación | Resultado |
| --- | --- |
| Migración completa, rollback completo y reaplicación | Correctos. Después del rollback: esquema nuevo ausente; 6 funciones originales, 3 miembros sintéticos y las tablas originales conservados |
| Sesión creada después del corte dentro del mismo segundo | Permitida con JWT real, aunque `iat` no sea posterior al corte; fixture validó las tres condiciones antes de la llamada HTTP |
| Miembro activo sin perfil | Perfil aprobado usuario; membresía preservada |
| Autoaprobación, propio rol/estado, gestión directa desde cliente | Bloqueados |
| Foto de miembro previo con sesión previa | Subida, publicación, lectura de versiones y descarga con SHA-256 coincidente |
| Pendiente y rechazado | Sin lectura, subida, descarga ni publicación; foto válida de control publicada |
| Desactivado con sesión abierta | Sin acceso, incluida publicación de su propio archivo; renovar token o reactivar no rehabilita la sesión antigua |
| Órdenes e informes | Usuario crea orden y la cierra con informe; archivado solo admin y auditado |
| Restablecer/cambiar contraseña | Entrada temporal, cambio obligatorio y nueva entrada inmediata correctos |
| Último administrador, peticiones simultáneas | Exactamente un cambio prospera; queda un admin activo. También probado directamente con dos llamadas SQL concurrentes |
| Recuperación puntual de miembro inicial | Rol y contraseña preservados; sesión vieja sigue denegada y nueva entrada lee fotos |
| Última versión del servidor y límites actuales de buckets | Entrada usuario y admin, subida/publicación/descarga de PNG válidas: 3/3 |

Runner remoto: **12/12**, evidencia en `supabase/test/isolated-results.json`. Comprobaciones finales: `final-smoke-results.json`. Recuperación: `member-recovery-result.json`. Los primeros intentos fallidos por arranque de Storage y fixtures sin reiniciar no se contabilizan como aprobación; los resultados indicados corresponden a ejecuciones posteriores completas válidas.

`npm test`: **275/275**, sin omitidas. Incluye permisos del servidor, aislamiento de Preview y parser PostgreSQL 17. Las pruebas unitarias no sustituyen las pruebas reales anteriores. Todavía faltan las pruebas de navegador de Preview en celular y computadora.

## Respaldo y huellas de la base compartida

Ubicación privada local:
`C:\Users\josem\Documents\ChatGPT\vocatos\Respaldos-supabase\2026-11-02T20-34-45-395Z-cuentas-precheck`.

Existe una captura lógica verificada por relectura, 298919 bytes, SHA-256 `d986aab764543a7a60c7e930d7199769b77aed34eda13d8aa7cb55006ac32c38`. Se verificaron las referencias de fotos/versiones contra MIME y tamaño de Storage.

**NO es todavía un respaldo completo verificado:** faltan descargar y calcular SHA-256 de los 119 archivos privados. El manifiesto lo declara con `complete:false` y `binaryFilesVerified:false`. Las credenciales MCP no se exportan a Node; para completar los binarios hace falta una sesión autorizada o una credencial de servidor configurada de forma privada, nunca pegada en el chat ni guardada en Git.

Captura de 2026-11-02 20:34:45 UTC, sin cambios respecto a la línea base de metadatos:

| Recurso | Conteo | MD5 de metadatos |
| --- | ---: | --- |
| Fotos | 114 | `5f2d731d63ad1b9ab957b4e68e8cce47` |
| Versiones | 118 | `a7fc6227dfbb7174b287bd8aeaab264c` |
| Objetos Storage | 119 | `83437f1231d627807ed4125ae1bcc7cc` |
| Órdenes / informes / miembros | 0 / 0 / 1 | — |

Estas huellas MD5 describen filas, no el contenido binario de las imágenes. Deben recapturarse inmediatamente antes y después de una aplicación futura autorizada.

SQL candidato, bytes LF de `supabase/migrations/20261102193600_vocatus_cloud_accounts.sql`:
**SHA-256 `50b0263cf0ac6b735ac3d5a85ef988645be44905eefd088be0ea6ef57448a851`**.

## Si un miembro actual pierde acceso

Detener/restringir Preview y diagnosticar la causa sin desactivar globalmente permisos. Antes de actividad de cuentas, respaldar los nuevos perfiles/bitácora y usar el rollback completo con aprobación específica; sus guardias impiden ejecutarlo después de cambios de miembros o actividad de cuentas. No elimina fotos, miembros, órdenes ni informes.

Después de actividad, el rollback completo aborta. Para un miembro original activo/confirmado cuya pérdida fue involuntaria, revisar `cuentas-preview-member-recovery.sql`: requiere UUID y confirmación explícita del propietario; conserva rol, corte de sesiones y cambio obligatorio de contraseña. Se probó en la base temporal. El miembro entra de nuevo; no se rehabilitan tokens antiguos. Si la causa es distinta, preparar recuperación específica conservando perfiles y bitácora.

## Lo pendiente antes de nueva aprobación

1. Completar/verificar el respaldo binario y recapturar conteos/huellas de la base compartida.
2. En Vercel, Settings → Environment Variables: `SUPABASE_SECRET_KEY` sensible, **solo Preview y solo `codex/cuentas-vercel`**, sin variable general para todas las ramas. Revisar las otras variables según REVISION-CUENTAS.md. No modificar `VISOR_PASSWORD`.
3. Settings → Deployment Protection: exigir autenticación para el Preview y verificar que una visita anónima quede bloqueada. No hay aún acceso autenticado a Vercel para comprobarlo. No se desplegó un Preview público.
4. Subir la rama cuando pueda verificarse la protección antes de cualquier despliegue automático; desplegar Preview protegido, probar usuario/admin en navegador móvil/escritorio y regresiones de visor/ficha/levantamiento/avance/bodega/historial/fotos.
5. Solo entonces presentar la nueva aprobación del SQL compartido. No tocar main ni producción.

Primer administrador compartido: la migración importa el miembro admin existente únicamente si su identidad Auth tiene correo confirmado. No crea contraseñas ni eleva metadatos del navegador; si no existe administrador confirmado, detener y resolver con el propietario antes de aplicar. No se ejecutó este paso en la base compartida.

El proyecto temporal y su coordinador QA siguen activos para revisión. El coordinador exige JWT válido y cuenta admin actual y rechaza cualquier referencia distinta del proyecto temporal. No está desplegado en el proyecto compartido; retirar los recursos temporales cuando termine la revisión.
