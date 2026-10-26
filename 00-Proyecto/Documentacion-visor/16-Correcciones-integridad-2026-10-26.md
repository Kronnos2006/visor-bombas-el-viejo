# Correcciones de la auditoría · Vocatus

26 de octubre de 2026. Trabajo realizado en una copia separada y luego integrado en la rama `correcciones-auditoria` del proyecto, sin publicar en GitHub ni Vercel. No se incluyeron respaldos ni datos de prueba. Las secciones sobre la copia de trabajo describen esa etapa de revisión.

**P-1401 sigue pendiente de revisión.** Integrar este código no confirma su registro antiguo de verificación.

## Resultado

| Antes | Ahora |
|---|---|
| Guardar una observación verificaba toda la ficha | La captura solo registra autor y fecha de levantamiento. Verificar exige seleccionar identidad, placa o repuestos y describir evidencia. |
| Una serie escrita confirmaba automáticamente la asociación física | La serie queda como candidata hasta que se verifique explícitamente la identidad. |
| Persona y fecha antiguas se mostraban como verificación completa | Se conservan, pero se muestran como «Registro antiguo · requiere revisión». No se convierten automáticamente en verificaciones nuevas. |
| Cambiar datos podía dejar una verificación anterior vigente | Cambiar identificación invalida los tres alcances; modificar placa o repuestos invalida el alcance correspondiente. Se conserva la evidencia anterior para revisión. |
| Fecha 2026-02-31 y RPM −500 aceptados | Se validan fechas de calendario y reglas por campo antes de guardar. RPM y cantidades son enteros positivos; diámetros y secciones son positivos. |
| El teléfono ofrecía entrada genérica | RPM y cantidades usan teclado numérico. Las magnitudes decimales admiten coma; un diámetro 1.3/8 o 1 3/8 se normaliza a 1.375 en su unidad declarada. |
| Levantamiento sin respaldo previo | Se comparte el mecanismo de respaldo con las operaciones de equipo. Cada guardado crea una copia exacta de la ficha anterior; si el respaldo falla no se escriben ficha ni fotos. |
| «false» en repuestos y carrito | Se excluyen booleanos, se limpia el token erróneo de carritos anteriores y se conserva una copia de estos en el navegador. No se cortan códigos ni se cambian cantidades. |
| PDF podía heredar el token erróneo | El servidor también limpia el detalle recibido y rechaza fecha imposible o cantidad fraccionaria. Los PDF ya emitidos no se modifican. |
| Pedido sin equipo seleccionado | El acceso del encabezado y el de la ficha llevan el TAG abierto. |
| Sellado y o-rings inicialmente cerrados | Se abren por defecto y se respeta la elección posterior del usuario durante la sesión. |
| Sector activo podía seguir en Toda la planta | Seleccionar una bomba resalta su sector. |
| Mantenimiento partido en el celular | Acciones en dos columnas con ancho suficiente, controles táctiles de al menos 44 px en los grupos corregidos y nombre accesible para el deslizador de despiece. |
| Fila de sectores asomaba detrás de la hoja móvil | Se oculta mientras la hoja está abierta. Se comprobó también el cambio de tamaño sin vaciar la ficha. |
| 43 y 62 sin explicar | Avance explica el universo de fichas; el visor muestra el desglose de equipos con TAG y referencias sin TAG. |

## Conteos comprobados

En la bóveda predeterminada del proyecto:

- Visor: **28 equipos B con TAG + 34 referencias geométricas sin TAG = 62 elementos**. No son 62 equipos identificados de forma única.
- Avance: **28 fichas B asociadas al mapa + 15 fichas P del PFD = 43 fichas**.
- La carpeta contiene 77 fichas B; **49 todavía no están asociadas al mapa actual**. No se crearon ubicaciones ni asociaciones por suposición.
- Las referencias geométricas pueden coincidir con equipos identificados. Los siete TAG de torre ya pendientes siguen requiriendo confirmación física.

Los conteos se calculan en cada consulta. No se fijaron en el código como constantes de presentación.

## Revisión de la bóveda original, solo lectura

No se encontró `OBSIDIAN_VAULT` definido ni la carpeta `Vacatos` en las rutas previstas por los lanzadores. Con esa configuración, la bóveda predeterminada es el propio proyecto `C:\Users\genes\Documents\visor-bombas-el-viejo`.

Se revisaron **92 fichas** —77 B y 15 P—. Se encontró una marca antigua de verificación en **P-1401**, con fecha **2026-10-06**, sin registro desglosado de alcance ni apartado de levantamiento de campo en esa ficha. Eso **no prueba que la verificación sea falsa**: necesita contrastarse con la evidencia original. No se borró ni cambió.

Se guardaron huellas SHA-256 para comprobar al cierre que las fichas inspeccionadas siguen intactas. Si la instalación se abre con otra bóveda externa configurada en una sesión distinta, esa bóveda no queda cubierta por esta revisión.

## Validación

- **92 pruebas automáticas pasan**: 81 de la versión previa y 11 pruebas nuevas de regresión. Se actualizaron las expectativas anteriores que exigían verificación automática.
- Pruebas dirigidas: observación sola, verificación parcial y completa, evidencia obligatoria, pérdida de vigencia al cambiar datos, asociación de serie, fechas imposibles, RPM/cantidades inválidos, coma decimal, fracciones, fallo de respaldo y recuperación exacta de estados anteriores.
- Bodega: limpieza de booleanos, carrito preservado antes de limpiar, conservación de cantidades/códigos, PDF con fecha y cantidades válidas.
- Navegador: escritorio 1366 px y celular emulado 390×844; guardado en bóveda de prueba, cambio de TAG, Avance, pedido que hereda selección, sector activo, apartados abiertos, controles y hoja móvil. Sin errores JavaScript en las comprobaciones realizadas.
- Las capturas que muestran una verificación parcial en B32 corresponden a **una prueba en una copia**, no a una verificación de B32 en planta. La ficha usada en la prueba se restauró al finalizar.
- Una primera ejecución dentro del entorno restringido produjo errores de permisos de Windows en renombrados de archivos temporales. La suite final se ejecutó con permisos adecuados y pasó completa.

## Entrega y revisión

La copia de trabajo está en:

`C:\Users\genes\Documents\Codex\2026-10-26\referenced-chatgpt-conversation-this-is-an\work\visor-bombas-corregido`

El paquete `correcciones-auditoria.zip` contiene solo los archivos de código, pruebas y documentación cambiados, con sus rutas relativas. No contiene bóvedas, fotografías, informes privados, modelos ni dependencias instaladas. **No aplica cambios automáticamente al proyecto original.**

`Iniciar revision local.cmd` abre el servidor de la copia en esta PC. El servidor se limita a `127.0.0.1` y apunta explícitamente a la copia; cualquier guardado realizado ahí afecta únicamente esa copia. Gemini queda desactivado para esta revisión.

## Pendientes externos a estas correcciones

- Confirmar los siete TAG de torre y contrastar el registro antiguo de P-1401 con su evidencia.
- Revisar PDF ya entregados a bodega que pudieran contener `false`.
- Probar con mecánicos y teléfonos físicos. Las pruebas móviles realizadas son emulación.
- Resolver licencias y derechos de código/modelos/documentos conforme a la auditoría anterior.
- El respaldo en la misma unidad no sustituye una copia externa ni un sistema completo de edición simultánea con Obsidian.
- No se incorporaron curvas oficiales, stock de bodega, autenticación multiusuario ni cambios al modelo 3D.
