# Revisión del inventario de fotos — 26 octubre 2026

Revisión de solo lectura de `Documents/revision-vocatus/clasificacion-fotos.html`, las 55 imágenes originales de `visor-bombas/public/expediente/` y las fichas B41, B19 y P-1462. No se cambiaron decisiones, fichas ni código. Se revisaron las 55 imágenes en hojas de contacto y se abrieron por separado las imágenes que sustentan los hallazgos siguientes. No se certifican transcripciones completas de números de serie ni identidades físicas.

## Resultado

El inventario separa categoría y TAG, conserva las discrepancias y contiene el filtro de los siete TAG de torre pendientes. Es apto para revisión, con los ajustes siguientes antes de usar sus decisiones para completar Avance.

1. **B41 tiene una discrepancia visible.** En `B41-placa.jpg` se reconoce HIDROMAC y el formato de placa de bomba, con campos hidráulicos. El inventario dice que la marca es ilegible, deja la categoría pendiente y clasifica el TAG como «Sin evidencia». La ficha B41 registra GOULDS. Proponer «Placa de bomba» y registrar «Foto: HIDROMAC · Ficha: GOULDS», dejando el TAG pendiente. Esto no demuestra que la ficha esté mal: también puede estar mal asociada la foto.

2. **Persisten categorías pendientes por dudas de identidad.** `B31-bomba2.jpg` y `B36-bomba2.jpg` muestran conjuntos de bomba y motor; el inventario las deja «Sin determinar» porque el Excel no fija su TAG. Proponer la categoría «Foto de bomba» o «Vista de varias bombas», manteniendo la identidad pendiente. Definir por separado si una vista de varios equipos puede cubrir el requisito de foto individual. No elevar el recuento de categorías confirmadas automáticamente.

3. **«Corregir» permite exportar una decisión incompleta.** El código solo guarda la palabra `corregir`; la nota es opcional y no hay campos específicos para categoría o TAG corregidos. Exigir el valor corregido, o tratar esa selección como pendiente de aclaración. Al importar, no interpretar «Corregir» como confirmación de la propuesta original. La exportación tampoco incluye íntegramente la evidencia y la duda: conserva el nivel de evidencia, pero no `cat_evid`, `tag_evid` ni `duda`. Para trazabilidad, incluirlos junto con una versión del inventario y la fecha de revisión.

4. **Dos placas de bomba no equivalen a bomba más motor.** El inventario propone correctamente varias «Placa de la bomba (segunda)». En el visor, las ranuras `placa1` y `placa2` significan placa de bomba y placa de motor. La futura incorporación debe mapear por categoría confirmada, nunca por el sufijo `placa2` del nombre del archivo. Conservar varias placas de bomba sin sobrescribir una con otra.

5. **B19/P-1462 sigue siendo hipótesis.** En la foto B19-placa2 se aprecia el grabado P-1462. La ficha B19 aporta 62392, 3500 RPM y 31.3 m, pero la ficha P-1462 tiene vacíos marca, modelo, serie, altura y RPM. Por tanto, no existe hoy una coincidencia independiente de esos datos entre ambas fichas. Verificar grabado, serie, ubicación y servicio antes de relacionarlas; no fusionar registros.

## Lecturas que mantienen sentido como propuestas

- Las placas Titan del grupo B17/B18/B20/B21 muestran datos de bomba; el contraste con DURCO en las fichas merece revisión, sin reemplazos automáticos.
- En B30 la imagen parece mostrar un tamaño distinto de 1X1.5-8 LF. Mantener lectura tentativa y TAG pendiente; no convertir la interpretación visual en dato vigente.
- Las fotos B3/B6/B7/B8 rotuladas originalmente como placa de motor tienen formato de placa hidráulica de bomba. Esto apoya revisar su categoría, no su asociación con un TAG.
- El filtro de torre incluye B2, B3, B4, B7, B8, B9 y B10; la ausencia de imágenes de B2/B9/B10 explica que no aparezcan tarjetas para ellos.

## Próximo paso

Ajustar el inventario y su exportación, revisar categoría e identidad por separado y guardar las decisiones como clasificación documental. Solo las asociaciones explícitamente confirmadas podrán alimentar Avance. Ninguna de estas decisiones debe crear una verificación de campo automáticamente.
