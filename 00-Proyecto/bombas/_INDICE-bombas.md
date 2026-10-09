# Índice de bombas

15 bombas confirmadas contra la LEGEND de los PFD. Una nota por bomba.
Ver [[10-Verificacion-bombas]] para la verificación.

## Estado del levantamiento

```dataview
TABLE WITHOUT ID
  link(file.link, tag) AS TAG,
  area AS Área,
  servicio AS Servicio,
  choice(tipo_sellado = "", "⬜ sin levantar", "✅ " + tipo_sellado) AS Sellado,
  confianza AS Confianza
FROM "00-Proyecto/bombas"
WHERE tipo = "bomba" AND tag != "P-XXXX"
SORT tag ASC
```

## Pendientes de levantar

```dataview
LIST
FROM "00-Proyecto/bombas"
WHERE tipo = "bomba" AND tipo_sellado = "" AND tag != "P-XXXX"
SORT criticidad ASC, tag ASC
```

## Las 15

### Fermentación
P-1311 · P-1312 · P-1321 · P-1324 · P-1331 · P-1341 · P-1342 · P-1343 · P-1351

### Destilación
[[P-1401]] · P-1451 · P-1461 · P-1462 · P-1463 · P-1490

> Las notas se crean con `scripts/crear_notas_bombas.py`, que usa
> `_plantilla-bomba.md` y `bombas.csv` como fuente.
