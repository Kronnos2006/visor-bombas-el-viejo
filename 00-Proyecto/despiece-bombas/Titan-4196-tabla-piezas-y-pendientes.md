# Titan 4196 · Tabla de piezas, cotas pendientes y registro

Revisión 2026-11-09. Modelo 3 de 7. Unidades en mm. Estados: catálogo, medida en campo, estimada por foto, pendiente.

Variantes:
- **ST · AA 1 × 1½–8:** B13 (Alambique UQ). Inventario: Ø7,1875″ (182,6 mm) de Ø8″ máximo, 13,7 m, motor WEG de 2 HP a 1.750 rpm, sello 1⅜″.
- **MT · A40 3 × 4–13:** B63–B68 (torres de enfriamiento). Ø13″ (330,2 mm) probable; B65–B68 registran «13 mm». Sello 1¾″. B66–B68 tienen motor de 40 HP a 1.770 rpm.
- **A20 1½ × 3–13, serie 064311:** placa en una foto de calderas, sin TAG asignado (ver B29 y calderas en el expediente).
- **B17, B18, B20, B21:** tienen placa Titan, pero el Excel dice Durco. Se tratan en el modelo 4.

## Hallazgos de esta revisión

- **Montaje por norma.** Titan declara que sus 4196 cumplen ASME B73.1M. Esa norma exige que las bombas de la misma designación sean intercambiables en cotas de montaje, bocas, eje de entrada, bancada y pernos de anclaje. Por eso el patrón de pies y el extremo de eje de la Hidromac 2196 aplican por designación: AA para B13, A40 para B63–B68 y A20 para la serie 064311. Quedó en un DXF propio.
- **La norma no fija las piezas internas** (rodamientos, camisa, sello). Para esas piezas hace falta el manual Titan. El PDF público es un escaneo sin texto y no se pudo leer de forma automática. Pendiente: las páginas 41–43 y 51–52 del `Titan-4196-manual.pdf` local.
- **Rodamientos del inventario:** B63–B68 registran 6212 Z C3 en los dos lados y B13 registra 6205-2RS / 6204-2RS. Es el patrón típico de los motores de esas potencias, no de un soporte ANSI. Probablemente son del motor, igual que en la AZ. Cotejar con la placa del motor.

## Tabla de piezas

