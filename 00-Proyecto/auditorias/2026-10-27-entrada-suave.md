# Entrada integrada y ámbar — 27 octubre 2026

Responsable: Codex. Alcance: presentación del catálogo web; sin modificar fichas reales ni Revit.

La referencia principal es la indicación actual del usuario: conservar el ambiente del ron y evitar controles de presentación, saltos y apariencia de imagen superpuesta. Se conserva la bomba 3D y el líquido del ejemplo aprobado; el negro de la referencia Resend queda como antecedente y se recupera el ámbar anterior. Se mantienen el catálogo y sus recorridos existentes.

Cambios:
- Quitados Repetir presentación, Pausar, el estado técnico y las etiquetas Arranque/Corriente/Vocatus.
- Restituida la paleta ámbar en el catálogo; fondo cálido y entrada dorada.
- Logo integrado en la escena con revelado gradual, sin traslado de una imagen flotante a la cabecera.
- Giro continuo de bomba y transición progresiva de gotas; calentamiento previo de materiales antes de mostrar la escena.
- Menor carga gráfica: sin sombras dinámicas, menos gotas y menor resolución de renderizado en teléfono. Pausa al ocultar la pestaña y liberación al entrar.
- Se conserva una entrada directa y la alternativa simple cuando falla el 3D; se respeta movimiento reducido.

Comprobaciones: 117 pruebas automatizadas pasan. Chromium con tamaños de PC (1440×960), teléfono (390×844), movimiento reducido/claro (360×740) y fallo de carga 3D: sin errores de página, sin desbordamiento horizontal, fichas y resúmenes accesibles. Capturas en outputs/entrada-suave-*.png. La medición en navegador de escritorio no acredita el rendimiento de cada teléfono físico.

También comprobada la entrada durante la carga de la imagen: se libera la escena y abre el resumen de teléfono sin errores. Publicación pendiente al redactar.
