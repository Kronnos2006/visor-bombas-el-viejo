---
actualizado: 2026-10-07
estado: documentacion
---

# Estado y alcance

## Objetivo vigente

Propuesta local para presentar una aplicación de mantenimiento: planta vista desde arriba → selección y acercamiento a una bomba → despiece → consulta de componentes, ficha e historial. Si se aprueba, adaptar a la instalación real.

## Implementado

- Node.js sirve la web en http://127.0.0.1:8766, solo en esta PC.
- Three.js representa una distribución y una bomba genéricas, con 10 componentes seleccionables.
- Modo demo: P-9001 Agua y P-9002 Alcohol, totalmente ficticias. No acreditan aptitud de un equipo para alcohol.
- Modo real: 15 fichas de la bóveda de Obsidian; lectura directa del sistema de archivos, sin plugin REST/MCP de Obsidian instalado por este trabajo.
- Fichas YAML, o-rings, sellos, documentos vinculados, impresión desde el navegador e historial.
- Nuevos informes Markdown; separación física de datos reales y de prueba.
- Capa de realismo aportada por Claude: entorno, luces, sombras, materiales PBR y acabado de color.
- Selección corregida al cambiar de modo; coordenadas corregidas para evitar bombas dentro de tanques.
- Gemini integrado por REST, pero sin consulta real verificada: falta una clave API válida.

## No implementado o no validado

- CAD real por piezas, conversión de NWD, mediciones de fabricación o plano as-built.
- Sensores, diagnóstico predictivo, certificación de materiales o cálculo hidráulico.
- Usuarios, permisos por rol, stock transaccional, compras, mantenimiento preventivo programado o CMMS instalado.
- Carrito de repuestos, sincronización con CMMS y botón de exportación integrado al visor.
- Prueba visual completa del render: hubo bloqueo de la herramienta de navegador. La verificación geométrica es automatizada; no equivale a revisión visual.

Las notas de verificación previas documentan 15 TAG reales (9 fermentación, 6 destilación). No se volvió a auditar aquí cada plano. Las cifras antiguas de 20 bombas son resultados preliminares de OCR.

