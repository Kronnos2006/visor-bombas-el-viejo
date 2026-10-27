# Entrada frontal conectada a la planta — 27 octubre 2026

Responsable: Codex. Alcance: entrada visual del catálogo web. No cambia fichas, mediciones ni geometría del catálogo.

Referencia de diseño: captura e indicación del usuario. Se conserva el ámbar y la relación bomba–ron–logo. La cámara queda perpendicular al logo, sin órbita. Refero motion.md aporta continuidad espacial; no se introduce otro tema visual.

Cambios:
- Cámara fija frontal, con encuadre calculado según la pantalla para evitar cortar la bomba.
- Salida en la parte inferior del logo: baja y gira hacia el fondo, hasta una superficie de la miniatura 3D.
- La miniatura usa el recurso existente `planta-integrada.glb` (5,38 MB), sin sus planos de referencia ni cubierta común, con material cálido. Es una vista de presentación; no acredita la conectividad real de una instalación.
- Bandas y partículas siguen las tuberías; el impulsor gira continuamente. El revelado inicial no detiene la escena después de 7,5 segundos.
- El movimiento se pausa al ocultar la pestaña y los recursos se liberan al entrar al catálogo. Se respeta movimiento reducido.
- Se conserva el acceso inmediato al catálogo, incluso durante la carga, y la alternativa simple si falla el módulo 3D.

Verificación:
- 117 pruebas del catálogo pasan.
- Chromium con PC 1440×960 y teléfono 390×844: tiempo de escena mayor de 9 segundos, fotogramas diferentes después del antiguo límite, cámara frontal y miniatura cargada. Sin errores de página ni desbordamientos horizontales. Las fichas y resúmenes siguen accesibles.
- Movimiento reducido 360×740: escena estática y acceso al resumen correcto.
- Módulo 3D bloqueado y entrada durante la carga: el catálogo sigue accesible.
- Contacto entre tubo y superficie de la miniatura comprobado mediante intersección sobre geometría real en PC, teléfono y movimiento reducido. Capturas: outputs/entrada-conectada-*.png del espacio de trabajo.

El recurso de planta añade una descarga de 5,38 MB a la presentación. No se añaden dependencias ni servicios externos. Las comprobaciones con tamaños de teléfono en Chromium no equivalen a medir cada teléfono físico.
