# Revisión previa a cambios de base: cuentas de Preview

Estado: código preparado, SQL NO ejecutado, sin despliegue de Preview todavía. No está terminado el objetivo.

## Base y SQL completo

Proyecto Supabase existente: `gtfqhljbxyanfyrarykw` (`visor-bombas-el-viejo`). Es la base compartida por las fotos actuales, NO una base de prueba independiente.

SQL completo: `supabase/migrations/20261102193600_vocatus_cloud_accounts.sql`.
Reversión completa propuesta: `supabase/review/cuentas-preview-rollback.sql`.
La migración local fue creada con Supabase CLI 3.0.0, comando `migration new`; no se ejecutó en ninguna base.

## Qué hace

- Crea el esquema privado vocatus_access, perfiles y bitácora. Las tablas no tienen permisos directos de cliente.
- Inicializa perfiles aprobados exclusivamente desde miembros existentes con correo confirmado. El miembro admin actual inicia como administrador. No crea cuentas Auth ni cambia sus contraseñas.
- Las solicitudes crean un perfil pendiente. Solo otro administrador activo puede aprobar/rechazar. El solicitante no puede escribir su rol o estado de aprobación.
- La aprobación añade un miembro nuevo como editor si todavía no existe; no modifica ni elimina miembros anteriores. Ante una membresía existente inactiva o de solo consulta, detiene la aprobación y exige revisión del propietario.
- Serializa los cambios de cuentas con bloqueo transaccional para conservar al menos un administrador activo utilizable.
- Añade políticas restrictivas que complementan las políticas actuales. Añade guardias para que la publicación de fotos por SECURITY DEFINER también respete la cuenta.
- Impide alterar el contenido histórico de informes guardados. Solo administrador puede archivar un informe; la bitácora registra el archivado.
- Las funciones de crear/restablecer cuentas se invocan desde servidor; nunca se envía la clave privilegiada al navegador.

## Riesgos específicos

1. Aunque el despliegue sea Preview, las políticas y triggers se aplicarían en el Supabase compartido. Un error de SQL o permisos puede impedir temporalmente leer/subir fotos o registrar trabajos en otros clientes. Por esto no se aplican sin aprobación.
2. La migración no modifica filas de fotos, versiones, objetos, órdenes, informes ni miembros. Las aprobaciones futuras sí añaden miembros nuevos. Esa ampliación de acceso es explícita y queda auditada.
3. Desactivar una cuenta o restablecer su contraseña revoca el acceso con tokens antiguos mediante la consulta actual del perfil. No elimina su contenido.
4. No sustituye la validación en la base: las pruebas unitarias con proveedores simulados todavía no prueban RLS real ni la concurrencia real del último administrador.
5. La bitácora y los perfiles nuevos deben respaldarse en privado antes de revertir. No se publican correos ni contraseñas en el repositorio.
6. Las acciones de equipos/levantamientos en Vercel siguen teniendo las limitaciones de persistencia del visor previo. Las cuentas no convierten el modo DEMO en escritura de Obsidian; debe verificarse el comportamiento antes de declarar completado el objetivo.

## Reversión

- Si la transacción de migración falla, Postgres revierte toda la transacción.
- Si ya se aplicó y todavía NO hay solicitudes ni cambios de cuentas: detener o restringir el Preview, respaldar perfiles/bitácora en privado, revisar y autorizar el rollback completo adjunto. El rollback comprueba la huella de miembros y que no haya actividad antes de eliminar solo los objetos nuevos.
- Si ya hubo solicitudes, aprobaciones, rechazos, cambios de rol o restablecimientos: el rollback ABORTA deliberadamente. No borra miembros, usuarios ni actividad; se debe preparar una reversión específica con el propietario. Desplegar la versión previa y quitar las guardias sin revisar las cuentas desactivadas podría reabrir acceso, por lo que no se hace automáticamente.
- Nunca usa DROP/DELETE sobre fotos, versiones, objetos, órdenes, informes o miembros.

## Configuración exacta en Vercel

Proyecto `visor-bombas-el-viejo` > Settings > Environment Variables. Marcar SOLO `Preview`; limitar a `codex/cuentas-vercel` si la interfaz lo permite:

| Variable | Configuración |
| --- | --- |
| VOCATUS_CLOUD_ACCOUNTS | `1` |
| SUPABASE_URL | `https://gtfqhljbxyanfyrarykw.supabase.co` |
| SUPABASE_PUBLISHABLE_KEY | Clave pública del MISMO proyecto, Settings/API Keys de Supabase |
| SUPABASE_SECRET_KEY | Clave secreta solo servidor del MISMO proyecto; marcar sensible |

