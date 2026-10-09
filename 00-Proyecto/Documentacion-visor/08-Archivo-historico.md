---
actualizado: 2026-10-07
estado: documentacion
---

# Archivo histórico

Los archivos retirados se conservan en visor-bombas/archivo. No se borró código de referencia ni se movieron módulos activos.

| Archivo | Motivo |
|---|---|
| parches/update-demo.mjs | Parche ya aplicado; repetirlo puede fallar o duplicar cambios. |
| parches/fix-selection.mjs | Parche de selección ya aplicado. |
| auditorias/auditar_exportador.py | Depende de un adjunto antiguo y de rutas anteriores. Evidencia histórica, no prueba vigente. |
| respaldos/app.js.respaldo | Copia anterior a realismo y mejoras posteriores; no es la app actual. |

Las fuentes recibidas por adjunto se conservan en Fuentes/Adjuntos-historicos, cada una con origen y estado en el índice de código. No reemplazan el exportador actual.

El ZIP visor-bombas-codigo-2026-10-06.zip se conserva como entrega temprana en Archivo/Entregas. Está desactualizado: no usarlo como versión final del visor.

extract_tags.py permanece en su ruta original porque forma parte del trabajo técnico, pero conserva rutas de Linux y dependencias LibreDWG/ezdxf: no es ejecutable directamente en Windows sin adaptación. consultar_bombas.py es una alternativa CLI no usada por el servidor web; su proveedor/modelo requiere revisión antes de ejecutarlo.

