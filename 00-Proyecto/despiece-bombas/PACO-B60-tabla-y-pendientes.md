# PACO B60 · Identificación, pendientes y registro

Revisión 2026-11-09. Modelo 7 de 7. TAG: **B60** · Tanque Verde (en desuso), CIP Destilería. En Libro1.xlsx aparece como **B58** (cruce conservado). Excel: PACO Pumps · 480 GPM · HD 105 (sin unidad) · Ø11,76″ (298,7 mm) · motor WEG TE1BFOXO de 7,5 HP a 1.160 rpm · rodamientos 6308-ZZ / 6207-ZZ.

## Estado: **pendiente de campo**

Sin el CAT # ni el SER # de la voluta no se puede atribuir una familia (VL, VLS, LC, LF) ni un despiece o CAD. No se dibujó nada para no presentar una geometría sin respaldo.

## Hallazgo de esta revisión: los datos del Excel no son coherentes entre sí

Cálculo estimado, no es dato de placa:
- A 1.160 rpm, un impulsor de Ø298,7 mm tiene una velocidad periférica de unos 18,1 m/s. Eso da una altura del orden de 15–17 m (50–55 ft). Llegar a **105 ft (32 m)** con ese diámetro exige unas 1.750 rpm.
- 480 GPM a 105 ft necesitan unos 17 HP en el eje (con 75 % de eficiencia). El motor registrado es de **7,5 HP**.
- 480 GPM a unos 45 ft con 1.160 rpm encajan con 7,5 HP (unos 7,3 HP en el eje).
- Conclusión probable: el «105» corresponde a otra velocidad o a otro punto (por ejemplo, el cierre de la curva), o la velocidad o la potencia están mal registradas. No usar 105 para seleccionar una curva.
- Rodamientos 6308-ZZ / 6207-ZZ: es el par típico de un motor de 7,5 HP de 6 polos (carcasa 213T/254T). Probablemente son del motor, como en las otras bombas.

## Tabla de piezas (provisional; solo identificación)

| Pos. | Pieza | Código de repuesto | Variante y TAG | Medidas y unidades | Material | Estado | Fuente y página | Archivo CAD |
|---|---|---|---|---|---|---|---|---|
| — | Bomba completa | pendiente: CAT # y SER # | B60 | Ø impulsor 298,7 (Excel) | — | pendiente | Excel | ninguno |
| — | Impulsor | pendiente por serie | B60 | Ø298,7 | — | Excel; coherencia dudosa | Excel | — |
| 18A / 18B | Rodamientos (si es LF con soporte) | pendiente por serie | B60 | — | — | pendiente | Manual Grundfos PACO LFE 8.8 | — |
| 6A / 14A / 20Y | Eje / sello / soporte (si es LF) | pendiente por serie | B60 | — | — | pendiente | ídem | — |
| — | Rodamientos 6308-ZZ / 6207-ZZ | ídem | motor WEG (probable) | 40×90×23 / 35×72×17 | — | Excel | SKF | — |

## Cotas y datos pendientes de campo

| Dato | Cómo tomarlo | Foto que lo verifica |
|---|---|---|
| CAT # y SER # de la voluta | Transcribir los campos por separado (la placa puede omitir guiones; el prefijo 16 = VL, 17 = VLS) | Foto nítida de la placa de la voluta |
| Familia | Ver si la succión es axial o en línea, y si el motor va acoplado directo o hay soporte con acople | Foto lateral completa de bomba y motor |
| Velocidad y potencia | Leer la placa del motor (rpm, HP, carcasa, rodamientos) | Foto de la placa del motor |
| Punto de servicio | GPM, TDH y Ø en la placa de la bomba | Ídem placa de la voluta |
| Bocas | Tamaño de succión y descarga, tipo de brida | Foto frontal con cinta |
| Ubicación | Que la foto muestre la bomba en el Tanque Verde (CIP) | Foto de conjunto |

## Registro de sesión

- **2026-11-09** · PACO B60. Queda **pendiente de campo**: falta la placa. Se agregó la verificación de coherencia (el punto 480 GPM a 105 ft no cuadra con 7,5 HP y 1.160 rpm) y la lista de fotos necesarias. Sin CAD. **Bloque de 7 modelos recorrido completo.** Siguiente: reunir las fotos y medidas de las listas de campo de cada modelo y cerrar las atribuciones dudosas (B17, B18, B20, B21, B29, B41, B51–B52).
