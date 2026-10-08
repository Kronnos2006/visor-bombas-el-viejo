---
tipo: investigacion-tecnica
estado: verificado-con-fuentes-oficiales
revision: 2026-10-08
---

# Catálogos y CAD verificados

Esta nota separa los datos confirmados por el fabricante de las equivalencias que
todavía requieren placa, número de serie o confirmación del distribuidor. Una
coincidencia dimensional sirve para el visor y la propuesta, pero no autoriza la
compra de repuestos.

## Resultado ejecutivo

| Equipo o componente | Resultado | Uso permitido ahora |
|---|---|---|
| HIDROMAC 2196 | La placa confirma **HIDROMAC Colombia, modelo 2196**. Sus tamaños coinciden con la familia ANSI 2196 documentada por Summit. No está demostrado que sea una Summit. | Usar Summit 2196 como referencia geométrica provisional, indicando la fuente y la incertidumbre. |
| WEG `00218XT3E145T` | Identificación oficial confirmada. W21 a prueba de explosión, 2 HP, 4 polos, bastidor 143/5T y TEFC. | Buscar el código exacto en la biblioteca CAD oficial de WEG. |
| US Motors `XJ7P1BM` | Identificación oficial confirmada: 7.5 HP, 3600 rpm, 230/460 V, bastidor 213JM, TEFC y servicio peligroso. | Usar el plano dimensional oficial. Confirmar si Nidec ofrece 3D para este código. |
| Rexnord Omega `ES2-R` / `7300075` | Confirmado por Rexnord: elemento espaciador, 190 lb·in, 6600 rpm y diámetro mayor 89 mm. | Modelar con esas dimensiones; priorizar el valor oficial de 6600 rpm. |
| John Crane Tipo 21 | Familia y tabla dimensional confirmadas. Es un sello por componentes con fuelle elastomérico, **no un cartucho**. | Mostrarlo como “sello mecánico Tipo 21”. Materiales y código final quedan pendientes de la configuración real. |
| John Crane Tipo 1/1B | Familia y hoja técnica oficial confirmadas. | Usar dimensiones solo después de confirmar tipo y diámetro por bomba. |
| Goulds `15SH06K6` | La familia `15SH06` aparece en documentación oficial e-SH. El sufijo completo `K6` todavía no está decodificado. | Usar el corte e-SH como referencia; no asignar sello exacto por el sufijo sin confirmación. |
| Rodamientos 6204/6205/6206/6207/6308/6309 | Son familias normalizadas, pero `2RS`, `2RSH` y `2Z/C3` no significan lo mismo. | Conservar literalmente el código levantado y descargar CAD por marca y sufijo exactos. |

## 1. Bombas HIDROMAC 2196

Las fotografías son evidencia directa de fabricante y modelo:

- fabricante documentado: **HIDROMAC Colombia**;
- modelo documentado: **2196**;
- ejemplos de tamaño fotografiados: `1X1.5-8 STO I`;
- familia geométrica candidata: ANSI/ASME B73.1, estilo 2196.

El manual oficial de Summit incluye tamaños como `1 x 1.5 - 8`, `3 x 4 - 8G`
y bastidores STO/MTO/LTO. Esta coincidencia hace que el modelo Summit 2196 sea
una buena referencia para la demostración y para preparar el pedido técnico.
No demuestra que HIDROMAC y Summit sean el mismo fabricante ni que todas sus
piezas sean intercambiables.

Antes de fabricar o comprar se deben comparar: bastidor, diámetro de eje,
impulsor, cámara de sello, metalurgia, patrón de pernos y número de serie.

Fuentes oficiales:

