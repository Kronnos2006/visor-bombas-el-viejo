# Proyecto Vocatus — Planta El Viejo (Filadelfia, Guanacaste)

> [!important] Estado vigente — 7 de octubre de 2026
> Abrir [[Documentacion-visor/00-Inicio|Documentación central del visor]]: manual, arquitectura, pruebas, pendientes y todo el código organizado. La prioridad actual es una demostración local de agua y alcohol; la adaptación a la planta queda para después de aprobación.

Modelo consultable de planta: plano 2D editable + modelo 3D con ficha de equipos
(bombas: sellos, empaques, o-rings), buscable por nombre y por área.

## Notas

### Diagnóstico
- [[01-Inventario-Tecnico]] — qué archivos hay y para qué sirve cada uno
- [[06-Equipos-detectados]] — los 45 equipos extraídos de los DWG
- [[08-OCR-PID-resultados]] — OCR de los 21 P&ID: 111 equipos
- [[10-Verificacion-bombas]] — **lista definitiva: 15 bombas confirmadas**

### Ejecución
- [[17-Plan-paso-a-paso]] — **el plan operativo**: fases, materiales, protocolos
- [[16-Prioridades]] — **leer primero**: qué va ahora y qué puede esperar
- [[11-Hoja-de-reunion-Dimas]] — **imprimir y llevar**: 16 preguntas con espacio para respuestas
- [[12-Plan-segun-respuestas]] — las 3 rutas posibles según lo que conteste
- [[09-Plan-de-Accion]] — cronograma general
- [[02-Plan-de-Trabajo]] — fases y entregables
- [[03-Base-Activos-Bombas]] — estructura de la base de datos de equipos
- [[04-Preguntas-para-la-planta]] — qué preguntar / levantar en campo

### Entregable
- [[14-Migracion-a-CMMS]] — el dato sale en formato de CMMS desde hoy
- [[13-Base-de-conocimiento-IA]] — **el corazón del proyecto**: ficha por bomba, consultable por IA
- [[bombas/_INDICE-bombas|Índice de bombas]] — estado del levantamiento

### Referencia
- [[15-Referencia-RapidCatalog]] — el producto comercial que hace esto; comparación función por función

### Técnico
- [[05-Herramientas-DWG]] — cómo leer DWG sin AutoCAD (LibreDWG + ezdxf)
- [[07-Script-extract-tags]] — el script de extracción, explicado y con código

## Datos
- `bombas.csv` — 15 bombas confirmadas, con servicio; falta dato de campo
- `equipos_consolidado.csv` — 111 equipos, DWG + OCR, con confianza
- `tags_equipos_vocatus.csv` — 151 apariciones de TAG, por plano, con X/Y
- `scripts/extract_tags.py` — el script ejecutable

## Ruta del material fuente
`Práctica I/Práctica I/Vocatus/`

## Código de proyecto
Los planos vienen de un proyecto de ingeniería con prefijo **D-18033**.

## Estado
- [x] Inventario del material
- [x] Herramienta para leer DWG sin AutoCAD
- [x] Extracción automática de TAG de equipos
- [x] OCR de los P&ID → lista de equipos completa
- [x] Verificar los TAG contra la LEGEND de los PFD → 15 bombas
- [ ] Reunión con Dimas: ¿bodega tiene códigos de sellos?
- [ ] Levantar sellos, empaques y o-rings por bomba
- [ ] Plano 2D con bloques de atributos
- [ ] Visor 3D web sobre el modelo Navisworks
- [x] Levantamiento fotográfico del área: 41 fotos, 10 placas leídas
- [x] Identificación de la norma: bombas ANSI/ASME B73.1
- [x] Visor funcionando con despiece B73.1 y datos de placa
- [ ] Asociar serie de placa ↔ TAG del P&ID (trabajo de campo)
- [ ] Conseguir el catálogo Hidromac 2196

## Presentación
- [[18-Guion-presentacion-lunes]] — guion de 10 minutos para Dimas / Vocatus

## Bitácora
- [[Bitacora/00-Indice-de-la-bitacora]] — quién hizo qué: Claude, ChatGPT, Codex y lo hecho después del corte

## Inventario de la lista de Dimas · revisado 2026-10-07

Fuente: `Fuentes/Libro1-bombas-Dimas-2026-10-07.xlsx`, hoja Bombas.
**77 equipos documentados** (B1–B77). B78 y B79 son filas reservadas del Excel,
sin datos y sin ficha.

- [[19-Inventario-Vocatus-Dimas]] — la transcripción ordenada por área
- [[equipos/_INDICE-equipos]] — una ficha por equipo, con tableros Dataview
- [[20-Control-cruzado-placas]] — las 10 placas fotografiadas contra el Excel
- [[21-Datos-del-modelo]] — la regla: documental / inferido / pendiente
- [[22-Pedido-al-fabricante]] — lo que falta, agrupado en 29 familias
- [[23-Auditoria-importacion-Libro1]] — qué se corrigió y el resultado de la validación

Los datos tabulados están en `bombas-vocatus.csv`, con el texto original de cada
celda del Excel en cuatro columnas aparte.

**Regla del inventario:** ningún dato inferido se presenta como confirmado, y una
celda vacía en el Excel queda vacía. Ver [[21-Datos-del-modelo]].
