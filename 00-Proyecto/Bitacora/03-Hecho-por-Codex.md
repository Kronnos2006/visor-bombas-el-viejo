---
tipo: bitacora
autor: Codex
---

# Hecho por Codex

Trabajó sobre el visor en paralelo, con énfasis en documentación y en no
prometer más de lo que el modelo muestra.

## Aportes

- Creó la carpeta `00-Proyecto/Documentacion-visor/` con las notas 00 a 12:
  manual de uso, arquitectura y datos, decisiones y cambios, pruebas y
  limitaciones, pendientes y migración, índice de código, archivo histórico,
  auditoría documental y entrega.
- `tools/documentar.mjs`: regenera el inventario y la copia documental de la
  revisión. **No** corre las pruebas.
- Endureció los textos de advertencia del visor: posiciones ilustrativas,
  geometría no verificada, los datos de la ficha no confirman la construcción
  del modelo.
- Separó el modo **demostración** del modo **datos reales**, con accesos
  distintos (`Iniciar demostración.cmd` / `Iniciar datos reales.cmd`) y una
  bóveda `demo-vault` aparte.

## Pregunta que dejó planteada

Preguntó por qué no se usó un CMMS open source ya existente. La respuesta
quedó en [[14-Migracion-a-CMMS]]: la planta todavía no tiene software de
mantenimiento, y los datos primero hay que levantarlos. Instalar un CMMS
vacío no resuelve el encargo; dejar los datos listos para migrar, sí.