- [Summit 2196 ANSI](https://summitpump.com/products/centrifugal/2196-ansi)
- [Manual Summit 2196 en español](https://summitpump.com/getmedia/de1601a2-c4a7-48ad-a2cd-465b35b0659c/2196-ANSI-Manual-Spanish.pdf)
- [Folleto Summit 2196](https://summitpump.com/getmedia/c341b688-63ac-4894-9301-49bbaaedf9e3/2196_Brochure.pdf)
- [Biblioteca documental Summit](https://summitpump.com/resources/document-library)

## 2. Motores

### WEG `00218XT3E145T`

La ficha oficial confirma W21 a prueba de explosión, 2 HP, 4 polos, bastidor
143/5T, 230/460 V, 60 Hz y carcasa TEFC con montaje por patas. La misma página
enlaza la biblioteca CAD 2D/3D de motores eléctricos.

- [Producto oficial WEG](https://www.weg.net/catalog/weg/US/es/Electric-Motors/AC-Motors---NEMA/Explosion-Proof-DIP/Class-I-%26-Class-II/Explosion-Proof/W21-Explosion-proof-Motor-NEMA-Premium-Efficiency-2-HP-4P-143-5T-3Ph-230-460-380-V-60-50-Hz-IC411---TEFC---Foot-mounted/p/14325085)

### US Motors / Nidec `XJ7P1BM`

El catálogo oficial confirma 7.5 HP, 3600 rpm, 230/460 V, bastidor 213JM,
145 lb y eficiencia nominal NEMA de 89.5 %. Es un motor de bomba acoplada para
ubicación peligrosa. Nidec ofrece búsqueda de planos dimensionales; no se ha
confirmado un archivo 3D específico para este código.

- [Catálogo oficial Nidec de motores para ubicación peligrosa](https://acim.nidec.com/-/media/USMotors/Documents/Catalogs/FL600/CCP-3ph-HAZ-JM.pdf)
- [Datos técnicos y búsqueda de planos Nidec](https://acim.nidec.com/en/motors/usmotors/Service-And-Support/Technical-Data)

## 3. Acople Rexnord Omega

El producto oficial vigente aparece como `10287346`, con referencia alterna
`7300075`. La velocidad máxima oficial es **6600 rpm**. Si un distribuidor
muestra 7500 rpm, prevalece la ficha del fabricante hasta aclararlo con Rexnord.

- [Rexnord Omega ES2-R oficial](https://www.rexnord.com/products/10287346)

## 4. Sellos mecánicos

El Tipo 21 no se debe presentar en el visor como “sello de cartucho”. La ficha
de cada bomba deberá distinguir entre tipo de sello, diámetro, caras,
elastómero y número de parte. El tamaño por sí solo no determina materiales.

- [John Crane Tipo 21](https://www.johncrane.com/en/products/mechanical-seals/pump-seals/elastomer-bellow-seals/type-21)
- [Hoja técnica oficial Tipo 21](https://www.johncrane.com/media/505hkafe/td-21-4pg-bw-oct2015_3rdfeb.pdf)
- [Hoja técnica oficial Tipo 1/1B](https://www.johncrane.com/media/kutiyh5s/td-1-1b-8pg-bw-oct2015.pdf)

## 5. Goulds `15SH06K6`

La documentación oficial confirma la familia `15SH06` dentro de e-SH y señala
sellos John Crane Tipo 21 intercambiables. El manual de repuestos lista distintas
combinaciones de caras y elastómeros; por eso no se debe asignar una combinación
solo por reconocer el modelo. Falta confirmar qué significa el sufijo `K6` y la
configuración instalada en cada bomba.

- [Folleto técnico oficial Goulds e-SH](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/technical-brochure/besh-r2-web.pdf)
- [Manual oficial de repuestos e-SH](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/parts/reshsmgr.pdf)

## 6. Rodamientos

Cada designación se guardará completa, sin convertir automáticamente códigos:

- `2RS` o `2RSH`: sellos de contacto, según marca y generación;
- `2Z`: dos blindajes metálicos;
- `C3`: juego interno mayor que normal.

Ejemplo oficial comprobado: SKF `6205-2RSH/C3`, carga dinámica 14.8 kN. Para el
CAD se debe buscar la designación exacta y mantener el fabricante del rodamiento
real, porque los sufijos no son universales entre marcas.

- [Catálogo SKF de rodamientos para motores eléctricos](https://cdn.skfmediahub.skf.com/api/public/0901d19680523351/pdf_preview_medium/0901d19680523351_pdf_preview_medium.pdf)

## Reglas para el visor y el futuro CMMS

1. La placa y la observación de campo tienen prioridad sobre una coincidencia web.
2. Toda geometría no entregada por el fabricante se marca `referencia_aproximada`.
3. No se asignan materiales de sello, o-rings ni números de parte por semejanza.
4. Los datos inventados para la propuesta conservan la etiqueta `DEMO`.
5. Un archivo CAD descargado se registra con fabricante, código, URL, fecha y
   relación con el activo.
6. La compra exige número de serie o validación escrita del fabricante/distribuidor.

## Próximo trabajo

1. Descargar el CAD WEG por el código exacto.
2. Solicitar a HIDROMAC el corte y CAD de cada familia 2196 usando
   [[22-Pedido-al-fabricante]].
3. Confirmar el sufijo completo de `15SH06K6` y el sello instalado.
4. Descargar los rodamientos por marca y sufijo exactos.
5. Sustituir gradualmente la geometría demo del visor, conservando cada modelo
   aproximado como respaldo.

Relacionado: [[21-Datos-del-modelo]], [[22-Pedido-al-fabricante]], [[23-Auditoria-importacion-Libro1]]
