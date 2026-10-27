# Cabecera e Historial — 27 octubre 2026

Se integró un circuito SVG ámbar en la cabecera con impulsor giratorio y flujo continuo hacia una silueta de la planta, siguiendo la captura anotada del usuario. La animación puede pausarse y respeta movimiento reducido. Es una ilustración de marca, no telemetría.

La barra lateral pasó de 118 a 100 px y el panel de hasta 480 a 400 px para ampliar la zona de planta. El botón Ampliar planta permite aprovechar el espacio del panel y recuperar la lista. Al abrir una ficha o cambiar de sección se restaura la distribución.

Historial muestra las nueve áreas de SECTORES_INT, incluso las que todavía no tienen TAG/fichas. Los contadores reflejan el catálogo accesible, no todos los objetos dibujados en 3D. El filtro encuadra el sector y se combina con la búsqueda por TAG, marca, modelo o serie. No se inventan bombas ni se asignan TAG a las referencias.

Comprobación: 134 pruebas pasan, incluidas dos nuevas de áreas vacías y combinación de búsqueda/área. Navegador en 1440×960, 1280×800, 390×844 y 320×844 sin errores JavaScript. Se comprobó pausa/reanudación, movimiento reducido, área sin fichas, ampliación/restauración y apertura de ficha, usando bóveda temporal y bloqueando escrituras. No se modificaron fichas reales ni Revit. No se agregó ninguna biblioteca ni otro visor 3D.