| Pos. | Pieza | Código de repuesto | Variante y TAG | Medidas y unidades | Material | Estado | Fuente y página | Archivo CAD |
|---|---|---|---|---|---|---|---|---|
| — | Cotas de montaje | No aplica | ST B13 | X/A/B/D/SP 165/343/102/133/95; succión 1½″, descarga 1″; 45 kg | — | catálogo | Titan-4196-catalogo.pdf p. 6 | B13-Titan-4196-ST-esquema.dxf; …-envolvente-3D.dxf |
| — | Cotas de montaje | No aplica | MT A40 B63–B68 | X/A/B/D/SP 318/495/102/254/95; succión 4″, descarga 3″; 150 kg | — | catálogo | ídem | Titan-4196-3x4-13-A40-MT-esquema.dxf; …-envolvente-3D.dxf |
| — | Cotas de montaje | No aplica | A20 serie 064311 | X/A/B/D/SP 267/495/102/254/95; 111 kg | — | catálogo | ídem | Titan-4196-A20-064311-referencia.dxf |
| — | Patrón de pies | No aplica | ST | E1 76,2 · E2 0 · F 184,15 · agujero Ø15,875 | — | catálogo por designación B73.1; posición axial pendiente | ASME B73.1; tablas Hidromac y Summit | Titan-4196-patas-y-extremo-eje-B73.dxf |
| — | Patrón de pies | No aplica | MT/LT (A40, A20) | E1 123,825 · E2 92,075 · F 317,5 · agujero Ø15,875 | — | ídem | ídem | ídem |
| 122 | Eje, extremo de acople | pendiente por serie | ST / MT / LT | U 22,225 / 28,575 / 47,625; chavetero 4,763×2,381 / 6,35×3,175 / 12,7×6,35 | pendiente (manual) | catálogo por B73.1; resto del eje pendiente | ídem | ídem |
| 100 | Carcasa | pendiente por serie | todas | ver cotas de montaje; bridas A40 clase 150 candidatas (NPS 4: 8 × Ø¾″ sobre Ø7½″; NPS 3: 4 × Ø¾″ sobre Ø6″) | pendiente (manual p. 51–52) | catálogo (bridas candidatas) | Manual p. 43; Texas Flange | Titan-4196-A40-bridas-clase150/300-candidatas.dxf |
| 101 | Impulsor | pendiente por serie | ST Ø182,6; MT Ø330,2 probable | Ø recorte (inventario) | pendiente | inventario; MT por confirmar | Expediente | — |
| 108 | Adaptador | pendiente por serie | ST / MT | pendiente | pendiente | pendiente | Manual p. 43 | envolventes |
| 126 | Camisa | pendiente por serie | ST 1⅜″, MT 1¾″ (sello) | Ø en el sello: 34,925 / 44,45 (por tamaño de sello del inventario) | pendiente | inventario; por cotejar | Inventario; Manual | — |
| 134 | Alojamiento exterior | pendiente por serie | ST / MT | pendiente | pendiente | pendiente | Manual p. 43 | — |
| 168A / 112 | Rodamientos interior / exterior | pendiente (manual) | ST / MT | pendiente; el inventario lista rodamientos de motor | acero | pendiente | Manual p. 43 | — |
| 184 | Tapa de cámara | pendiente por serie | ST / MT | pendiente | pendiente | pendiente | Manual p. 43 | — |
| 365 / 383 | Sello fijo / giratorio | Tipo 1 / Tipo 21 (inventario) | ST 1⅜″; MT 1¾″ | cotas John Crane: ver tabla de la 2196 (mismos tamaños) | pendiente | candidato | Inventario; John Crane | Hidromac-2196-eje-camisa-sello-referencia.dxf (mismos tamaños) |
| 228 / 241 | Soporte y pie | pendiente por serie | ST / MT | patrón de pies: ver arriba | pendiente | patrón: catálogo | Manual p. 43 | ídem |
| 332A / 333A | Laberintos exterior / interior | pendiente por serie | ST / MT | pendiente | pendiente | pendiente | Manual p. 43 | — |

## Cotas pendientes de campo

| Pieza | Medida exacta | Desde qué cara o eje | Foto o plano que la verifica | TAG |
|---|---|---|---|---|
| Placa de la bomba | Tamaño, soporte (ST/MT/LT), serie y Ø instalado | — | Foto de la placa de la carcasa | B13, B63–B68 |
| Impulsor | Ø real (¿13″ o «13 mm» mal registrado?) | Eje del impulsor | Placa o medición en mantenimiento | B65–B68 |
| Extremo de eje | Ø U y chavetero | Calibre | Foto con calibre | B13, una de B63–B68 |
| Patrón de pies | Distancia axial de la línea de pies de carcasa a la cara de succión | Cara de succión | Foto en planta con cinta | B13, B63 |
| Bridas | Clase (marcado), Ø exterior, círculo de pernos, agujeros | Cara de brida | Foto frontal con cinta | B63–B68 |
| Motor | Rodamientos de la placa (¿6212 Z C3 / 6205-6204?) | — | Foto de la placa del motor | B13, B63–B68 |
| Serie 064311 | TAG del lugar (B29 o caldera) | — | Foto que muestre la placa y el lugar juntos | — |

## Registro de sesión

- **2026-11-09** · Titan 4196 (ST B13, MT B63–B68, A20 serie 064311). Resuelto: patrón de pies y extremo de eje por designación B73.1 (DXF nuevo `Titan-4196-patas-y-extremo-eje-B73.dxf`, mm, auditoría sin errores). Los rodamientos del inventario se marcan como probables de motor. Bloqueo: el manual Titan público es un escaneo sin texto; se necesitan las páginas 41–43 y 51–52 del PDF local para rodamientos, materiales y piezas internas. Siguiente: **Durco Mark 3 62391/62392 (B17–B21)**.
- **2026-11-09 (placas del visor)** · B64: A40, serie 064183, 275 psi; B65: A40, serie 064182. B66 ilegible. B63: Titan con máximo 13; motor Siemens. **B20 y B21 son Titan** (ver tabla Durco).
