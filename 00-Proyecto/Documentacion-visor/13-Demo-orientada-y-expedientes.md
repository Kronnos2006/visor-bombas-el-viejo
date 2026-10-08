---
fecha: 2026-10-07
estado: implementado-demo
---

# Demo orientada y expedientes por bomba

[[00-Inicio|Inicio]] · [[12-Levantamiento-fotografico-del-area|Levantamiento anterior]]

## Respaldo anterior

Antes de esta modificación se creó `<RUTA-LOCAL>/vocatus/auto cad/respaldos/visor-bombas-antes-orientacion-2026-10-07.zip`. Contiene el visor completo tal como estaba antes de incorporar el tercer lote de fotos y los expedientes de demostración.

## Nueva evidencia

`fotos bombas 3.zip` contiene 34 archivos HEIC. Los originales se conservaron sin modificar en `Evidencia/Fotos-bombas-3-2026-10-07/Originales`; las copias JPG, tres hojas de contacto y el inventario con SHA-256 están en la misma carpeta documental. Las vistas elevadas `142517` a `142624` aportan la referencia principal para la matriz de tanques. Las vistas a nivel de piso confirman grupos de bombas en más de un frente.

## Cambios en la escena

- La propuesta representa 15 tanques en tres filas, con alturas y diámetros variados, techo, boca de visita y venteo. El conteo y las proporciones son aproximados a partir de fotografías; no constituyen un plano as-built.
- Se muestran 9 posiciones temporales: 3 bombas en el frente principal, 2 en el lado izquierdo, 2 en el lado derecho y 2 en el frente posterior.
- Se retiraron la escalera y todas las tuberías de la escena por indicación del usuario. Permanecen los muros, pedestales, bombas y tanques.
- Cada conjunto usa una variante visual LF, MTO o Titan basada en las familias identificadas. No hay archivo CAD STEP/IGES del fabricante; el modelo no debe presentarse como geometría certificada.
- La vista explosionada permanece disponible por bomba y se identifica como demostración con medidas pendientes.

## Expediente seleccionado

El inspector deja de mostrar todas las placas a la vez. Al seleccionar una de las 9 posiciones visibles, muestra solamente:

- fotografía de referencia asignada a esa posición;
- fabricante, modelo, tamaño y serie usada en la demostración;
- sello mecánico, diámetro, caras y elastómero;
- tres o-rings con posición, medida, material, cantidad y código;
- historial de tres intervenciones;
- posibles fallas a vigilar.

Las fotografías y lecturas de placa provienen del levantamiento. La relación placa ↔ posición, el servicio, el sellado, los o-rings, los códigos y el historial fueron preparados para la presentación y están rotulados **DEMO / POR CONFIRMAR**. No deben usarse para comprar repuestos ni intervenir equipos reales.

## Navegación por componente y fotografías

- La vista explosionada ofrece diez componentes seleccionables: carcasa, o-ring de carcasa, impulsor, tapa posterior, sello mecánico, eje, rodamientos, soporte, acoplamiento y motor.
- Al tocar una pieza, el visor la resalta, abre la pestaña **Ficha**, coloca la información de esa pieza al inicio del expediente y desplaza el panel hasta ella.
- En la vista individual también aparecen botones para seleccionar cualquiera de los diez componentes, además del control para volver a la planta.
- El expediente de la bomba seleccionada muestra directamente dos imágenes: una fotografía del conjunto de bomba y una fotografía de su placa. Ya no quedan ocultas dentro de secciones desplegables.
- Las medidas y referencias de componentes continúan identificadas como **DEMO / POR CONFIRMAR** mientras no exista un levantamiento dimensional o CAD certificado.

## Interfaz unificada

- Se retiró el selector **Fichas de Obsidian / Sector fotografiado** porque dejaba visible una planta de prueba antigua con P-9001 y P-9002, separada del levantamiento actual.
- La barra lateral muestra únicamente las nueve posiciones temporales del sector. Cada posición reúne su foto exterior, placa asociada para la demo, ficha, historial, despiece e IA.
- Obsidian continúa como almacenamiento y documentación del proyecto, pero ya no aparece como una segunda vista aislada.
- La pestaña **IA · Gemini** ahora consulta el expediente integrado de la bomba seleccionada. El servidor marca siempre ese contexto como demostración y pendiente de confirmación.
- P-9001 y P-9002 permanecen en `demo-vault` solamente para pruebas automáticas del servidor; no se muestran en la aplicación.

## Código y verificación

- Datos de escena y expedientes: `visor-bombas/public/sector-fotos.js`.
- Interacción y panel por bomba: `visor-bombas/public/app.js`.
- Fotografías servidas por la demo: `visor-bombas/public/fotos3`.
- Conversor reproducible: `visor-bombas/tools/preparar-fotos.py`.
- Prueba específica: `node visor-bombas/test-sector.mjs`.

La prueba verifica la distribución 3/2/2/2, 9 expedientes únicos, tres o-rings y tres registros por expediente, 15 tanques sin superposición, etiquetas DEMO, disponibilidad de las fotografías, navegación al detalle de la pieza y presentación simultánea de la foto de la bomba y su placa. También se mantienen las pruebas del servidor y del layout anterior.