No cambiar `VISOR_PASSWORD`, ni en Production ni en Preview. Si Preview todavía no tiene esa variable, avisar para decidir su configuración; no desactivar ni copiar claves en el chat. `VERCEL_ENV=preview` lo proporciona Vercel, no se configura a mano.

Las dependencias de Supabase están fijadas a la versión ya usada `2.118.0`. El build adapta las páginas existentes exclusivamente cuando VOCATUS_CLOUD_ACCOUNTS=1 y VERCEL_ENV=preview. No habilita las cuentas nuevas en producción.

En Supabase > Authentication > URL Configuration, una vez exista la URL exacta de Preview, añadir únicamente `https://<preview-exacto>/login.html` a Redirect URLs para confirmar solicitudes por correo. No cambiar Site URL de producción ni habilitar comodines globales. Este cambio remoto también se revisará con el propietario antes de aplicarlo.

## Qué debe probarse después de aprobar SQL y configurar Preview

1. Aplicación transaccional del SQL autorizado; comprobar firmas, grants, RLS, funciones y asesores.
2. Conteos/huellas antes y después: fotos 114, versiones 118, objetos 119, órdenes 0, informes 0 (si no hubo actividad legítima intermedia). Si cambian, investigar; no restaurar contenido encima de actividad legítima.
3. Solicitar/confirmar correo, estado pendiente, aprobación y rechazo con cuentas destinadas a pruebas; nadie se aprueba a sí mismo.
4. RLS y peticiones directas: páginas, APIs, fotos, modelos, RPCs y tablas; cuenta desactivada y JWT anterior.
5. Último admin: dos solicitudes simultáneas. Crear/restablecer cuentas solo mediante funciones de servidor que validan al administrador actual.
6. Navegador real en celular y escritorio: pendiente, usuario y administrador; capturas y controles del 3D, ficha, levantamiento, avance, bodega, historial y fotos.
7. Revalidar el visor local en bóveda temporal; no tocar la instalación de Descargas.
8. Entregar URL de Preview y evidencias. No fusionar a main ni promover a producción.

Verificación de preparación: npm test ejecutado con npm 12.2.1 oficial: 262/262 pruebas aprobadas. Las nueve nuevas pruebas de cloud-access usan proveedores simulados. No se ejecutaron migraciones ni pruebas de escritura sobre el Supabase compartido. El objetivo sigue pendiente hasta aprobación SQL, configuración privada de Preview y validación real.

## Revisión de sesión y solicitudes antes de aplicar

El SQL revisado consulta auth.sessions (solo lectura) para que un JWT cerrado por Supabase no conserve permisos hasta su expiración. El cierre de sesión del servidor usa Auth Admin signOut con el token verificado, y el navegador elimina después su sesión local. No se borran filas de negocio. Se corrigió la pantalla de entrada para cuentas inactivas/sesiones revocadas y para completar solicitudes con identidades Auth existentes sin inventar usuario ni crear duplicados. Un conflicto de nombre permite completar el perfil con otro nombre, conservando la identidad.

Verificación actual: npm test, 266/266 pruebas aprobadas. Las cuatro pruebas nuevas adicionales son simuladas (logout/revocación, sync revocado, identidad sin perfil y conflicto de nombre). La ejecución y pruebas de RLS en Supabase continúan pendientes de aprobación del SQL completo actualizado. No se ha aplicado ninguna migración.

## Validación local del SQL (sin base de datos)

La revisión detectó y corrigió seis delimitadores de función inválidos en el borrador anterior. La versión actual se analizó con libpg-query 17.7.3 (parser PostgreSQL 17): migración y rollback tienen sintaxis válida y se analizaron también los cuerpos LANGUAGE SQL. Esto no comprueba los cuerpos PL/pgSQL ni sus consultas contra el catálogo real; esas verificaciones siguen pendientes de aprobación y ejecución transaccional controlada.

La guardia de sesión también compara created_at de auth.sessions con revoked_before: renovar el JWT de una sesión anterior no evita el corte de acceso. No se escribe ni borra en auth.sessions desde el SQL; la comprobación es de lectura. Todo cambio de base continúa sin ejecutar y requiere aprobación de esta versión revisada.

Verificación de esta revisión: npm ci --ignore-scripts completado en dependencias aisladas de la rama; npm test: 269/269 aprobadas. Migración: 75 sentencias; rollback: 17; parser PostgreSQL 170004. SHA-256 del SQL normalizado a LF: 5d1be7065a6ea4af55772e932b70fbe102f01958baf965cb3a3f19bf048d92ca. Sin ejecución de DDL/DML en Supabase; las pruebas reales de RLS, concurrencia, usuarios y Preview siguen pendientes.
