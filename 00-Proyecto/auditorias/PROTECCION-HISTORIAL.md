# Protección de regresión del Historial

Ejecutar `npm run guard:historial` desde el proyecto, o abrir `Comprobar Historial.cmd`.

El control ejecuta cinco archivos obligatorios de pruebas. Si falta uno, una prueba falla, el proceso no termina o no se puede confirmar el resumen, devuelve código 1 y escribe `status: bloqueado`. Si todo pasa, devuelve 0. Resultados predeterminados: `visor-bombas/.auditoria-regresion/regresion.json` y `pruebas.txt`, excluidos de Git. Se puede elegir otra carpeta con `--out CARPETA`.

Cubre identidades de bombas con y sin TAG, selección vigente, apertura de fichas vacías, cancelación de respuestas antiguas, el evento que une el 3D con la ficha, persistencia de adjuntos y transferencias de fotos. **No usa IA ni requiere una clave: 0 llamadas, 0 %.**

Verificación del 28 octubre de 2026: 35 pruebas críticas aprobadas y auditoría completa con 167 pruebas aprobadas. En una copia aislada se eliminó el manejador que abre la ficha al seleccionar una referencia en el 3D: la barrera devolvió código 1 y dos pruebas fallaron. No se alteró el programa original para esta comprobación.

La protección local ya está implementada. La propuesta de integración automática consiste en ejecutar este control antes de la construcción de Vercel y ejecutar además la auditoría completa en GitHub para cada push y pull request. Esa integración quedó pendiente de autorización explícita tras el bloqueo de la revisión automática de permisos. Los borradores están preparados en el espacio local de coordinación, sin modificar todavía los workflows o el build de producción.

Estas pruebas detectan regresiones conocidas; no garantizan que nunca pueda aparecer otro defecto ni sustituyen los clics y la revisión visual en el navegador.

Referencias de las acciones oficiales previstas: [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), [upload-artifact](https://github.com/actions/upload-artifact).
