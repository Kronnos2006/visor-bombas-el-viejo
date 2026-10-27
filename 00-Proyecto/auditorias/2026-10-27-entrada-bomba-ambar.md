# Entrada de destilería: bomba y líquido ámbar — 27 octubre 2026

Petición: mejorar la entrada con una animación relacionada con la planta, por ejemplo una bomba que impulsa ron y revela el logo. Implementación: una ilustración SVG de motor y bomba arranca, se ilumina un testigo, el líquido ámbar recorre la conducción, aparece un pequeño chorro con gotas y una ola ascendente descubre el logo. El color evoca el ejemplo del usuario; no se presenta como un dato de producto o una simulación hidráulica de la planta.

La secuencia se realiza con SVG y CSS, sin nuevas dependencias ni vídeos descargados. Dura aproximadamente cuatro segundos, se adapta a PC y teléfono y permite entrar al catálogo mientras se reproduce. «Volver a ver la animación» reinicia la secuencia. Con movimiento reducido se presenta una composición estática y no se fuerza la repetición. Se conserva el logo original y la transición posterior hacia la cabecera.

Comprobaciones: 117 pruebas del proyecto pasan. Navegador Chromium en 1920×960, 390×844, 360×640 con tema claro y 390×650 con movimiento reducido; se comprobaron la repetición, entrada, fin de la transición, eliminación de la copia animada, logo integrado, ausencia de desbordamiento horizontal y errores JavaScript y comportamiento de una sola bienvenida por sesión. La prueba visual aisló la identidad bloqueando el módulo 3D; no se modificaron fichas ni Revit. Capturas en outputs: intro-bomba-pc.png e intro-bomba-telefono.png.

Responsable: asistente de este chat. Encargo visual acotado con las herramientas locales disponibles; sin nuevas convocatorias. Este registro no altera la fuente maestra del modelo ni acredita una simulación física.
