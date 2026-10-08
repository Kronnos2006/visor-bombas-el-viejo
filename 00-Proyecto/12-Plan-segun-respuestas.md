# 12 — Plan de acción según las respuestas

El plan no es uno solo: depende de lo que conteste Dimas en
[[11-Hoja-de-reunion-Dimas]]. Acá están las tres rutas posibles.
Después de la reunión, marcá cuál aplica y seguí solo esa.

---

## RUTA A — "Sí existen datasheets o catálogo de bodega"
### 6 semanas · la más probable si el proyecto Praj se entregó completo

| Semana | Qué hacer | Entregable |
|---|---|---|
| 1 | Conseguir y digitalizar los datasheets. Cruzar con las 15 bombas. | `bombas.csv` al 70% |
| 2 | Cerrar huecos en bodega: fotografiar cajas de repuestos en estante. | `bombas.csv` al 95% |
| 3 | Una sola visita de campo para verificar lo dudoso y fotografiar chapas. | `bombas.csv` completo |
| 4 | Plano 2D: bloque BOMBA con atributos, insertado en planta. | DWG etiquetado |
| 5 | Visor 3D sobre el NWD, enlazado por TAG. | Visor funcional |
| 6 | Manual, procedimiento de actualización, informe final. | Entrega |

**Riesgo de esta ruta:** que los datasheets estén en inglés y en unidades
métricas mezcladas. Verificar unidades antes de cargar al CSV.

---

## RUTA B — "No hay datasheets, pero sí acceso a campo y a bodega"
### 10 semanas · la ruta realista

| Semana | Qué hacer | Entregable |
|---|---|---|
| 1 | Reunión, inducción de seguridad, hablar con el mecánico de referencia. | Lista de qué sabe cada quién |
| 2 | Bodega completa: inventariar y fotografiar todo repuesto de sellado. | Inventario de bodega |
| 3–4 | Campo: 4 jornadas, 4–6 bombas por jornada. Chapa + zona de sello. | Fotos + medidas |
| 5 | Completar por catálogo del fabricante lo que no se pudo medir. | `bombas.csv` completo |
| 6–7 | Plano 2D con bloques de atributos. | DWG etiquetado |
| 8–9 | Visor 3D enlazado. | Visor funcional |
| 10 | Manual, procedimiento, informe final. | Entrega |

**Protocolo por bomba en campo:**
1. Foto de la chapa (marca, modelo, serie, caudal, potencia, rpm)
2. Foto del conjunto completo
3. Foto de la zona del sello / prensaestopas
4. Medir o anotar: diámetro de eje, tipo de sellado
5. Si es empaquetadura: sección del cordón y número de anillos
6. Nombrar las fotos `P-1311_chapa.jpg`, `P-1311_sello.jpg`

**Regla:** llenar el CSV el mismo día. Lo que no se escribe ese día, se pierde.

---

## RUTA C — "No hay acceso a campo o el tiempo no alcanza"
### Plan mínimo viable · 5 semanas

Se recorta el alcance, no la calidad.

| Semana | Qué hacer |
|---|---|
| 1 | Elegir con mantenimiento las **6 bombas críticas** (las que más paran la planta) |
| 2 | Levantar solo esas 6, a fondo |
| 3 | Plano 2D con las 15 bombas ubicadas (aunque solo 6 tengan ficha completa) |
| 4 | Visor 3D con las 6 fichas cargadas y las otras 9 marcadas "pendiente" |
| 5 | Entrega + documentar cómo completar las 9 restantes |

Esto sigue siendo un entregable válido: el sistema queda armado y la planta
lo completa después. Mejor eso que 15 fichas a medias.

---

## Decisión de recorte — vale para las tres rutas

Si en algún momento hay que soltar algo:

1. Primero se suelta el **visor 3D** (queda documentado como fase 2).
2. Después se suelta el **plano 2D con atributos**.
3. **Nunca** se suelta `bombas.csv`.

Un Excel con los sellos de 15 bombas le sirve a mantenimiento todos los días.
Un 3D sin datos no le sirve a nadie.

---

## Después de la reunión

Marcar acá:

- [ ] Ruta A
- [ ] Ruta B
- [ ] Ruta C

Fecha de la decisión: ____________

Relacionado: [[11-Hoja-de-reunion-Dimas]] · [[10-Verificacion-bombas]] · [[03-Base-Activos-Bombas]]
