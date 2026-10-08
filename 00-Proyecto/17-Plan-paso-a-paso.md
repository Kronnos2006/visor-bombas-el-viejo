# 17 — Plan paso a paso

Qué hacer, en qué orden, con qué, y qué sale de cada paso.
Actualizado 2026-10-07.

---

# FASE 0 · Preparación — 2 horas, hoy

## Qué necesitás conseguir

| Cosa | Para qué | Dónde |
|---|---|---|
| Hoja de campo impresa, 15 copias | Anotar parado frente a la bomba | Generar desde `bombas.csv` |
| Lista de las 15 bombas impresa | Emparejar con los seriales | [[10-Verificacion-bombas]] |
| Lista de los 10 seriales ya leídos | No volver a fotografiar lo mismo | [[Documentacion-visor/14-Indice-de-fotos-y-placas]] |
| Tabla rígida o clipboard | Escribir de pie | — |
| Lápiz, no lapicero | En planta hay grasa y humedad | — |
| Celular con batería llena | Fotos de placa | — |
| Cinta métrica y pie de rey | Diámetro de eje si hay que medir | Pedir en taller |
| Linterna | Las placas están en zonas oscuras | — |
| EPP: casco, lentes, zapatos, chaleco | Entrar a planta | Pedir a seguridad |
| Marcador de tiza o cinta de papel | Marcar la bomba ya levantada | — |

## Qué hacer

**0.1** Imprimir todo lo de arriba.
**0.2** Confirmar inducción de seguridad y día de acceso con Dimas.
**0.3** Enviar el mensaje pidiendo el archivo de datos — ya está redactado.
**0.4** Preguntar quién es el mecánico que más conoce estas bombas.

> **Salida de la fase:** carpeta de campo lista y permiso de acceso.

---

# FASE 1 · Emparejar serie ↔ TAG — media jornada

**Es el paso que desbloquea todo lo demás. Nada avanza sin esto.**

## Qué necesitás
Lista de 15 TAG · lista de 10 seriales · celular · tiza · acompañante de planta.

## Cómo se hace

**1.1** Recorrer el sector siguiendo la tubería, no el orden de las bombas.
Cada bomba se identifica por **de dónde succiona y hacia dónde descarga**.

**1.2** Por cada bomba encontrada, anotar en la hoja:
- Número de serie de la placa
- Qué equipo tiene al lado (tanque, columna, intercambiador) y su TAG si se ve
- De dónde viene la succión y a dónde va la descarga
- Foto de la placa si no está en las 10 ya leídas

**1.3** Volver a la oficina y cruzar contra el P&ID:
el servicio de cada TAG dice qué mueve esa bomba. Si la bomba de la foto
succiona del fondo de la columna mash, es la **P-1401**.

**1.4** Marcar con tiza o cinta la bomba ya levantada.

## Reglas
- Si no estás seguro del emparejamiento, **dejalo en blanco**. Un TAG mal
  asignado es peor que un TAG vacío: contamina todo lo que venga después.
- Anotar también las bombas que **no** están en la lista de 15. Pueden ser
  equipos agregados después del proyecto D-18033.
- Buscar la **210771-4**, que falta en la serie.

> **Salida de la fase:** tabla serie ↔ TAG. Cargar en las fichas de Obsidian
> el mismo día.

---

# FASE 2 · Levantamiento de placa — 2 jornadas

## Qué necesitás
Lo mismo de la Fase 1, más pie de rey y linterna.

## Protocolo por bomba — siempre el mismo orden

1. **Foto de la placa de la bomba** · marca, modelo, serie, SIZE, impulsor, material
2. **Foto de la placa del motor** · HP, rpm, voltaje, carcasa, **y los códigos de rodamiento**
3. **Foto del conjunto completo**, de lado
4. **Foto de la zona del sello / prensaestopas**
5. Anotar: ¿sello mecánico o empaquetadura? ¿Se ve el cartucho?
6. Si hay acceso: medir diámetro de eje con pie de rey
7. Nombrar las fotos `P-1401_placa.jpg`, `P-1401_motor.jpg`, `P-1401_sello.jpg`

## Ritmo realista
4 a 6 bombas por jornada. 15 bombas = 3 jornadas. Agendarlas, no improvisarlas.

## Regla
**Llenar la ficha el mismo día.** Lo que no se escribe el mismo día se pierde.

