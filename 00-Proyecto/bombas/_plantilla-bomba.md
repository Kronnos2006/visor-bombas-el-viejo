---
tipo: bomba
tag: P-XXXX
nombre: ""
area: ""                      # Fermentación | Destilación
servicio: ""                  # descripción oficial de la LEGEND del PFD
estado: operando              # operando | parada | fuera de servicio | respaldo
criticidad: media             # alta | media | baja

# --- placa del equipo ---
marca: ""
modelo: ""
serie: ""
anio: ""
tipo_bomba: ""                # centrífuga | desplazamiento positivo | dosificadora | peristáltica
fluido: ""
temperatura_c: ""
caudal_m3h: ""
altura_m: ""
presion_bar: ""
potencia_kw: ""
rpm: ""
diametro_eje_mm: ""
succion_dn: ""
descarga_dn: ""

# --- sellado: lo que el proyecto existe para responder ---
tipo_sellado: ""              # sello mecánico | empaquetadura
sello_marca: ""
sello_modelo: ""
sello_tipo: ""                # simple | doble | cartucho
sello_diametro_mm: ""
sello_cara_rotativa: ""       # carburo de silicio | carbón | cerámica
sello_cara_estatica: ""
sello_elastomero: ""          # EPDM | Viton | NBR | PTFE
sello_resorte: ""             # AISI 316 | Hastelloy
empaque_marca: ""
empaque_tipo: ""              # grafitada | PTFE | aramida
empaque_seccion_mm: ""
empaque_anillos: ""
empaque_linterna: ""          # sí | no | posición

# --- o-rings ---
orings: []
# - posicion: ""              # tapa, camisa, sello, brida de succión...
#   medida: ""                # ej. 45 x 3 mm  |  AS568 -225
#   material: ""              # Viton | EPDM | NBR | PTFE
#   dureza_shore: ""
#   cantidad: 1
#   codigo: ""

# --- repuestos ---
codigo_bodega: ""
proveedor: ""
plazo_entrega: ""
stock_minimo: ""

# --- trazabilidad ---
pid: []                       # láminas donde aparece
planos: []                    # rutas a DWG/PDF
fotos: []
verificado_por: ""
fecha_verificacion: ""
fuente_datos: ""              # placa | datasheet | catálogo | bodega | mecánico
confianza: baja               # alta | media | baja
---

# P-XXXX — <servicio>

## Qué hace
<Una o dos líneas en lenguaje de planta: qué mueve, de dónde a dónde, por qué importa.>

## Sellado — resumen rápido
> **Para pedir repuesto:** <lo esencial en una línea, ej. "Sello mecánico simple
> 35 mm, caras SiC/carbón, elastómero Viton. O-ring de tapa 45x3 Viton.">

## Historial de intervenciones

| Fecha | Tipo | Qué se hizo | Repuesto usado | Quién | Horas parada |
|---|---|---|---|---|---|
| | | | | | |

## Modos de falla observados
- <qué le pasa típicamente a esta bomba>

## Documentos
- Planos: <enlaces>
- P&ID: <láminas>
- Datasheet: <si existe>

## Observaciones
