# Cuentas en Vercel: auditoría y preparación de Preview

Fecha: 2 de noviembre de 2026. Base: main, 1b0346c. Rama de trabajo: codex/cuentas-vercel.

## Estado de este trabajo

Auditoría de solo lectura completada. La autenticación nueva todavía NO está implementada ni desplegada. No se aplicaron migraciones ni cambios en Auth, miembros, fotos, órdenes o informes. No se modificó VISOR_PASSWORD. No se subió a main ni a producción.

El pull descargó origin/main en 1b0346c. Como el checkout anterior contiene commits y cambios locales, se creó un worktree separado desde origin/main; se conservaron intactos los cambios anteriores.

## Lo que existe en Supabase

Proyecto: gtfqhljbxyanfyrarykw (visor-bombas-el-viejo), PostgreSQL 17.

- vocatus_auth.members: email, role (admin/editor/viewer), active. RLS habilitada; sin acceso de cliente a la lista completa.
- public.vocatus_photos: 114 filas; RLS; claves entity_key + slot.
- public.vocatus_photo_versions: 118 filas; RLS; claves entity_key + slot + revision.
- public.vocatus_work_orders: 0 filas; RLS.
- public.vocatus_work_reports: 0 filas; RLS.
- storage.objects: 119 objetos. Buckets vocatus-photos y vocatus-maintenance protegidos por políticas de lectura e inserción; sin políticas de borrado de objetos.
- vocatus_auth.photo_access(boolean): exige auth.uid(), correo confirmado y miembro activo; escritura para admin/editor.
- vocatus_auth.publish_photo y public.vocatus_publish_photo: publicación con revisión esperada, archivo perteneciente al usuario y registro de versión.
- public.vocatus_photo_permissions: devuelve read/write.
- public.vocatus_save_work_order y public.vocatus_save_work_report: operaciones de órdenes e informes; usan photo_access(true).

La lista de miembros contiene un administrador activo y confirmado. Hay dos usuarios confirmados en Auth; el segundo no está autorizado como miembro. Los correos concretos se comunicaron en el chat; no se incorporan al repositorio.

## Brechas verificadas

1. No hay perfiles con nombre de usuario, estado de cuenta, cambio obligatorio de contraseña ni bitácora del visor en Supabase.
2. No hay una regla transaccional para impedir desactivar o degradar al último administrador activo.
3. Las políticas actuales permiten a miembros con escritura actualizar informes. No distinguen el archivado como acción exclusiva de administrador.
4. La política de publicación de fotos usa SECURITY DEFINER: una comprobación solo en la interfaz o en una política nueva no basta para revocar cuentas; hay que comprobar también las rutas que eluden RLS.
5. El servidor activa authStore solo en local. En Vercel el adaptador fuerza DEMO y el guardado de levantamientos/equipos continúa sin almacenamiento persistente. Incorporar cuentas no vuelve persistentes esas funciones: hay que resolverlo explícitamente sin presentar un guardado local como compartido.
6. La sesión de fotos vocatus-photo-session ya se comparte con órdenes/informes; crear un segundo cliente/sesión de acceso rompería la entrada unificada.
7. VISOR_PASSWORD protege tanto middleware como API. Se debe conservar durante Preview; Basic Auth y el token de la cuenta deben viajar por canales distintos.

## Huellas anteriores (metadatos, no contenido binario)

El hash es MD5 del agregado determinista de todas las columnas de cada fila. Sirve para detectar cambios en filas y rutas; NO acredita que se hayan descargado y vuelto a hashear los bytes de todas las imágenes.

| Conjunto | Filas | MD5 |
| --- | ---: | --- |
| Fotos | 114 | 5f2d731d63ad1b9ab957b4e68e8cce47 |
| Versiones | 118 | a7fc6227dfbb7174b287bd8aeaab264c |
| Storage | 119 | 83437f1231d627807ed4125ae1bcc7cc |

Volver a ejecutar supabase/audit-access-readonly.sql antes y después de la migración. Para verificar contenido binario, el auditor del servidor debe descargar cada objeto con acceso privado, calcular SHA-256 y comparar por bucket/ruta; no guardar imágenes privadas ni credenciales en Git.

## Configurar Vercel Preview

