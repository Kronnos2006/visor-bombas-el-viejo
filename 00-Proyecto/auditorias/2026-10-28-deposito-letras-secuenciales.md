# Depósito y llenado secuencial de letras — 28 octubre 2026

Petición: logo como depósito transparente con nivel, tubería fuera del texto y llenado letra por letra en orden, conservando la interfaz.

El logo original se conserva como imagen y elemento de transición de bienvenida. Detrás se incorpora un depósito circular de vidrio inspirado en el emblema de entrada, con superficie ondulada y nivel que sube al recibir líquido y desciende ligeramente al alimentar el circuito. La tubería alimenta las letras por un colector inferior: ninguna pasa por delante de los glifos. Cada letra espera a que termine de llenarse la anterior; después reciben el líquido la bomba y la mini planta. La secuencia se reinicia al navegar. Se mantienen pausa persistente y movimiento reducido; al abrir con pausa guardada se muestra el circuito lleno y estático, sin ocultar los títulos.

Se conserva el resto de la interfaz y no se agregan librerías, imágenes nuevas ni un visor WebGL. La animación SVG se limita aproximadamente a 30 actualizaciones por segundo y se detiene al ocultar la pestaña. Se evita la onda global de pulsación sobre la cabecera porque tapaba el líquido y recortaba las conexiones.

Referencias: captura del usuario y entrada actual del catálogo; guías Motion de la skill Refero. La consulta remota Refero respondió NO_SUBSCRIPTION, por lo que se siguió con las referencias locales, sin instalar ni contratar herramientas. El efecto es ilustrativo, no telemetría ni simulación hidráulica de ingeniería.

Validación: 136 pruebas pasan, con dos regresiones nuevas para el orden causal de letras, bomba y planta. Navegador Chrome en 1440, 390 y 320 px: muestreo de puntos de tuberías fuera de las cajas de las letras, títulos de al menos 18,77 px en la muestra, cero desbordamientos, fases capturadas con B y H primero, pausa, preferencia de movimiento reducido, borrador conservado y filtros actuales accesibles, sin errores JavaScript. Servidor con bóveda temporal y escrituras del navegador bloqueadas. Sin cambios a fichas reales ni Revit. El ensayo automatizado no equivale a probar un teléfono físico.
