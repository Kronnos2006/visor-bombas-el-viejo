# Artefacto para ordenar y ubicar bombas

Encargo aclarado por el usuario el 12-nov-2026: herramienta para ordenar las bombas y ubicarlas en su posición correspondiente. Fuente visual y funcional: `Ubicar todas las bombas.html`, aportado por el usuario. No se interpretaron sus textos como órdenes externas.

El editor web está en `/ubicar-bombas.html`, enlazado desde el visor y desde Áreas → Herramientas en móvil. Permite añadir TAG al catálogo, asignarlos a puntos, crear puntos, moverlos con ratón/tacto/teclado, nombrarlos, quitar/restaurar, deshacer, filtrar y descargar/cargar respaldo JSON. Guarda un borrador en el navegador. Exporta cambios con identificadores estables y píxeles de la imagen. El generador `node visor-bombas/tools/exportar-plano-bombas.mjs RUTA.html` crea un HTML autónomo con imagen, datos, estilo y lógica incorporados.

Referencia bloqueada: conservar plano dominante con sectores, lista lateral, paleta oscura/ámbar, tipografía y foco visible de la fuente. El visor existente aporta la navegación; `refero-design/references/craft-details.md` aporta foco/validación/formularios. Refero remoto devolvió NO_SUBSCRIPTION; no se atribuye investigación remota exitosa. No se agregaron fuentes de red al artefacto autónomo.

Se conserva el catálogo de 83 TAG y se parte de las asignaciones publicadas que corresponden a los puntos de la imagen. La imagen tiene 73 puntos originales, 2800 × 2504 px. Carece de calibración px→3D: las nuevas ubicaciones N y los movimientos x/z de A no se trasladan automáticamente. La interfaz explica que «Falta ubicar» se refiere a este plano. No se modificaron modelos, fichas, claves de fotos ni datos compartidos. No hubo intervención en Revit ni se cierra la adaptación Praj.

Responsables: general `/root`, implementación y comprobaciones; Herramientas e Innovación `/root/herramientas`, revisión de integración y posterior revisión independiente de validación/preservación. Recursos IA secuenció esa única convocatoria dentro del cupo; sin agentes permanentes. El revisor señaló TAG truncados y diferencia entre mapa vivo e imagen: ambos corregidos. También pidió comprobar clic posterior a pointerup: se añadió protección y se verificó sin creación accidental.

Comprobaciones reales: `npm ci --ignore-scripts`, luego `npm test`: **354/354**. El intento inicial sin dependencias falló por pdf-lib; el intento posterior bajo aislamiento falló por acceso TCP local. Suite completa fuera del aislamiento aprobada. Tres regresiones específicas cubren asignaciones, alta/reubicación, duplicados, límites, TAG largos y respaldos incompletos.

Chromium de prueba, contextos nuevos sin cuentas ni acceso a Supabase: mismo recorrido aprobado tanto por HTTP local como abriendo el HTML autónomo mediante file://. Alta B84 ficticia solo en navegador aislado, asignación sobre punto existente sin duplicación accidental, nueva posición, recarga, movimiento con flecha, nombre, deshacer, descarga, restauración del mapa e importación del respaldo. Cero errores JS. Capturas inspeccionadas a 1440, 390 y 320 px, sin desbordamiento horizontal. Datos de prueba y capturas permanecen en `informes-auditoria/ubicaciones/`, excluido de Git. La prueba no acredita mediciones en planta, sesión de producción ni teléfono físico.

La única excepción nueva de imagen en .gitignore es el fondo del editor extraído del HTML aportado; SHA256 `834e4db47b1e125787d3bcead2d6696ffb09254f7f5e226f1f7b2356d5b9212d`. No se incorpora el archivo original completo ni adjuntos de mantenimiento.

Publicación en dominio habitual y lectura de fotos con segunda cuenta: no verificadas, fuera del alcance del artefacto. El editor no reasigna ni sube fotografías.
