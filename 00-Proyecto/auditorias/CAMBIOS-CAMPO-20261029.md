# Cambios del croquis del 29 de octubre

Fuente: PDF aportado por el usuario, Notes_261029_092331.pdf, páginas 1–3; la cuarta está vacía. Fotografías y croquis orientan la representación visual: no aportan cotas ni especificaciones técnicas. El PDF y sus fotografías privadas no se incluyen en el repositorio.

Confirmaciones expresas del usuario:

- Un solo conjunto de bombas para todas las calderas.
- Agregar las dos bombas marcadas y separar el grupo de tanques de la torre de enfriamiento.
- La captura posterior del usuario precisa los tres objetos: depósito azul vertical, gabinete eléctrico alto y depósito auxiliar rectangular. Esta referencia corrige la asociación inicial con los paneles locales de las calderas.

## Implementación

`public/cambios-campo.js` se aplica después de asociar las piezas exportadas con sus TAG y antes de crear etiquetas y cajas de selección. Conserva los nombres y sectores de las referencias anteriores, que forman sus claves de almacenamiento.

- Sector de tanques: doce exteriores conservan sus TAG, posiciones y base. Cubiertas marrones con techo a dos aguas y abertura circular frontal real, según las fotos. Misma cubierta al abrir el detalle individual. Compactación por material para reducir llamadas de dibujo.
- Calderas: se retiran el depósito azul 1240637, el gabinete eléctrico alto 1240636 y el depósito rectangular 1240581. Los paneles locales 1240625/1240629 se conservan. Se añade un conjunto compartido de tres bombas verticales con bancada azul, colectores verdes y válvulas rojas. Tres selecciones individuales sin TAG inventado.
- Agua: se añaden las dos selecciones indicadas. La segunda queda separada de la bomba auxiliar anterior. El bloque de enfriamiento se desplaza visualmente con su base, ventiladores, colectores, soportes, bombas, canaleta; las tuberías de los tanques permanecen con ellos. Se recalculan cajas y se trasladan las selecciones afectadas. Separación adicional de presentación de 3 unidades métricas del modelo; no acredita una distancia medida ni una red hidráulica funcional.
- Las sustituciones y la separación se aplican al modelo Blender predeterminado, que conserva los nombres individuales. Para estos tres objetos se agregó también eliminación en el GLB original fusionado, filtrando sus triángulos dentro de las cajas canónicas verificadas. El generador que reproduce los índices de la exportación permanece intacto.

Catálogo: 28 TAG anteriores, 39 referencias integradas y una representación adicional en torre: 68 entradas de selección. No se afirma que sean 68 equipos físicos distintos. Las cinco entradas nuevas abren ficha vacía editable en Historial.

## Verificación

- Auditoría completa aislada: 189 pruebas aprobadas, cero fallos; cinco controles automáticos aprobados. Sin llamadas a IA.
- Barrera de Historial: 37 pruebas aprobadas. Incluye raycast que verifica el hueco circular, conservación de límites al compactar, claves/TAG, extracción geométrica de las cinco referencias e idempotencia.
- Navegador aislado local: vistas antes/después de calderas, agua y tanques; conjunto compartido al frente; cinco fichas nuevas abiertas con geometría propia y campos habilitados. Capturas de escritorio y 390 px. Ninguna ficha real escrita.
- Revisión independiente de código y geometría registrada fuera del repositorio en el espacio de coordinación.

La revisión no mide el sitio ni acredita conexiones funcionales, diseño hidráulico, medidas de fabricación o intervención en Revit. Estado de publicación y evidencias remotas se registran en el espacio de coordinación.

## Corrección tras captura del usuario

La eliminación inicial apuntaba a dos paneles locales en vez del gabinete alto y el depósito rectangular. Se corrigieron los tres IDs y se restauraron los paneles locales. La variante original fusionada también elimina esos tres equipos. El HTML y el módulo tienen versión nueva para renovar su carga.

Prueba adicional dentro de la barrera: lee nombres/cajas del GLB Blender real y decodifica posiciones e índices Meshopt del GLB original. Comprueba eliminación de los tres IDs, conservación de los paneles y de la nave y ausencia de geometría pendiente al repetir. Auditoría completa190/190; pruebas afectadas8/8. Navegador real: ambas variantes informan los tres IDs retirados, sin errores JavaScript.

## Ubicación corregida según captura posterior

El usuario indicó que el conjunto debe quedar pegado a la pared derecha desde la vista aportada. Se trasladó junto a la cara interior de esa pared y se giró la fila para dejar bombas y colectores paralelos al cerramiento. Se mantiene el mismo conjunto de tres selecciones, nombres y sectores; solo cambian posición, orientación y cajas. Una prueba geométrica incluida en Historial contrasta la bancada con la pared del GLB real para evitar cruce y retorno al centro. Ubicación de presentación, sin cota de campo.

## Fila del frente de tanques: seis bombas

El usuario aclaró expresamente que la fila frontal tiene seis bombas. La interpretación inicial de solo cambiar cubiertas dejaba incompleto este frente. Se conservan B22/B30/B31 y se agregan tres referencias sin TAG con su bancada y ficha individual. La fila suma seis y no se atribuyen TAG, fabricante ni medidas a los equipos todavía sin identificar. Nombres y sectores anteriores permanecen; catálogo total:28TAG+42referencias integradas+1representación de torre=71selecciones.

Las nuevas geometrías se colocan después de asociar los índices exportados, respetando posiciones existentes. Prueba de regresión acredita seis cuerpos, tres claves nuevas, extracción geométrica y apertura de cada ficha, sin superposición. Navegador local confirma seis cuerpos y tres fichas editables, con captura a390px. El contador de Áreas distingue equipos con TAG y referencias para no omitir los nuevos al mostrar el total. La cifra de seis procede de la confirmación del usuario, no del conteo inicial incompleto de la foto.
