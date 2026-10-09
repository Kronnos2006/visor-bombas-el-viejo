# 06 — Equipos detectados automáticamente en los DWG

> [!info] Revisión documental 2026-10-07
> Diagnóstico histórico de DWG. La lista posterior documenta 15 bombas; ver [[10-Verificacion-bombas]] y [[Documentacion-visor/01-Estado-y-alcance]].

Fuente: 56 DWG procesados con LibreDWG + ezdxf. Detalle por plano en
`tags_equipos_vocatus.csv`.

## Nomenclatura del proyecto D-18033
El prefijo del TAG identifica el tipo de equipo:

| Prefijo | Equipos | Significado probable |
|---|---|---|
| **P** | 6 | **Bombas (pumps)** |
| H | 25 | Intercambiadores de calor (heat exchangers) |
| C | 4 | Columnas / torres |
| T | 5 | Tanques |
| K | 2 | Compresores / soplantes |
| S | 1 | Separador |
| BLD, ELT, PGA | 3 | Edificio, eléctrico, varios |

> Confirmar la leyenda de prefijos con la simbología del P&ID antes de darla
> por buena.

## BOMBAS — el objetivo del proyecto

| TAG | Aparece en |
|---|---|
| **P-1401** | Plano indu, Planta Praj (Indu), D-18033-1-BLD1401_R0 |
| **P-1451** | Planta Praj (Indu), C-1451 |
| **P-1461** | Plano indu, Planta Praj (Indu), Ensamblaje Indu |
| **P-1462** | Planta Praj (Indu), Ensamblaje Indu |
| **P-1463** | Planta Praj (Indu), Ensamblaje Indu |
| **P-1490** | Plano indu, Planta Praj (Indu), C-1491 |

**6 bombas identificadas en los DWG.** Casi seguro hay más: los P&ID en PDF
(19 láminas) no se pudieron leer por texto, y ahí deberían estar todas.

## Resto de equipos
Columnas: C-1401, C-1451, C-1461, C-1491
Tanques: T-1401, T-1461, T-1463, T-1490
Compresores: K-1451, K-1495
Separador: S-1461
Intercambiadores: H-1401 a H-1405, H-1451 a H-1453, H-1461 a H-1468,
H-1491 a H-1496

## Siguiente paso
1. Conseguir el P&ID en **DWG** (no PDF) para extraer las bombas restantes.
2. Si solo existe en PDF: OCR sobre los 19 P&ID, o lectura manual.
3. Con la lista completa, llenar `bombas.csv` ([[03-Base-Activos-Bombas]]).
