# Entrega de la interfaz — catálogo de bombas El Viejo

**Fecha:** 26 de octubre de 2026. **Rama:** `correcciones-auditoria`. **Último commit:** `45b1241`. Cambios guardados localmente, sin publicar en GitHub ni Vercel.

**Cambios implementados**

- Tema ámbar/caña compartido por las vistas simple y completa. Se corrigió también el contraste de controles heredados en modo claro.
- Búsqueda por TAG, nombre, servicio, zona, marca, modelo, serie y tamaño, ignorando acentos, mayúsculas, espacios y guiones; contador X de Y; limpieza de filtros y selector de área contenido en el panel.
- Acciones Ubicar, Fotos, Manual y Mantenimiento en la cabecera del expediente. Ubicar conserva la ficha; Fotos despliega su sección; Mantenimiento enfoca el formulario. PDF, planos y mover/cambiar quedan como acciones secundarias.
- Apartados plegables con memoria de sesión. El resumen técnico queda dentro del panel desplazable para liberar la cabecera.
- Hoja móvil cerrada, plegada o abierta, sin desplazamiento automático al seleccionar. La hoja abierta conserva una vista del modelo arriba y el menú de campo abajo.
- Indicadores separados de campos completos y verificación registrada, además del destino de almacenamiento.
- Avance muestra documentación y verificación en columnas independientes, con filtros separados. La verificación no aumenta el porcentaje de documentación.
- Controles de cámara sin arrastre, objetivos de 44 px, foco visible y respeto del movimiento reducido.
- Descarga con porcentaje cuando se conoce el tamaño, descarga indeterminada cuando no; recuperación del modelo y alternativa de consulta sin WebGL.
- Documentación actualizada y prueba de navegador reproducible guardada en el repositorio.

**Archivos modificados respecto a `257c646`**

- Aplicación: `visor-bombas/public/app.js`, `index.html`, `interfaz.js`, `interfaz-core.js`, `style.css`, `tema-vocatus.css`, `tema-campo.css`, `tema-vocatus.js` y `blender-local.js`.
- Avance: `visor-bombas/public/avance.html`, `avance.js`, `avance-core.js`, `campo.css` y `visor-bombas/survey.mjs`.
- Servidor: `visor-bombas/server.mjs` informa Content-Length en archivos estáticos para calcular el porcentaje.
- Pruebas: `visor-bombas/test-interfaz.mjs`, `visor-bombas/tools/e2e-interfaz.mjs`, `e2e-interfaz-checks.mjs` y los scripts de ambos `package.json`.
- Documentación: ambos README, `00-Proyecto/Documentacion-visor/00-Inicio.md` y `15-Interfaz-y-validacion-2026-10-26.md`.

**Validación**

- Base inicial: 76 pruebas aprobadas. Resultado final: **80 aprobadas, 0 fallidas**. El registro está en `pruebas-finales.txt`.
- La prueba de navegador pasó usando un servidor DEMO independiente y perfiles temporales de Chrome. No creó intervenciones ni cambió fichas reales.
- Se comprobaron búsqueda con guiones, consistencia de tema, selección conservada al ubicar, apertura de fotos, persistencia del plegado, acceso a mantenimiento, simulador, movimiento efectivo de cámara, filtros de Avance, controles de 44 px y ausencia de desbordamiento horizontal a 360 px.
- Se bloqueó la descarga del modelo: el visor permitió seguir con fichas y recuperó el 3D al reintentar. El progreso alcanzó 100 %.
- Se desactivó WebGL: la selección y consulta de fichas siguieron disponibles.
- Durante una ejecución, Windows devolvió EPERM al renombrar una ficha temporal en una prueba de restauración existente. La repetición y la ejecución final aprobaron las 80 pruebas, sin modificar esa función.
- Revisión de diferencias: sin errores de espacios finales. Se inspeccionaron las capturas y se corrigieron apertura de Fotos, transparencia de la hoja móvil y contraste del modo claro.

**Commits nuevos**

1. `3500468` — Unificar tema y búsqueda del explorador.
2. `1bad108` — Integrar acciones, secciones y ficha móvil del expediente.
3. `e1b46fe` — Separar documentación y verificación en campo.
4. `04fa098` — Agregar controles accesibles, progreso y recuperación del visor.
5. `82af1ec` — Mantener el modelo visible al abrir la ficha del celular.
6. `657bb59` — Corregir contraste de controles y piezas en el tema claro.
7. `45b1241` — Documentar entrega y verificación de la interfaz.

**Capturas**

En `interfaz/` hay 20 imágenes: escritorio y celular del visor, expediente, historial, simulador, levantamiento, Avance, solicitud a bodega y mover/cambiar; además de vista completa, modo claro, recuperación del 3D y comprobación inicial de tema y búsqueda.

**Pendientes reales y límites**

- Confirmar en planta qué equipos corresponden a B2, B3, B4, B7, B8, B9 y B10. No se reasignaron ni se cambiaron sus datos técnicos.
- Validar en los teléfonos físicos de planta. Las capturas móviles usan emulación de navegador.
- Probar Gemini con una configuración válida fuera de archivos versionados. No se solicitó ni se configuró la clave y no se realizó ninguna consulta.
- El modelo de aproximadamente 31,3 MB y su geometría se conservaron. No se declara una nueva medición o mejora de memoria.
- Se conservaron sin incluir en commits los cambios previos de `AGENTS.md` y el `package-lock.json` no versionado.
