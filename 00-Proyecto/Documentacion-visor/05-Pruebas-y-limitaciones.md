---
actualizado: 2026-10-07
estado: documentacion
---

# Pruebas y límites

## Comprobaciones registradas

- test.mjs: 5 pruebas de lectura YAML, contexto, rutas, 15 fichas y control de peticiones.
- test-demo.mjs: dos fichas demo, selección inexistente con código PUMP_NOT_AVAILABLE, documento e informe temporal de prueba.
- test-layout.mjs: separación de cada pedestal respecto a cada tanque, ausencia de superposición entre pedestales y límites de plataforma, en modo demo y real.
- node --check: sintaxis de módulos activos.
- El servidor respondió por localhost con P-9001 y P-9002 durante la puesta en marcha.

El resultado de la verificación de esta revisión se guarda en [[Evidencia/Verificacion-2026-10-07]]. Si esa evidencia no aparece o contiene fallos, no asumir que se ejecutó con éxito.

## Qué no prueban

No prueban render visual, usabilidad en todos los dispositivos, compatibilidad química, exactitud geométrica, cumplimiento normativo ni diagnósticos de IA. No se ha completado una consulta real a Gemini por falta de clave.

La prueba de informes crea una nota temporal en demo y la elimina por su ruta exacta al terminar; no usa fichas reales. La prueba de rutas utiliza un caso absoluto Windows y no es portable tal cual a Linux.

Las pruebas de exportación usan carpetas de salida aisladas: no reemplazan los CSV existentes. La auditoría antigua en archivo/auditorias prueba un adjunto antiguo, no el script vigente.