> **Salida:** `marca`, `modelo`, `serie`, `tipo_bomba`, `potencia_kw`, `rpm`
> llenos en las 15 fichas. Y los códigos de rodamiento de cada motor, que son
> repuestos comprables de inmediato.

---

# FASE 3 · Bodega — 1 jornada

**Hacer esto ANTES de medir sellos en campo.** Es más barato y más exacto.

## Qué necesitás
Celular · acceso a bodega · el bodeguero.

## Cómo se hace

**3.1** Pedir el catálogo o kardex de repuestos. Buscar: sello mecánico,
empaquetadura, o-ring, retén.

**3.2** Revisar el estante físico. **La caja del repuesto trae marca, modelo
y medida impresos.** Fotografiar cada caja.

**3.3** Preguntar al bodeguero: *"¿para cuál bomba es este sello?"*. Suele
saberlo de memoria, y eso no está escrito en ningún lado.

**3.4** Anotar también el código interno de bodega de cada repuesto.

> **Salida:** `tipo_sellado`, `sello_marca`, `sello_modelo`,
> `empaque_*`, `orings[]`, `codigo_bodega` para las bombas que tengan
> repuesto en stock.

---

# FASE 4 · Completar por catálogo — 3 días

## Qué necesitás
El catálogo Hidromac 2196 · internet · los datos de las Fases 2 y 3.

## Cómo se hace

**4.1** Con el catálogo, confirmar el **grupo de power end** de cada tamaño
(`1X1.5-8`, `3X4-8G`). El grupo define el diámetro de eje en la cámara de
sellado — ver [[Documentacion-visor/13-Hallazgo-ANSI-B73]].

**4.2** Con el grupo, buscar el sello estándar ANSI B73.1 correspondiente en
catálogo de John Crane, Flowserve o Chesterton.

**4.3** El material de caras y el elastómero **dependen del fluido**, no de
la norma. Para alcohol y vinaza caliente, consultar la tabla de compatibilidad
del fabricante. No inventar.

**4.4** Marcar en `observaciones` qué dato es de campo y cuál es de catálogo.
No es lo mismo y mantenimiento necesita saberlo.

> **Salida:** `bombas.csv` completo. **Este es el entregable que le da valor
> a todo lo demás.**

---

# FASE 5 · Cerrar el sistema — 1 semana

**5.1** Correr `python scripts/exportar_cmms.py`.
Revisar `export/_revision.txt` y cerrar lo que falte.

**5.2** Rehacer el despiece del visor con la arquitectura **ANSI B73.1 real**,
no la genérica.

**5.3** Reemplazar los identificadores `FOTO-01..05` por los TAG reales.

**5.4** Agregar el carrito de repuestos: marcar piezas → generar solicitud a
bodega con los códigos correctos.

**5.5** Activar Gemini. Ahora sí tiene con qué responder.

---

# FASE 6 · Entrega — 3 días

**6.1** Manual de uso, 2 páginas.
**6.2** Procedimiento para que la planta actualice una ficha cuando cambie
un sello.
**6.3** Informe final de práctica.
**6.4** Entregar el vault completo, no solo el visor.
**6.5** Sesión de 30 minutos con mantenimiento mostrando cómo se usa.

---

# Lo que necesito de vos para seguir ayudándote

| Qué | Cuándo |
|---|---|
| La tabla serie ↔ TAG de la Fase 1 | Apenas la tengas |
| El catálogo Hidromac, aunque sea foto de las páginas | Apenas lo consigas |
| Fotos de placa de motor de las demás bombas | Fase 2 |
| Fotos de las cajas de repuesto de bodega | Fase 3 |
| La respuesta de Dimas | Apenas llegue |

Con la tabla serie ↔ TAG puedo actualizar las 15 fichas y el visor de una vez.
Con el catálogo puedo rehacer el despiece correcto.

---

# Si el tiempo no alcanza

Recortar en este orden:

1. El visor 3D
2. El plano 2D con atributos
3. **Nunca** las fichas de bombas

Y si hay que reducir alcance: elegir con mantenimiento las **6 bombas
críticas** y levantarlas a fondo, dejando las otras 9 documentadas como
pendientes. Mejor 6 completas que 15 a medias.

Relacionado: [[16-Prioridades]] · [[09-Plan-de-Accion]] · [[12-Plan-segun-respuestas]]
