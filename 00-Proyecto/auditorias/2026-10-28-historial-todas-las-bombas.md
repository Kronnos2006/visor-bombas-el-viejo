# Historial: ficha de cualquier bomba del 3D — 28 octubre 2026

## Encargo y corrección

El usuario exige que tocar una bomba del 3D en Historial abra su ficha actual y permita ingresar datos aunque esté vacía. La reparación anterior solo abría la envoltura de ficha mediante el evento de bombas con TAG. Las referencias sin TAG cambiaban el modelo seleccionado, pero no abrían el panel. Todas además compartían el texto `Sin TAG`, insuficiente como identidad.

Ahora las referencias emiten un evento propio y cada apertura se verifica contra su clave persistente de sector/nombre. Se conserva el esquema de almacenamiento anterior; no se inventan TAG ni se enlazan fichas por semejanza. Las selecciones atrasadas se cancelan al cambiar de bomba o sección. El puente admite seleccionar una referencia y la navegación conserva su identidad. La representación sin TAG de la torre también tiene etiqueta y geometría seleccionables.

Historial incluye todas las fichas y referencias disponibles, incluso vacías. Las pendientes abren primero el formulario actual; el resumen queda después. Repintar la misma referencia o cambiar el ancho conserva lo que se esté escribiendo. Las referencias sin TAG no se introducen en los selectores de mantenimiento y bodega como si fueran equipos identificados.

## Cobertura y evidencia

- Registro: 28 TAG y 34 referencias integradas procedentes de 18 grupos; además una representación sin TAG de la vista torre. Son 63 identidades de selección, no una afirmación de 63 bombas físicas distintas; la correspondencia física de la representación de torre no está acreditada.
- Navegador integrado, servidor local en modo VERCEL de solo lectura: se abrieron una por una las 35 referencias y las 28 bombas con TAG desde Historial. Se comprobó panel visible, identidad seleccionada y formulario propio o enlace de edición correspondiente. Registro completo: [selecciones.json](selecciones.json).
- Clic real en la etiqueta del 3D de Fermentación: abre la referencia «Cuatro bombas dos por tanque del lado oficina · Bomba 4» y permite guardar un valor ficticio local.
- Clic real por coordenadas sobre el cuerpo visible de otra bomba, después de acercar el modelo: abre «Dos bombas frontales y tres frente a semilleros · Bomba 2», con formulario e identidad correctos. Este caso prueba geometría, no solo lista o etiqueta.
- La segunda referencia no hereda la marca de la primera. Regresar a la primera y recargar conserva la marca guardada.
- Escribir un modelo sin guardar y cambiar a 390 × 844 conserva el texto. Captura: [ficha-pendiente.jpg](ficha-pendiente.jpg).
- `npm test`: **162 aprobadas, cero fallos**. La regresión nueva ejecuta las funciones actuales de selección y apertura para las 63 identidades con DOM/cámara simulados; comprueba eventos, cancelación de aperturas viejas y transformación del centro una sola vez.

Las selecciones por lista cubren todas las identidades. El clic geométrico real fue representativo; no se afirma haber pulsado cada malla en cada cámara o dispositivo. No se modificaron fichas reales, mantenimiento de producción, Revit ni USB. Los datos ficticios solo están en el origen local de prueba.

## Revisión independiente y responsables

General `/root`: implementación y pruebas reales del navegador. Calidad independiente `/root/calidad_independiente`: encontró las rutas sin evento, la identidad compartida y la torre sin selección; revisó las correcciones y produjo cuatro pruebas nuevas. Aceptó la implementación condicionada a verificar clic y guardado reales; el general completó los recorridos descritos después. Recursos de IA coordinado por el general: encargo acotado y sin edición concurrente de Revit.

Publicación y comprobación del dominio se registran después del commit. Se conserva la autorización explícita del usuario para publicar la reparación en main.
