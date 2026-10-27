# Entrada de vidrio aprobada — integración

27 octubre 2026. Responsable: Codex. Se integra la vista local aprobada por el usuario para publicarla en el catálogo.

El logo conserva la cámara frontal y la bomba se presenta en tres cuartos. La bomba no oculta la planta, colocada más atrás. El ron entra desde la manguera superior y cae dentro del logo; después sale por abajo hacia la planta. El vidrio claro se muestra solo por encima del nivel del líquido; las partes llenas se ven ámbar, sin superposición blanca. Bomba, flujo y remolinos continúan animados mientras la entrada está visible.

Recursos:
- `intro-destileria-3d.js`: escena, caída, conducción y llenado.
- `liquid-ether-native.js`: adaptación a JavaScript del motor Liquid Ether de React Bits, commit e12c22192ac7b4b452c5e2feb9b586d74765d696. Se incluye íntegra la licencia MIT + Commons Clause en `public/vendor/react-bits-LICENSE.md`, y se mantiene su aviso de autoría en el código.
- `modelos/intro-planta.glb`: miniatura de presentación derivada del Blender actual; 25 sectores de planta, incluido Sector de tanques, 1687 mallas de origen, detalles pequeños simplificados agrupando vértices. No se modifica el modelo del catálogo. Metadatos en `intro-planta-origen.json`.

La miniatura ocupa 17,32 MB y sustituye en la entrada la carga del modelo anterior de 5,38 MB. No se instala React ni se añaden dependencias: el motor del efecto se adapta al entorno existente. El movimiento reducido presenta el estado final estático. Al entrar se liberan ambos contextos y se retiran los recursos del líquido. Si falla la presentación, sigue disponible la entrada simple.

Validación: 117 pruebas del catálogo pasan. Comprobadas la integración completa en navegador con tamaños PC/teléfono, movimiento reducido, módulo/modelo no disponibles y entrada durante la carga: sin errores y con fichas/resúmenes accesibles. La escena y el contexto del líquido se liberan al entrar. Las revisiones previas de la vista local comprobaron todas las fases de llenado y que la planta queda libre de superposición con la bomba. No se midió rendimiento en un teléfono físico.

No se modifican fichas reales ni datos de campo. Esta animación de identidad no acredita una conexión hidráulica real ni altera el estado de Revit.

Refinamiento solicitado antes de publicar: vista de tres cuartos de la bomba (37 grados), eje del motor alineado con el impulsor, brida de succión con boca abierta y tornillos, manguera acoplada a la descarga y materiales/iluminación con reflejos más suaves. Es un modelo visual de referencia sin cotas de fabricación. Se comprobaron de nuevo las fases de la vista local en PC/teléfono/reducido; integración final comprobada en PC, teléfono y movimiento reducido, sin errores de página.
