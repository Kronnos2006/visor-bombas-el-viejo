# Presentaciones para teléfono y PC

El sitio comparte los datos y selecciona automáticamente su presentación según el ancho de pantalla. La presentación de teléfono se define en `visor-bombas/public/telefono.css`, cargada únicamente hasta 900 px. La PC conserva la distribución de columnas y el modelo 3D al lado del expediente.

## Teléfono

- El resumen usa una pantalla de lectura completa, con letra de 18 px para los datos.
- Botones grandes con texto: Resumen, Ver el 3D y Bombas.
- Resumen, Historial, Preguntar y Simulador se presentan como botones visibles, en dos columnas en vertical y una fila en horizontal.
- Las secciones documentales y los registros se muestran abiertos. Tocar su título no los pliega en teléfono.
- Las acciones se muestran como botones después de los datos principales, sin menú «Más acciones»: Ubicar, Fotos, Manual, Mantenimiento, Actualizar datos, Resumen PDF, Planos, Pedir a bodega y Mover o cambiar, según la documentación disponible de cada equipo. Manual pendiente sigue desactivado cuando no existe un documento aplicable.
- Los filtros disponibles de la lista se muestran abiertos.
- La vista 3D conserva los datos breves y un botón para volver al resumen.
- La pantalla ya no ofrece el interruptor de controles avanzados de escritorio; mantiene el control de tema con texto.

Se necesita desplazarse por las fichas largas; no es necesario descubrir ni abrir apartados para consultar sus datos. Cambiar de pantalla mediante Resumen/Historial/3D/Bombas sigue siendo navegación explícita.

## Validación

Prueba en Chromium con una copia temporal de las fichas: 360×780, 390×844, 430×932 y horizontal 844×390. Sin desbordamiento horizontal. Se comprobaron apertura directa del resumen, desplazamiento, regreso desde Historial, secciones abiertas incluso al tocar los títulos, acciones visibles con altura mínima de 52 px, vista 3D, cambio B31→B32 y retorno a escritorio. No se modificaron fichas reales. Sigue siendo necesaria la comprobación física con los usuarios en sus teléfonos.
