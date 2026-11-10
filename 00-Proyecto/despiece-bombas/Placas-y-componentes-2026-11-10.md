# Placas leídas, manuales y desglose de componentes (10/11/2026)

Archivos en esta carpeta:
- `Bombas-Vocatus-tabla-completa-2026-11-10.xlsx`: las 83 bombas en orden numérico. Datos del Excel, lo leído en la placa de bomba y motor, de dónde sale cada dato y el enlace al manual. Verde = placa (manda sobre el Excel); amarillo = copiado de una bomba igual; gris = sin placa, no instalada o no está en la planta.
- `Bombas-Vocatus-desglose-componentes-2026-11-10.xlsx`: hoja «Resumen» (modelo y número de componentes por TAG) y hoja «Por bomba» (cada componente de cada máquina, filtrado por variante: STO/MTO/LF en Hidromac 2196, ST/MT A40/A20 en Titan).

## Decisiones del usuario
- No se piden más medidas con cinta ni fotos de detalle; las toman los operadores si algún día hacen falta.
- Bombas iguales copian el modelo de la que tiene placa: B72 ← B71; B63, B66, B67, B68 ← B64/B65; B44 ← B45.
- B48, B57, B58, B61 y B62 están bien numeradas: vale lo que dice su placa aunque no coincida con el Excel.
- B73 sin placa: datos del Excel y catálogo KSB. B74, B75, B76 y B82: bomba sin identificar.
- B77–B80 no están instaladas. B10, B15, B16 y B22 no están en la planta.

## Placas nuevas (resumen)
- B17, B18, B20, B21: Titan 4196 ST AA (series 027166, 027164, 027165, 027167). El Excel decía Durco.
- B19: Durco 1K 1.5×1 LF-82, sello Cartex C/SiC.
- B48: Multisteel RA 65/300, 25 m³/h, 20 m, Ø220, soporte NU 308 / 3308.
- B52: Hidromac LL-124 3X3, SER 220106-1 (B51 es 220106-2).
- B57: Multisteel RSA 32/205, 16 m³/h, 88 m, Ø210, soporte NU 306 / 3306.
- B58: PACO LF 11-30121-1A6L01-285?, SER 00X0004202-B, 480 GPM, 105 ft, Ø11,76″.
- B59: SB 15-5(M), 22 m³/h a 75 m, 7,5 kW (el Excel dice 25 m).
- B61, B62: Titan 4196 3X4-13 MT, Ø13″, series 063258 y 063259.
- B69, B70: Ebara AEVMSU5-9F0500T3S, series C154827/1/1 y /1/2.
- B71: Grundfos CR15-6 K-GJ-A-E-HQQE-NX2, n.º de producto 97786834.
- B81, B83: Titan 4196 A20 1.5X3-13, series 064311 y 064310.
- B39–B43: motor Nidec 213JM. Rodamientos del Excel = motor también en B1, B46–B48, B53–B55.

En el visor, cada ficha muestra esto en la sección «Placa y manual» (`visor-bombas/public/modelos/placas-bombas.json`, rama `codex/cuentas-vercel`).
