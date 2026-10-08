---
tipo: bitacora
autor: ChatGPT
estado: sin contexto desde 2026-10-07
---

# Hecho por ChatGPT

## 1 · Auditoría de `exportar_cmms.py`

Es su aporte más valioso. Encontró **cinco fallas reales** en el exportador
que Claude había escrito. Las cinco se confirmaron y se corrigieron.

| # | Falla | Por qué importaba |
|---|---|---|
| 1 | `hash()` de Python para los códigos de repuesto | Python aleatoriza el hash de cadenas en cada proceso: el código del repuesto cambiaba en cada corrida |
| 2 | El `codigo_bodega` de la bomba se reusaba como código de pieza | Mezclaba el código del equipo con el del repuesto |
| 3 | Identidad de deduplicación incompleta | Dos o-rings 45×3 mm, uno Vitón y otro EPDM, recibían el mismo código |
| 4 | Cantidades inventadas por defecto | Un número sin respaldo documental |
| 5 | Renglones de BOM huérfanos | Apuntaban a piezas que no estaban en el catálogo |

Y **dos afirmaciones corregidas**:

- Claude mapeaba `dosificadora → RE` en ISO 14224 por su cuenta. Ahora el
  tipo solo se exporta si está declarado explícitamente en `tipo_bomba`.
- Claude había escrito que los CSV son un *"formato universal"* de CMMS. No
  lo son. Es un formato de intercambio razonable, nada más.

**Cómo se corrigieron:** md5 o número de parte del fabricante para el código;
columna propia para el código de bodega del equipo; identidad ampliada con
fabricante, elastómero y dureza; sin cantidades por defecto; mapa
`por_identidad` más un chequeo que aborta el export si hay huérfanos.

Verificado: salida idéntica con `PYTHONHASHSEED=1`, `random` y `99`.

## 2 · Orientación de las fotos (quedó a medias)

Estaba corrigiendo la rotación de las fotos de placas cuando se quedó sin
contexto. Ahí se cortó.

## Dónde se quedó

- Las 41 fotos ya estaban ordenadas en la bóveda.
- 5 fotos se veían giradas 90°.
- No alcanzó a determinar la causa.

Esto es exactamente el punto que retoma [[04-Desde-que-murio-ChatGPT]].
