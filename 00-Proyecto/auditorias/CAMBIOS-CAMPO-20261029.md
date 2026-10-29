# Cambios del croquis del 29 de octubre

Fuente: PDF aportado por el usuario, Notes_261029_092331.pdf, páginas 1–3; la cuarta está vacía. Fotografías y croquis orientan la representación visual: no aportan cotas ni especificaciones técnicas. El PDF y sus fotografías privadas no se incluyen en el repositorio.

Confirmaciones expresas del usuario:

- Un solo conjunto de bombas para todas las calderas.
- Agregar las dos bombas marcadas y separar el grupo de tanques de la torre de enfriamiento.
- Retirar los dos tableros pequeños frente a las calderas y el depósito azul vertical del medio.

## Implementación

`public/cambios-campo.js` se aplica después de asociar las piezas exportadas con sus TAG y antes de crear etiquetas y cajas de selección. Conserva los nombres y sectores de las referencias anteriores, que forman sus claves de almacenamiento.

- Sector de tanques: doce exteriores conservan sus TAG, posiciones y base. Cubiertas marrones con techo a dos aguas y abertura circular frontal real, según las fotos. Misma cubierta al abrir el detalle individual. Compactación por material para reducir llamadas de dibujo.
- Calderas: se retiran solo los paneles locales 1240625/1240629 y el depósito auxiliar 1240637. Se conserva el cuadro eléctrico general y los demás equipos. Se añade un conjunto compartido de tres bombas verticales con bancada azul, colectores verdes y válvulas rojas. Tres selecciones individuales sin TAG inventado.
- Agua: se añaden las dos selecciones indicadas. La segunda queda separada de la bomba auxiliar anterior. El bloque de enfriamiento se desplaza visualmente con su base, ventiladores, colectores, soportes, bombas, canaleta; las tuberías de los tanques permanecen con ellos. Se recalculan cajas y se trasladan las selecciones afectadas. Separación adicional de presentación de 3 unidades métricas del modelo; no acredita una distancia medida ni una red hidráulica funcional.
- Las sustituciones y la separación se aplican al modelo Blender predeterminado, que conserva los nombres individuales. El archivo original accesible mediante el parámetro de diagnóstico no permite retirar piezas individuales fusionadas; no se presenta como evidencia de esa sustitución. El generador que reproduce los índices de la exportación permanece intacto.

Catálogo: 28 TAG anteriores, 39 referencias integradas y una representación adicional en torre: 68 entradas de selección. No se afirma que sean 68 equipos físicos distintos. Las cinco entradas nuevas abren ficha vacía editable en Historial.

## Verificación

- Auditoría completa aislada: 189 pruebas aprobadas, cero fallos; cinco controles automáticos aprobados. Sin llamadas a IA.
- Barrera de Historial: 37 pruebas aprobadas. Incluye raycast que verifica el hueco circular, conservación de límites al compactar, claves/TAG, extracción geométrica de las cinco referencias e idempotencia.
- Navegador aislado local: vistas antes/después de calderas, agua y tanques; conjunto compartido al frente; cinco fichas nuevas abiertas con geometría propia y campos habilitados. Capturas de escritorio y 390 px. Ninguna ficha real escrita.
- Revisión independiente de código y geometría registrada fuera del repositorio en el espacio de coordinación.

La revisión no mide el sitio ni acredita conexiones funcionales, diseño hidráulico, medidas de fabricación o intervención en Revit. Estado de publicación y evidencias remotas se registran en el espacio de coordinación.
