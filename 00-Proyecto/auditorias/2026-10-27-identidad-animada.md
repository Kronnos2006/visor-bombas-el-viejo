# Identidad integrada y animada — 27 octubre 2026

Encargo del usuario: que el logo sea parte del programa, con animaciones y una composición estética, en lugar de una imagen pegada en el centro.

Responsable: asistente de este chat. Se usaron CSS, SVG decorativo y Web Animations del navegador; sin nuevas dependencias ni modificación del PNG original. Tarea visual acotada, sin nuevas convocatorias y sin intervención en Revit ni fichas reales.

La bienvenida combina el logo con el fondo mediante estilos de composición. Incluye trazos decorativos que aparecen progresivamente, iluminación suave, entrada del texto y botón claro de acceso. PC usa composición de dos columnas y teléfono una composición vertical. Al entrar, una copia decorativa del logo se desplaza hasta su posición en la cabecera y se elimina al terminar. La entrada no espera el fin de los efectos ni simula carga del modelo.

Modo claro: la cabecera conserva el color original mediante composición con el fondo. Modo oscuro: tinta cálida integrada. La preferencia de movimiento reducido desactiva la animación y permite entrar de inmediato. La bienvenida se presenta una sola vez por sesión usando una clave nueva para que la actualización sea visible a quienes ya habían visitado la versión anterior.

Validación: 117 pruebas del proyecto pasan. Comprobación de bienvenida en Chromium a 1920×960, 390×844, 360×640 en modo claro y 390×650 con movimiento reducido. Verificados botón accesible, transición terminada, limpieza de la copia animada, logo de cabecera sin fondo, ausencia de desbordamiento y errores JavaScript, y bienvenida omitida tras recargar en la misma sesión. La prueba visual aisló la identidad bloqueando el módulo 3D; no constituye una prueba física en todos los teléfonos. Capturas: identidad-animada-pc.png, identidad-animada-telefono.png, identidad-animada-claro.png e identidad-animada-sin-movimiento.png en outputs de este espacio.
