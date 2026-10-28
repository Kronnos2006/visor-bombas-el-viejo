# Historial desde el modelo 3D — 28 de octubre de 2026

## Problema y corrección

El video aportado se revisó localmente (87,3 segundos). En Historial, seleccionar una bomba del modelo cambiaba el equipo del visor pero dejaba abierta la lista. Ahora tocar la bomba abre su historial y su despiece; la lista conserva su selección existente. También se conserva la bomba seleccionada al entrar en Historial y se admite el enlace directo `?s=historial#B30`.

Cada apertura identifica la solicitud y el TAG: selecciones rápidas y cambios de sección cancelan aperturas anteriores. El despiece espera la carga y la transición de cámara de la bomba correspondiente. El rótulo de resaltado del mapa se limpia al seleccionar y sus eventos pendientes no lo vuelven a mostrar sobre el equipo.

El video también mostraba fotos esperando recuperación. Una pestaña antigua puede bloquear la actualización del almacenamiento local. Se conserva una sola solicitud de apertura y se limita la espera de cada consumidor a cuatro segundos. El aviso pide cerrar las otras pestañas y reintentar; no se borran informes ni fotos. Reintentar aparece cuando existe un error, no durante una carga normal.

## Verificación

- Suite completa: 140 pruebas aprobadas, cero fallos.
- Antes: clic real sobre la malla visible de B30 reproducía la selección sin apertura de Historial.
- Después: el mismo clic abre Historial y despiece, sin dejar el rótulo del mapa.
- Selecciones rápidas B31/B30 conservan la última selección; la lista sigue abriendo B31.
- Cambiar a Reportar cancela una apertura pendiente; no se reabre Historial ni el despiece.
- Entrada directa con B30 y vista de teléfono de 390 × 844 verificadas.
- Dos páginas de prueba reprodujeron el bloqueo de IndexedDB versión 1. Tras cerrar la conexión antigua y reintentar se habilitan las fotos y se conserva un informe previo.
- Navegador aislado, bóveda temporal y bloqueo de escrituras API durante la prueba principal. No se modificaron fichas reales.

La prueba del clic usa proyección y raycast de lectura exclusivamente en la página de prueba para localizar una coordenada visible; después realiza un clic real del navegador. Ese diagnóstico no se incorpora al programa publicado. El video, las capturas y los datos privados de prueba no se incluyen en Git.

El alcance comprobado son estos casos; no constituye una auditoría completa de todos los posibles problemas del video o del sitio.
