# Cotejo de placas con las fotos del visor (2026-11-09)

Fotos leídas desde el visor en producción (Supabase `vocatus_photos`, solo lectura). El TAG se toma de `asignacion-bombas.json`: las fotos van por **lugar**, y el TAG es el asignado a ese lugar. Falta la confirmación física.

| TAG (lugar) | Placa de la bomba leída | Placa del motor leída | Qué resuelve |
|---|---|---|---|
| **B29** (frente de tanques · Bomba 1) | Hidromac 2196 · **1.5X3-13MTO** · **A20** · SER **220353-2** · 316SS · 200 GPM · 21,3 m · 1.750 rpm · Ø290 de 330 mm · 291 psi | — | **Soporte MTO confirmado** (la letra antes de «TO» se lee M). Eje en acople Ø28,575; rodamientos de catálogo 6309 + 3309 A/C3; patrón de pies MTO. El folleto que daba LTO para A20 no aplica a esta unidad. |
| **B45** (Fermentación · Bomba 2) | Hidromac **AZ 3X4X12A SMCDV** · N° **220100-2** · 550 GPM · 48 m · 1.750 rpm · 40 HP · Ø305 · «R. INOX» | WEG W22 **324/6T** · 40 HP · 1.770 rpm · rodamientos **6312-C3 / 6212-C3** | Confirma que 6312/6212 son del **motor**. El sufijo SMCDV está en la placa; «R. INOX» indica probablemente rodete de inoxidable. |
| **B44** (Fermentación · Bomba 1) | Hidromac AZ 3X4X… · N° **220100-1** · 550 GPM · 1.750 rpm · Ø305 | WEG (igual a B45) | Misma configuración que B45. |
| **B51** (Semilleros · escalera 1) | **Hidromac Colombia · MOD LL-124 3X3 · SER 220106-2 · MAT'L ASTM A48** | SEW-Eurodrive DRN132S4/FG, 1.768/1.760 rpm | **Marca Hidromac confirmada.** Es una LL-124 fabricada por Hidromac (diseño Viking) en hierro A48. Los datos de la serie Viking 124 quedan como referencia. |
| **B52** (Semilleros · escalera 2) | Placa Hidromac borrosa, serie ilegible | SEW (placa poco legible) | El Excel repite 220106-2: hace falta otra foto nítida. |
| **B20** | Titan · MOD 4196 · LUBE OIL · **1X1.5-6 ST** · serial **022165** (lectura probable) | — | B20 es **Titan** (el Excel dice Durco 62392). Sus repuestos internos son Titan. |
| **B21** | Titan 4196 · **1X1.5-8 ST** · **AA** · serial **027167** (lectura probable) · 316SS · Ø **7.1875″** (182,6 mm) | — | B21 es **Titan** (el Excel dice Durco 62391). |
| **B64** | Titan 4196 · **A40** · SER **064183** · 275 psi @ 100 °F | — | Confirma la Titan A40 MT. |
| **B65** | Titan 4196 · **A40** · SER **064182** | — | Ídem. |
| **B66** | Placa Titan ilegible | WEG (ilegible a esta escala) | Pendiente de una foto nítida. |
| **B63** | Titan 4196, máximo «13» (lectura parcial) | Siemens (China), 30 kW (lectura parcial) | Titan confirmada; el diámetro instalado sigue ilegible. |
| **Lugar tag:B41 → TAG B24** | Hidromac 2196 · **1X1.5-8 LF** · SER **210771-3** · OIL | WEG W22 2 HP · rodamientos **6205-2RS / 6204-2RS** | **B41 ya no tiene la discrepancia:** la placa Hidromac «B41» es del lugar asignado a **B24**. La serie 210771-3 queda ligada a B24, que el Excel daba como AA-STO estándar y la placa dice LF. Los 6205/6204 del Excel son del **motor**. |
| **B39, B41** | Sin placa de bomba en las fotos; adaptador inoxidable de motor directo (B39) | Nidec/US Motors 7,5 HP · 3.510 rpm · rodamientos **6309-2Z-J/C3 / 6206-2Z-J/C3** | Confirma la e-SH **acoplada directo al motor** y que 6309/6206 son del motor. Falta medir la brida de descarga (15SH06 o 02SH06). |

## Cambios que esto produce en las tablas

- **Hidromac 2196:** B29 = A20 **MTO** (cerrado por placa). B24 = LF, serie 210771-3 (corrige AA-STO estándar).
- **Hidromac AZ:** placa con SMCDV y Ø305; rodamientos del motor confirmados. El soporte IIIA/IVA sigue pendiente (código del rodamiento del soporte).
- **Titan:** B64 y B65 son A40 con series 064183 y 064182 (la A20 064311 es de la misma serie de fabricación).
- **Durco/Titan B17–B21:** **B20 y B21 son Titan**; B19 sigue Durco por placa. B17 y B18 tienen placa Titan en fotos anteriores.
- **Goulds:** B41 queda como Goulds (la placa Hidromac era de otro lugar).
- **LL-124:** B51 = **Hidromac LL-124**, hierro A48.
- **Regla general confirmada con placas:** los rodamientos del Excel son los del **motor** en B24, B39–B43 y B44–B45.

## Fotos que siguen haciendo falta

B52 (placa nítida), B66 (placa nítida), B63 (diámetro instalado), B60 (placa de la voluta), B17–B18 (placa nueva junto al lugar), B39–B43 (brida de descarga con cinta) y B44–B45 (placa del soporte o código del rodamiento).
