---
actualizado: 2026-10-26
estado: vigente
---

# Interfaz y validación — 26 de octubre de 2026

Esta nota describe la interfaz vigente y complementa los README. Las notas fechadas el 7 de octubre y sus copias de código son evidencia histórica: no describen necesariamente la aplicación actual. El código ejecutable sigue en `visor-bombas/`.

## Consulta de equipos

- Las vistas simple y completa comparten el tema ámbar/caña y el selector claro/oscuro. La vista completa muestra controles adicionales.
- El buscador admite TAG, nombre, servicio, zona, marca, modelo, serie y tamaño. Ignora tildes, mayúsculas, espacios y guiones (`b-14` encuentra B14).
- El contador indica resultados y total. Limpiar filtros vuelve a toda la planta y elimina texto, tipo, marca y sector.
- El expediente mantiene Ubicar, Fotos, Manual y Mantenimiento en su cabecera. Ubicar conserva la ficha abierta; Fotos abre su sección; Mantenimiento lleva al formulario. Un manual pendiente no abre documentación de otra marca.
- Los apartados se pueden plegar y recuerdan su estado durante la sesión. El resumen técnico está dentro del panel desplazable, no ocupa toda la cabecera.
- En pantallas de hasta 900 px la ficha tiene estados cerrada, plegada y abierta. La selección no desplaza la página. Al abrir la ficha se reserva una vista del modelo arriba; el menú de campo permanece disponible abajo.

## Documentación y verificación

`Completos N/M` cuenta valores registrados; no demuestra exactitud técnica. `Verificado en campo` exige una persona y una fecha válida registradas. El modo DEMO identifica las verificaciones de ejemplo.

Avance calcula el porcentaje usando placa, sello, empaque, o-rings, fotos y bodega, excluyendo lo que no aplica. La verificación se muestra en una columna independiente y tiene filtros propios. El campo de verificación no suma al porcentaje documental.

La respuesta de `/api/progress` añade `verification.author` y `verification.date`. Se conservan `done`, `total` y `checks` por compatibilidad; la página calcula su propio progreso documental sin `checks.verificado`.

Los destinos se identifican en pantalla: Obsidian, demostración o almacenamiento solo en el navegador. En demostración local los informes usan la bóveda de prueba y los rangos de temperatura permanecen en el navegador.

## Cámara y fallos

Los botones Acercar, Alejar y Girar permiten mover la cámara sin arrastrar, con objetivos de al menos 44 px. Se conserva el movimiento reducido y el foco visible.

La carga del modelo muestra el porcentaje cuando conoce el tamaño; si no lo conoce, muestra una descarga indeterminada y los MB recibidos. El servidor local informa el tamaño de los archivos estáticos. Durante la preparación del modelo puede permanecer en 100 % antes de mostrarse.

Si falla la descarga o WebGL, se puede Reintentar o Seguir solo con las fichas. La recuperación usa la configuración actual y no cambia datos de equipos.

## Validación reproducible

- `npm test`, desde la raíz o desde `visor-bombas/`, ejecuta la misma suite: 80 pruebas al cierre de esta revisión.
- `node visor-bombas/tools/e2e-interfaz.mjs` ejecuta la revisión en navegador usando Playwright y un servidor DEMO independiente. Requiere Playwright y un navegador compatible. No registra intervenciones ni modifica la bóveda real.
- Opciones del navegador: `PLAYWRIGHT_MODULE` permite indicar el módulo instalado; `BROWSER_EXECUTABLE`, el ejecutable de Chrome/Chromium; `UI_SCREENSHOTS_DIR`, la carpeta de capturas. Si no se indica carpeta, usa una carpeta temporal.
- Se comprueban búsqueda, continuidad de selección, acciones del expediente, estado de apartados, movimiento de cámara, ficha móvil, ausencia de desbordamiento a 360 px, filtros de Avance, recuperación de descarga y consulta sin WebGL.
- Se capturan visor, expediente, historial, simulador, levantamiento, Avance, bodega y mover/cambiar en escritorio y celular, además de vista completa, modo claro y recuperación del 3D.

Las capturas móviles se obtienen mediante emulación en Chrome; queda pendiente comprobar los dispositivos físicos usados en planta. No se realizó una consulta real a Gemini ni se configuró su clave.

## Pendientes de campo

B2, B3, B4, B7, B8, B9 y B10 coinciden con bombas dibujadas en el modelo de Blender. La posición geométrica está comprobada, pero la correspondencia física entre TAG y bomba debe confirmarse en planta. No se reasignaron por suposición.

Se conserva el modelo WebP de aproximadamente 31,3 MB. Esta revisión no cambia su geometría ni declara una nueva mejora de memoria o descarga.
