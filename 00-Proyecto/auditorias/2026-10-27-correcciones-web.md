# Correcciones de la auditoría web — VOCATUS

27 de octubre de 2026. Responsable de implementación y comprobación: Codex.
Base auditada: `989bce1`. Alcance: los ocho hallazgos A1–A3 y M1–M5 del informe.

| Hallazgo | Antes | Después | Comprobación |
|---|---|---|---|
| A1 · Reportar | Cambiar de B30 a B31 conservaba el problema de B30. | Cada TAG guarda y recupera su propio borrador, incluidos responsable, estado y repuestos. | Alternar B30/B31 directamente y mediante Reportar desde Historial. |
| A2 · Bodega | Una respuesta tardía de B30 podía agregarse bajo el selector B31. | Solo se muestra la última respuesta del TAG seleccionado; también se comprueba el TAG al agregar. Corrección aplicada a la app y a la solicitud independiente. | Respuesta B30 demorada y selección posterior B31; prueba de exclusión de respuestas anteriores. |
| A3 · Guardado | Vercel avisaba al final que no podía guardar en Obsidian. | Aviso inicial, guardado en este dispositivo, descarga de paquete y vista previa/importación explícita en el visor conectado. | Guardado y descarga sin POST en modo publicado; importación real en bóveda temporal y repetición sin duplicados. |
| M1 · Pendientes | Sin conexión con el estado real, decía que no había urgencias. | Estado no disponible y contadores sin dato; distingue un error de consulta de una lectura válida sin pendientes. | Respuesta sin escritura y error de red; no afirma ausencia de averías. |
| M2 · Giro de pantalla | Cruzar 900 px recargaba y borraba el formulario. | Adaptación sin recarga; borradores recuperables incluso después de recargar manualmente. | Cambio 390→915→390 px y recarga explícita. |
| M3 · Botón | Texto y fondo se volvían ámbar al pasar el cursor. | Texto oscuro sobre fondo ámbar, también con foco. | Colores calculados diferentes durante hover. |
| M4 · Carga 3D | Se cargaban la miniatura y la planta detallada aun sin necesitar el mapa. | Reportar abre sin descargar GLB; la planta detallada se solicita al necesitar el 3D. Miniatura de 17.322.988 a 8.085.864 bytes: 53,3 % menos. | Recursos del navegador: ningún GLB al abrir Reportar; en bienvenida solo miniatura, planta completa después de entrar. Se conservan 25 sectores en la miniatura. |
| M5 · Teclado | Tab enfocaba controles detrás de la bienvenida. | Foco inicial en Entrar, fondo inactivo y foco contenido hasta cerrar. | Tab/Mayús+Tab y entrada con teclado; el fondo vuelve a estar disponible al entrar. |

## Validación y límites

- Suite completa: **132/132 pruebas**, diez nuevas de regresión.
- Recorridos de Chrome automatizado en teléfono y PC; sin errores JavaScript en el recorrido final. No equivale a ensayo en teléfonos físicos.
- Todas las escrituras de prueba se hicieron en una bóveda temporal. No se modificaron fichas ni informes de la bóveda real.
- El paquete conserva TAG, fecha, autor, problema, repuestos y estado del equipo; no crea verificación de campo.
- El guardado en el dispositivo depende de conservar los datos de ese navegador. Descargar el paquete permite trasladarlo a otra computadora. Vercel sigue sin sincronización automática con Obsidian.
- La reducción del 53,3 % compara el mismo archivo GLB antes/después, sin comprimir. No se compara un tiempo de red local con el tiempo de la auditoría pública.
- El inventario de demostración P-9001/P-9002 señalado como limitación, la confirmación física de TAG y la revisión jurídica de todos los materiales no forman parte de estos ocho arreglos y siguen pendientes.

## Repetir las comprobaciones

Ejecutar `npm test` desde la raíz del proyecto. Las regresiones añadidas están en `visor-bombas/test-auditoria-web.mjs`.

Para comprobar el flujo completo, arrancar el servidor con `OBSIDIAN_VAULT` apuntando a una copia temporal de fichas. Alternar B30/B31, demorar una lectura de Bodega, cambiar ancho de pantalla, guardar y exportar un reporte en modo sin escritura; importarlo dos veces en el visor conectado y comprobar que existe una única intervención. No usar la bóveda real para reportes ficticios.

La revisión adicional confirmó Reportar a 320 px sin desbordamiento horizontal y la exclusión de respuestas tardías también en `solicitud.html`. Los recorridos finales no registraron errores JavaScript.

Las capturas, resultados y paquetes ficticios de ensayo se conservan localmente fuera del repositorio; no se publican fichas temporales ni informes ficticios.
