# 08 — OCR de los P&ID: resultados

> [!info] Revisión documental 2026-10-07
> Resultado preliminar de OCR. Los candidatos de 17–20 no son el inventario final documentado; ver [[10-Verificacion-bombas]].

Se procesaron los **21 PDF** de `Diagramas Flujo` (19 P&ID + 2 PFD) con
`pdftoppm` a 450 dpi + **Tesseract OCR**. Resultado consolidado con los DWG
en `equipos_consolidado.csv`.

## Salto de cobertura

| Fuente | Equipos | Bombas |
|---|---|---|
| Solo DWG | 45 | 6 |
| DWG + OCR de P&ID | **111** | **hasta 20** |

## Niveles de confianza

- **ALTA (40)** — el TAG aparece en un DWG *y* en un P&ID. Confirmado.
- **MEDIA (66)** — solo en el OCR, pero el número cae en el rango del
  proyecto (13xx fermentación / 14xx destilación). Muy probable, verificar.
- **BAJA (5)** — fuera de rango, casi seguro ruido de OCR:
  `A-1531`, `A-1543`, `P-1524`, `P-1542`, `R-1521`.

## BOMBAS

### Confirmadas (DWG + P&ID) — 6
`P-1401` · `P-1451` · `P-1461` · `P-1462` · `P-1463` · `P-1490`

### Detectadas solo por OCR — verificar contra el plano
**Área de fermentación (13xx):**
`P-1311` · `P-1312` · `P-1321` · `P-1324` · `P-1324B` · `P-1331` ·
`P-1341` · `P-1342` · `P-1343` · `P-1351` · `P-1391`

**Área de destilación (14xx):**
`P-1491`

### Lecturas dudosas
- `P-131` → truncado, probablemente `P-1311` o `P-1312`
- `P-1401H` → probablemente `P-1401 A/B` mal leído
- `P-1324B` → plausible (bomba B del par 1324 A/B)

## Total realista de bombas
Entre **17 y 20**, pendiente de verificación visual sobre los P&ID.

## Limitaciones del OCR
- El texto de los P&ID está convertido a curvas, así que el OCR lee la
  *imagen* del plano. Confunde dígitos parecidos y corta TAG girados.
- No captura el servicio ni el fluido asociado a cada bomba — solo el TAG.
- Las bombas suelen venir en par A/B; el OCR a veces lee solo una.

## Qué hacer con esto
1. Abrir cada P&ID y **verificar visualmente** los 14 TAG de confianza MEDIA.
2. Marcar cuáles son pares A/B.
3. Pasar la lista verificada a `bombas.csv` ([[03-Base-Activos-Bombas]]).
4. Ese es el universo de equipos del proyecto. De ahí en adelante, lo que
   falta es dato de campo: marca, modelo, sellos, empaques, o-rings.

Relacionado: [[06-Equipos-detectados]] · [[02-Plan-de-Trabajo]]