1. Abrir el proyecto visor-bombas-el-viejo en Vercel y entrar a Settings > Environment Variables.
2. Conservar VISOR_PASSWORD. Verificar que también exista en el entorno Preview. No quitarla ni cambiar la de Production.
3. Preparar variables solo para Preview, preferentemente limitadas a la rama codex/cuentas-vercel:
   - SUPABASE_URL: https://gtfqhljbxyanfyrarykw.supabase.co
   - SUPABASE_PUBLISHABLE_KEY: la clave pública del mismo proyecto, desde Supabase > Project Settings > API Keys.
   - SUPABASE_SECRET_KEY: clave secreta exclusivamente del servidor (o la service_role heredada). Marcarla como sensible. No usar prefijos públicos ni incorporarla a archivos, argumentos, capturas o mensajes.
   Estos nombres son el contrato propuesto para la implementación pendiente: agregarlos solos todavía NO habilita cuentas.
4. Confirmar acceso a despliegues de Preview del proyecto. No elegir Promote to Production ni desplegar la rama main.
5. Una vez lista la implementación, hacer un despliegue Preview y comprobar el commit y la rama en Vercel antes de probar.
6. Si la implementación usa recuperación mediante enlaces de Supabase, autorizar únicamente la URL exacta del Preview en Authentication > URL Configuration. No habilitar comodines globales ni cambiar Site URL de producción. El acceso por contraseña no requiere cambiar Site URL.

No pegar contraseñas ni claves en el chat. El agente puede comprobar presencia/configuración sin imprimir sus valores. Si hace falta iniciar sesión en Vercel o Supabase, el propietario realiza esa autenticación.

## Primer administrador y cuentas de prueba

No abrir un endpoint público de setup en Vercel. Inicializar el perfil de administrador con una operación de servidor o migración controlada, vinculando el UUID de Auth del miembro admin activo y confirmado que ya existe. El rol nunca debe derivarse de user_metadata ni de campos enviados por el navegador.

Conservar el miembro y su contraseña actuales. La cuenta local en usuarios.json no se migra automáticamente a Supabase: son identidades y contraseñas independientes.

El administrador luego crea una cuenta temporal de usuario mediante el servidor, con contraseña temporal y cambio obligatorio. No usar el segundo correo de Auth para pruebas sin autorización explícita de su propietario. Probar celular y computadora con sesiones separadas, sin modificar fichas o fotos reales.

## Criterios de aceptación pendientes

- Autenticación con usuario o correo; cuenta desactivada bloqueada inmediatamente, incluso con JWT anterior.
- Un único acceso Conectar mi cuenta y la misma sesión de fotos; renovación y cierre de sesión coherentes.
- Crear/activar/desactivar/cambiar rol/restablecer clave solo con administrador validado en servidor.
- Protección concurrente del último admin, incluso dos solicitudes simultáneas.
- Bitácora duradera de cuentas y acciones delicadas, con actor validado, sin contraseñas/tokens.
- Usuario puede consultar y realizar el trabajo operativo; las acciones de delicateAction son exclusivas de administrador también en API/RLS.
- Verificar actualizaciones directas REST/RPC, no solo los botones del visor.
- Persistencia de levantamientos, reparaciones y equipos en Vercel definida y probada; evitar escrituras en DEMO.
- Migración aditiva y comparativa de conteos/huellas; no alterar los miembros existentes ni contenido histórico.
- npm test y pruebas nuevas de permisos; navegador con usuario y admin en celular/computadora.
- URL de Preview verificada; Production sigue protegida por VISOR_PASSWORD hasta confirmación del propietario.

## Avance posterior: frontera de identidad

Se ejecutaron git fetch origin y git merge origin/main: la rama ya incluía 1b0346c. Se añadió cloud-identity.mjs como módulo de servidor independiente, que consume un proveedor Auth verificado y una lectura actual de la cuenta. Reutiliza delicateAction() de auth.mjs; no usa metadata editable, no guarda sesiones locales y no cachea permisos. El módulo todavía NO está conectado al handler de Vercel: faltan el almacén Supabase, la migración, la entrada compartida y la administración completa. No se activa en el visor local.

Seis pruebas unitarias adicionales cubren identidad confirmada, UUID, cuenta activa, rechazo de tokens, caída del almacén, cambio de rol, acciones administrativas y cambio obligatorio de contraseña. Son pruebas con proveedores simulados; no sustituyen las pruebas con usuarios reales ni RLS en Supabase.

## Integración preparada para revisión SQL

Ahora hay una implementación inicial de servidor/Edge y pantallas compartidas, detrás de VOCATUS_CLOUD_ACCOUNTS=1 y exclusivamente VERCEL_ENV=preview. Aún no está validada contra una base migrada ni en un Preview real. La solicitud de aprobación del SQL completo, riesgos, reversión y variables exactas están en supabase/review/REVISION-CUENTAS.md. La migración NO fue aplicada. Las pruebas unitarias adicionales verifican rutas protegidas, cuenta pendiente/desactivada, rol, origen y uso del actor verificado con proveedores simulados; no sustituyen las verificaciones reales pendientes.
