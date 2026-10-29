# Protección de regresión del Historial

Ejecutar `npm run guard:historial` desde el proyecto, o abrir `Comprobar Historial.cmd`.

El control ejecuta cinco archivos obligatorios de pruebas. Si falta uno, una prueba falla, el proceso no termina o no se puede confirmar el resumen, devuelve código 1 y escribe `status: bloqueado`. Si todo pasa, devuelve 0. Resultados predeterminados: `visor-bombas/.auditoria-regresion/regresion.json` y `pruebas.txt`, excluidos de Git. Se puede elegir otra carpeta con `--out CARPETA`.

Cubre identidades de bombas con y sin TAG, selección vigente, apertura de fichas vacías, cancelación de respuestas antiguas, el evento que une el 3D con la ficha, persistencia de adjuntos y transferencias de fotos. **No usa IA ni requiere una clave: 0 llamadas, 0 %.**

Verificación del 28 octubre de 2026: 35 pruebas críticas aprobadas y auditoría completa con 167 pruebas aprobadas. En una copia aislada se eliminó el manejador que abre la ficha al seleccionar una referencia en el 3D: la barrera devolvió código 1 y dos pruebas fallaron. No se alteró el programa original para esta comprobación.

Con autorización explícita del usuario del 28 octubre, la integración automática está configurada: GitHub ejecuta la barrera y la auditoría completa en cada push y pull request, y conserva los informes siete días. Vercel ejecuta `node tools/proteger-historial.mjs` como buildCommand; un código de salida distinto de cero detiene la construcción. No cambia las reglas de protección de ramas de GitHub. La comprobación remota del primer commit se registra en el estado local de coordinación.

Estas pruebas detectan regresiones conocidas; no garantizan que nunca pueda aparecer otro defecto ni sustituyen los clics y la revisión visual en el navegador.

Referencias de las acciones oficiales previstas: [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node), [upload-artifact](https://github.com/actions/upload-artifact).
