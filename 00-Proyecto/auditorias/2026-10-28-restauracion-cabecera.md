# Restauración de cabecera sin revertir la interfaz — 28 octubre 2026

Sobre a769a3f se recuperó el circuito de logo, letras llenables, bomba, tubería y mini planta llenable. Se reinicia al cambiar de sección y conserva movimiento reducido. La pausa sigue disponible en la propia cabecera y conserva la preferencia guardada del navegador.

Se mantienen los cambios de interfaz de la integración: filtros de área/fluido/marca y búsqueda de Historial, tarjetas con avance, resumen lateral de equipo, lista y detalle de Pendientes en PC, ampliación del mapa y los seis controles de piezas/corte/transparencia/cámara.

Limpieza comprobada: eliminado header-fx.js (solo lo importaba la cabecera sustituida), sus reglas de título/tubería/cascada/destello y manejadores redundantes. Retirados importación y diccionario de áreas sin uso. Se conserva el código, licencias y recursos de la entrada y del 3D, que siguen activos. Reducción de los cuatro archivos comparados: 20058 bytes de texto sin comprimir con finales LF; no equivale a una medición de ahorro de red ni de facturación de Vercel.

Validación: 134 pruebas pasan. Recorrido de Chrome en PC/tableta/390/320 px: llenado, reinicio, pausa persistente, movimiento reducido, borrador conservado, filtros y búsqueda, mapa ampliable, corte/transparencia y seis controles de vista, lista/detalle en Pendientes y resumen lateral. Sin errores JavaScript; una sola cabecera activa y ninguna solicitud de header-fx. Se utilizó bóveda temporal y se bloquearon escrituras del navegador. No se modificaron fichas reales ni Revit.
