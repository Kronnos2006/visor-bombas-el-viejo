# Auditoría independiente de la integración d41e5c8

Fecha: 26 de octubre de 2026. Alcance: comprobar el informe de integración contra Git, código, pruebas y reproducciones en una copia independiente.

## Dictamen

La integración existe y los resultados principales del informe son verificables. Sin embargo, quedan **tres defectos funcionales reproducidos** que la suite de 100 pruebas no detecta. No corresponde dar por cerrada la corrección de integridad de datos hasta resolverlos.

Estos defectos ya estaban en la copia corregida: no se atribuyen al traslado realizado en el commit.

## Hallazgos

### [P1] Cambiar datos técnicos de placa no siempre invalida su verificación

**Ubicación:** `C:\Users\genes\Documents\visor-bombas-el-viejo\visor-bombas\survey.mjs`, líneas 189–193. Los campos `caudal`, `altura` e `impulsor` se clasifican en el grupo visual `general`, mientras que la invalidación comprueba el grupo `placa`.

**Reproducción:** en una ficha de prueba con identidad, placa y repuestos verificados explícitamente, cambiar el caudal de **8 a 11 GPM**, sin solicitar verificación nueva.

**Resultado:** `verified` permanece `true` y `scopes.placa.verified` también permanece `true`, aunque el dato de placa cambió. El registro de evidencia anterior se sigue presentando como vigente.

**Impacto:** el chip puede volver a afirmar una verificación que no corresponde al contenido actual. La separación de alcances resolvió el guardado automático de observaciones, pero no cubre todas las modificaciones posteriores.

**Corrección recomendada:** declarar qué alcances invalida cada campo, independientemente del apartado visual del formulario. Incluir caudal, altura e impulsor en los cambios de placa; revisar también nombre/identidad y fluido/compatibilidad de repuestos. Añadir pruebas por grupo de campos y comprobar que volver a verificar requiere selección explícita y nueva evidencia.

### [P2] Avance ignora las fotos guardadas desde el editor de imágenes

**Ubicación:** `survey.mjs:89` evalúa únicamente la lista YAML `fotos`. El editor «Actualizar fotos» utiliza `pump-photos.mjs` y guarda en `fotos-campo/<TAG>/expediente/`, sin actualizar esa lista.

**Reproducción:** ficha de prueba con `fotos: []`; guardar una foto de **placa de bomba** con el mismo almacenamiento que usa `/api/pump-photo`; consultar el avance.

**Resultado:** la foto está almacenada y `/api/pump-photos` la reconoce, pero `checks.fotos` continúa `false`.

**Impacto:** el técnico ve la imagen actualizada mientras Avance mantiene el apartado Fotos como pendiente. La explicación de 43 frente a 62 es correcta, pero el estado documental de fotos puede seguir siendo incorrecto.

**Corrección recomendada:** unificar el criterio y la fuente de fotos entre el editor y Avance. Si la categoría exige determinados tipos de imagen, indicarlo expresamente. Añadir una prueba que suba una imagen por la API de fotos y después consulte `/api/progress`.

### [P2] Un fallo al escribir una foto deja de servir la imagen vigente anterior

**Ubicación:** `pump-photos.mjs:32–33` mueve primero la imagen anterior al historial y después escribe la nueva. No hay restauración ante error. Además, `current()` en la línea 17 acepta cualquier resultado de `stat`, incluidos directorios, sin comprobar `isFile()`.

**Reproducción controlada:** guardar una imagen JPG de sello; simular un destino de escritura inválido creando un directorio llamado `sello.png`; intentar sustituirla por PNG.

**Resultado:** el guardado falla con `EISDIR`, el JPG anterior ya no existe en la ruta vigente —está en el historial— y leer la foto actual vuelve a fallar con `EISDIR`. El listado puede incluso anunciar una URL cuyo destino es un directorio.

**Impacto:** no se pierde definitivamente la imagen anterior, pero un guardado fallido rompe la foto vigente y requiere recuperación. La simulación fuerza un fallo de escritura; no significa que esta situación haya ocurrido en la bóveda real.

**Corrección recomendada:** escribir primero un archivo temporal; conservar o restaurar la foto anterior si falla la confirmación del cambio. Validar `isFile()` en la búsqueda de fotos. Probar fallos de escritura y restauración, además de las sustituciones exitosas.

## Lo confirmado del informe de integración

| Afirmación | Resultado |
|---|---|
| Commit `d41e5c8` | Existe; `HEAD` de la rama `correcciones-auditoria` |
| 37 archivos en el commit | Confirmado |
| 100 pruebas pasando | Confirmado en una copia independiente |
| Potencia anterior como antecedente | Confirmado: una ficha de prueba pasa de 2 HP a 1.5 kW, conserva el antecedente de 2 HP con fecha y responsable y deja un solo valor vigente |
| Fechas imposibles y RPM negativas rechazadas | Confirmado nuevamente |
| Guardar una observación no verifica automáticamente | Cubierto por la suite y por la lógica vigente |
| Respaldo antes del levantamiento | Cubierto por la suite, incluido rechazo del guardado si el respaldo falla |
| Fichas originales intactas | Confirmado por SHA-256: las 92 fichas inspeccionadas conservan las huellas anteriores a la integración |
| Sin fichas reales ni datos de demostración nuevos en el commit | No aparecen cambios bajo `00-Proyecto/equipos`, `00-Proyecto/bombas` ni `visor-bombas/demo-vault` en la diferencia del commit |
| Archivos excluidos del commit | Permanecen modificados AGENTS.md, 22-Pedido-al-fabricante.md y P-9001.md; la comparación que ignora finales de línea no muestra cambios de contenido. `package-lock.json` permanece sin seguimiento |

El registro antiguo de P-1401 no fue cambiado en esta auditoría. Su evidencia requiere revisión humana; no se declara falsa su verificación histórica.

## Observación no considerada un bloqueo

El formulario elimina el fragmento `#editar-sello` de la dirección al seleccionar el TAG (`levantamiento.js:95`). Aunque eso pierde la sección en la URL compartible, en la prueba realizada el navegador mantuvo el apartado visible —su borde superior quedó a 236 px—. Por ello **no se afirma que el acceso a la sección esté roto** ni se incluye como uno de los tres defectos principales.

## Método y límites

- Código original y Git: lectura, sin editar ni crear commits.
- Suite: ejecutada sobre `work/auditoria-integracion-d41e5c8`, con sus propias bóvedas temporales.
- Reproducciones: fichas y fotos sintéticas en una bóveda de prueba dentro de `work`; ninguna escritura en fichas reales.
- Navegador: editor servido por una instancia temporal, detenida al finalizar.
- No se repitió toda la auditoría estética ni se probó un teléfono físico.
- No se consultaron GitHub o Vercel; la afirmación sobre ausencia de publicación no se certifica mediante una comprobación remota.

## Evidencias

- `auditoria-integracion-pruebas.txt`: salida de las 100 pruebas.
- `auditoria-integracion-reproducciones.json`: valores antes y después de cada caso reproducido.
- `auditoria-enlace-sello.png`: captura de la comprobación del enlace al editor.

**Orden recomendado:** corregir primero la invalidación de verificación, después la coherencia del avance de fotos y la recuperación ante fallos al sustituir imágenes. Conservar los tres casos como pruebas de regresión antes de dar el cierre definitivo.
