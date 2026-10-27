# Catálogo: presentación 3D y estilo Resend — 27 octubre 2026

Encargo del usuario: implementar en el catálogo normal el ejemplo 3D aprobado y mejorarlo con la referencia Resend adjuntada. Base conservada: rama correcciones-auditoria, incluido abed418 y su ordenación de teléfono. No se sustituyeron fichas ni se modificó Revit.

## Dirección y decisiones

Referencia principal: Resend, documento aportado por el usuario. Fondo negro, lectura blanca, bordes grafito, botones delineados de 6 px y superficies sobrias. El violeta queda en identificadores o etiquetas breves, no en botones ni baños de color. Se priorizaron las reglas explícitas de componentes sobre el ejemplo contradictorio de botón azul del resumen de la referencia.

Referencia secundaria: Active Theory, también aportada por el usuario, para protagonismo del objeto WebGL y continuidad de cámara; no para controles diminutos u ocultos. Se conserva el ámbar en el líquido y el logo de Vocatus. Los tamaños y navegación del teléfono mantienen las funciones del catálogo.

## Implementación

- Escena WebGL real: motor con aletas, carcasa e impulsor, conducción, corriente ámbar, gotas, ola y aparición del logo. Cámara próxima al motor al arrancar, seguida de una apertura hacia la marca. Mejora de iluminación del equipo respecto del ejemplo.
- Three.js se importa del archivo que ya distribuye el proyecto. Sin CDN, HDRI externo, dependencias nuevas ni simulación hidráulica presentada como real.
- Repetir, pausar/continuar y entrar al catálogo. La presentación se puede omitir antes de terminar. En movimiento reducido se muestra una escena estática.
- La presentación destruye geometrías, materiales, texturas, contexto y observadores al entrar. El visor de planta espera esa salida antes de iniciar su escena. Esto evita dos escenas activas a la vez; la descarga/preparación del modelo de planta ocurre después de entrar.
- Si el módulo de presentación no carga, se conserva la entrada SVG existente y el acceso al catálogo.
- El tema oscuro del catálogo adopta la referencia; el modo claro sigue disponible. Se desactiva la aparición animada de los contenidos de ficha para mantener la lectura inmediata.

## Comprobaciones reales

117/117 pruebas del proyecto. Prueba de navegador con copia temporal de 92 fichas: PC 1440×960, teléfono 390×844, movimiento reducido y modo claro a 360×740, módulo de introducción bloqueado a 390×844. En los cuatro casos se comprobó entrada y resumen, sin errores JavaScript ni desbordamiento horizontal. Se comprobaron pausa, repetición, inicialización diferida del visor y liberación de la presentación. Las acciones principales y el desplazamiento del resumen siguieron disponibles. Se preservaron los desplegables que ya existían en abed418.

Capturas: catalogo-resend-pc.png, catalogo-resend-telefono.png, catalogo-resend-ficha-pc.png, catalogo-resend-ficha-telefono.png y casos de movimiento reducido/fallback en outputs de este espacio. La comprobación de fallback bloqueó el módulo de introducción, no desactivó físicamente toda la GPU. No se modificaron fichas reales. Falta comprobar el rendimiento en el teléfono físico del usuario.

Responsable de implementación, integración y comprobación: asistente de este chat. Se utilizaron referencias aportadas y el método de Refero; sin herramientas Refero conectadas ni nuevas convocatorias para esta tarea de interfaz. Este informe complementa la coordinación y no acredita el estado del modelo de planta.
