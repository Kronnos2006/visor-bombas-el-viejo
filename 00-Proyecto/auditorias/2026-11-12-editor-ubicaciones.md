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

## Corrección de apertura directa del archivo

El usuario mostró una captura abriendo `public/ubicar-bombas.html` por file://, sin estilos ni plano: la versión web dependía de rutas absolutas e importaciones/fetch. Se corrigió ese mismo archivo para distribuirlo autónomo, tanto en web como con doble clic. La plantilla editable pasa a `tools/ubicar-bombas.template.html`; el generador incorpora CSS, imagen, datos y módulos en `public/ubicar-bombas.html` por defecto. En file:// se retira el enlace al visor; en HTTP se conserva. El HTML exportado en outputs también fue regenerado.

Se repitió el recorrido Chromium contra la ruta exacta de la captura, abierta mediante file://: alta, asignación, recarga, movimiento, nombre, deshacer, exportar/importar y tamaños 1440/390/320 px aprobados, sin errores JS. Suite requerida: 354/354. Captura móvil inspeccionada. La prueba usa un contexto nuevo, sin escribir datos reales.

## Registro completo y acciones visibles

El usuario señaló que no se registraban las posiciones ya colocadas y no encontraba añadir/eliminar. La salida anterior solo enumeraba diferencias. Ahora el registro incluye todas las posiciones activas, TAG, nombre, píxeles, sector e ID, las bombas sin posición y después los cambios. La lista muestra X/Y de cada bomba colocada. Seleccionarla abre su editor de coordenadas; mover conserva el mismo ID, TAG y número de puntos.

Se añadieron acciones visibles «Añadir bomba», «Mover bomba», «Eliminar bomba» y «Guardar posiciones». El alta dejó de estar escondida en un desplegable. El guardado muestra confirmación o fallo y recupera el estado anterior al recargar. Eliminar conserva el TAG en el registro retirado para restaurarlo; si otro punto ya usa ese TAG, restaurar devuelve el punto sin duplicarlo. No elimina fichas, fotografías ni catálogo histórico.

Herramientas revisó de forma independiente estos cambios y señaló guardado de campos pendientes, modo mover residual y selección fuera del recorte. Se corrigieron con guardado compartido antes de guardar/copiar/exportar, cancelación del modo al importar/restablecer/vaciar/soltar y comprobación del recorte al seleccionar o mover.

Comprobaciones actuales: **355/355 pruebas**; regresión nueva exige que una bomba sin cambios figure en el registro con sus coordenadas. Recorrido Chromium file:// en contexto aislado: seleccionar B3 existente; editar coordenadas y guardarlas desde el botón principal; recargar y comprobar coordenadas exactas; mover con ID estable; eliminar/restaurar con TAG; añadir B84; arrastrar con ratón y recargar con posición exacta; guardar nombre pendiente; seleccionar desde otro sector y encontrar el punto; soltar B4 durante modo mover B3 sin sustituir B3. Botones visibles, cero errores JS y sin desbordamiento a 1440/390/320 px; captura móvil inspeccionada. Evidencia local en `informes-auditoria/ubicaciones/funcional-*.png` y `qa-funcional.cjs`, excluidos de Git. Mismo CACHE/version anterior para conservar el avance del usuario. HTML web y copia autónoma regenerados.

Conclusión de la revisión independiente: Herramientas confirmó la corrección de los tres hallazgos en JS y HTML generado, ejecutó las cuatro pruebas del núcleo y no encontró errores adicionales en esos cambios concretos. La comprobación en navegador fue realizada por el general y se distingue de esa revisión de lectura.

## Entrada de la plantilla interna

Una nueva captura mostró que el usuario había abierto `tools/ubicar-bombas.template.html` con doble clic. Se añadió una entrada automática desde esa ruta local al HTML completo de `public/ubicar-bombas.html`. El generador retira esa entrada del artefacto empaquetado, evitando redirecciones en las copias portátiles. Recorrido funcional Chromium iniciado desde la ruta exacta de la plantilla: aprobado, con alta, movimiento, borrado/restauración y persistencia tras recarga. No se sustituyó ni vació el almacenamiento del navegador del usuario.
