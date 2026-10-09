---
actualizado: 2026-10-07
estado: documentacion
---

# Decisiones y cambios

## Antecedentes documentados

Inventario de PDF/DWG/NWD; extracción de TAG y OCR; lista preliminar de hasta 20 bombas; revisión posterior que documentó 15. Se crearon fichas YAML, generador de notas, consulta por IA y exportador CMMS.

## 6 de octubre de 2026

- Se revisó la bóveda real y se recuperó el contexto del trabajo con Claude.
- El usuario pidió planta desde arriba, acercamiento, despiece, panel de mantenimiento e IA; eligió ejecución local y Gemini.
- Se construyó el visor Three.js y servidor Node.js, manteniendo las fichas en Obsidian.
- Se generó un ZIP temprano de código: no incluye las mejoras posteriores.
- Claude añadió realismo.js y respaldo del app.js anterior.
- Se creó demostración aislada de agua y alcohol, con dos fichas ficticias y datos suficientes para mostrar el flujo.
- Se corrigió el fallo ENOENT por selección de una bomba real en demo.
- Se diferenciaron los lanzadores y se reescribió el README.
- Se comprobó que una versión adjunta del exportador fallaba al excluir todos los activos demo.

## 7 de octubre de 2026

- Se volvió a iniciar la demostración.
- Se corrigieron bombas superpuestas a tanques: plant-layout.js define posiciones separadas, pedestales y distribución. La demo muestra un tanque por circuito y tuberías ilustrativas.
- Se añadió prueba geométrica para ambos modos.
- Revisión documental: el exportador local ya usa COLS_ACTIVOS y maneja cero activos; el error anterior corresponde a una versión archivada.
- Se reunieron manual, arquitectura, decisiones, pruebas, riesgos y código legible en Obsidian; se archivaron parches aplicados y respaldos.

## Decisiones vigentes

Demo primero, adaptación a planta después de aprobación. No instalar un CMMS todavía. No sustituir datos faltantes por suposiciones. Conservar Three.js por ahora; xeokit, Atlas, openMAINT y Odoo son referencias evaluadas, no integraciones realizadas.

