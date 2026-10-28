# Interfaz y fotos de evidencia — 28 octubre 2026

## Resultado

Reportar se organiza en cuatro bloques abiertos: equipo, trabajo/evidencia, estado y responsable/fecha. Se mantienen el resumen lateral, los filtros de Historial, los controles 3D y la cabecera animada. Se incorporan encabezados consistentes en las cinco secciones, transiciones ligeras y una acción de guardar más compacta en teléfono. Las evidencias del historial quedan visibles fuera del formulario plegado de agregar reporte.

Fotos de evidencia: botones Añadir fotos y Tomar foto, arrastrar en PC, miniaturas, ampliar y quitar antes de guardar. Hasta cuatro imágenes JPG/PNG/WebP, originales de hasta 8 MB; se convierten a JPEG de hasta 1600 px y 500 KB por foto, eliminando metadatos del archivo original durante la conversión. El original del dispositivo no se modifica. El acceso real a cámara depende del selector del navegador/teléfono; no se ensayó una cámara física.

## Referencias y herramientas

Refero consultado mediante sus herramientas: NO_SUBSCRIPTION. Se aplicaron las guías locales Craft/Motion. No se encontró una herramienta conectada de 21st; su biblioteca pública se consultó como referencia para agrupación, miniaturas, lista removible y progreso. No se copió su componente ni se instalaron React/dropzone u otras dependencias.

- https://21st.dev/@ephraimduncan/components/file-upload-03
- https://21st.dev/@ephraimduncan/components/file-upload-01

## Persistencia y límites

Las fotos de borrador se guardan por TAG en IndexedDB, separadas del texto en localStorage. La versión 2 conserva el almacén y los reportes anteriores; si una pestaña antigua bloquea la actualización, se informa y se permite reintentar después de cerrarla. Cambiar de TAG no asigna las fotos al equipo nuevo y una recarga recupera el borrador.

En Vercel los reportes y fotos quedan en el navegador; no hay sincronización automática con Obsidian. El paquete JSON incluye las fotos y admite hasta 5 MB. La importación desde el visor conectado guarda archivos en Mantenimiento/Adjuntos y enlaces en el informe. La consulta de fotos valida TAG/informe/índice y devuelve el tipo de imagen correspondiente. Se validan cabeceras de archivo, tipos permitidos, base64, cantidad y tamaño; SVG y contenido HTML no se aceptan. El servidor no usa los nombres aportados como rutas.

Los reintentos con las mismas fotos no duplican informes. Si el identificador ya existe con evidencia distinta, se informa y se conserva el borrador; no se descartan fotos silenciosamente. Un fallo al escribir una segunda foto retira las nuevas fotos de ese intento y no crea el informe. Al eliminar un informe se envían el documento y sus fotos a la papelera de Obsidian.

## Validación

140 pruebas pasan, con regresiones para validación de evidencia, paquetes compatibles, conservación exacta, idempotencia/colisión, papelera y fallo parcial. Navegador en PC, 390 y 320 px: actualizar un almacén antiguo sin perder reportes, añadir/ampliar/quitar fotos, alternar TAG, recuperar después de recarga, rechazar archivo falso/exceso sin descartar fotos, guardar local sin POST, exportar e importar en una bóveda temporal, repetir sin duplicar y ver/ampliar la foto desde Historial. Sin errores de página ni desbordamiento horizontal en las muestras. Prueba de bytes y tipo MIME del archivo recuperado iguales al paquete.

Solo bóvedas temporales y fotografías ficticias de prueba. No se modificaron fichas reales ni Revit. Las capturas y paquetes de ensayo se conservan fuera del repositorio y no se publican. La prueba automatizada no equivale a usar un teléfono físico.
