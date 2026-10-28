# Reparación de edición por TAG, fotos e interfaz — 28 octubre 2026

## Resultado y alcance

Se corrigió la edición de bombas identificadas, la persistencia de fotos y defectos de distribución reproducidos en el visor. El dominio web guarda los cambios en el navegador y los muestra junto a la ficha documental con su procedencia; Obsidian sigue requiriendo el visor local y traslado del paquete. No se añadió sincronización entre dispositivos ni se modificaron fichas reales, Revit o la USB.

## Fallos y correcciones

| Problema comprobado | Corrección |
| --- | --- |
| Edición por TAG escondida en un apartado cerrado | Accesos visibles a datos y fotos, selector explícito «Abrir equipo», confirmación del TAG vigente y regreso a ficha |
| «Guardar en la ficha» en nube solo descargaba JSON | Guardado local confirmado, restauración tras recarga y cambios visibles en la ficha con fecha, autor y estado pendiente de traslado |
| Adjuntos en localStorage con excepciones silenciadas | IndexedDB separado, migración que conserva la copia antigua, errores visibles y respaldo parcial identificado si falla la lectura |
| Cambio de TAG mientras se prepara una imagen | Cola por TAG, operaciones sobre su identidad capturada y bloqueo de guardado durante carga de ficha |
| Pestaña antigua podía borrar adjuntos de otra | Guardar datos no reescribe fotos; altas y bajas usan una transacción que conserva los cambios concurrentes |
| Selector de fotos categorizadas no abrió durante el recorrido | Input nativo visible y etiquetado por categoría y equipo, sin emulación de teclado |
| Fotos sin TAG tenían transferencias sin conectar y claves incompatibles | Transferencias enlazadas y formato independiente que conserva la referencia original, sin crear ni atribuir TAG |
| Repintar las fotos cerraba su apartado | El editor de fotos permanece accesible después de la actualización |
| Panel antiguo podía ocultar la ficha al cambiar de ancho | La aplicación de cinco secciones mantiene su ficha abierta y controla su propio diseño |
| Controles 3D sobre la lista TAG y Reportar sobre los datos | Barra 3D fuera de la franja TAG; Reportar integrado en el flujo y acciones del formulario sin cubrir campos |
| Ancho mínimo del resumen y pestañas cortaba la ficha pequeña | Columnas con mínimo cero, texto adaptable y verificación del contenedor a 320 px |

## Verificación real de navegador

Navegador integrado mediante cua_repl, servidor local en modo VERCEL de solo lectura y origen de prueba `http://127.0.0.1:8879`. Datos ficticios claramente identificados. Imágenes de prueba: logo público del propio proyecto. Ninguna intervención ficticia en la bóveda real.

- B30: ingresar nombre y código de sello, guardar, recargar; ambos valores restaurados.
- Abrir B31: campos de B30 vacíos; regresar a B30 conserva su borrador y registro.
- Adjuntar imagen, recargar: miniatura conservada y decodificada.
- Foto categorizada de sello: selector nativo abrió, imagen guardada; recarga y enfoque confirmaron `naturalWidth=200`.
- Dos pestañas: una carga un adjunto, la otra agrega otro; guardar solo datos desde la primera y recargar conserva dos imágenes completas.
- Descargar fotos B30 e importar el mismo archivo: cero incorporadas, una casilla existente conservada.
- Componente real de ficha pendiente en arnés temporal: guardar foto, descargar referencia con dos puntos y Unicode, importar sin duplicar y recargar conserva la imagen. El paquete contiene `vocatus-reference-photos`, una referencia original y ningún TAG. El arnés no se publica.
- Regresar a ficha: cambios locales visibles y acceso de edición disponible. Historial de B30 conserva la foto y muestra el cambio local identificado.
- Anchos 390, 320 y 1280: ficha accesible al cruzar el punto de corte. A 320, contenedor de 314 px y scrollWidth 314 px; a 1280 no hay intersección de barra 3D y franja TAG ni desbordamiento del contenido.

La prueba del cambio de TAG detectó que la herramienta no disparó consistentemente el cambio implícito al salir del campo. Se añadió y verificó la acción explícita, conservando el evento de cambio y Enter.

## Pruebas y revisión independiente

`npm test`: **158 aprobadas, 0 fallos**. Incluye guardado local confirmado, cuota simulada, migración conservadora, actualización concurrente entre dos instancias, fotos TAG/referencias, escape de datos y estado de cambios locales.

General `/root`: integración y recorridos de navegador. Herramientas/Reparación `/root/innovacion_persistencia`: levantamiento y almacenamiento. Reparación `/root/reparacion_fotos`: fotos categorizadas y referencias. Recursos de IA coordinado por el general: encargos acotados, máximo cuatro agentes concurrentes y sin edición de Revit.

Calidad independiente `/root/calidad_independiente` devolvió dos defectos antes de publicar: sobrescritura de fotos por caché antigua y regeneración de campos durante un envío. Tras corrección revisó el código y ejecutó cinco pruebas; aceptó esos dos arreglos con alcance limitado. La comprobación real de dos pestañas la completó el general después. La revisión no constituye una garantía de ausencia de cualquier otro fallo.

## Referencias visuales y límites

Se conserva el producto Vocatus existente como referencia principal: paleta ámbar, tipografía, modelo y estructura de cinco secciones. Se aplicó la guía de detalle de formularios de Refero (etiquetas, foco y estados de envío). La consulta viva de Refero respondió sin suscripción activa; no se atribuyen referencias externas no obtenidas. Las decisiones de corrección se apoyan en las capturas y fallos de este producto.

Fotos que nunca llegaron a almacenarse antes del arreglo no se recuperan por esta modificación. Se preservan las copias antiguas que sí existen. La prueba no cubre cada dispositivo físico, cámara o navegador; los errores de cuota y concurrencia extrema se verificaron con almacenamiento simulado además del recorrido real indicado.
