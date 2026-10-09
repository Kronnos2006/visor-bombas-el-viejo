---
tipo: bitacora
autor: Claude (Cowork)
fecha: 2026-10-09
alcance: visor-bombas · portada nueva y pulido visual (sin cambios de funciones)
---

# Portada y pulido visual · 9 de octubre

Pedido: hacer el visor más estético tomando como referencia un brief de
landing premium. Decisiones del usuario: **portada + pulido del visor**, tono
**oscuro** como el visor actual, y **no tocar el despiece ni ninguna función**.
Por eso no se usó la parte del brief de video con scroll.

## Rutas

| Antes | Ahora |
|---|---|
| `/` abría el visor | `/` abre la **portada** |
| — | `/visor.html` abre el visor (antes `index.html`, solo renombrado) |
| `/#B22` abría el expediente | `/#B22` redirige a `/visor.html#B22`; los vínculos viejos siguen sirviendo |

El logo del visor lleva a la portada.

## Portada (`public/index.html`, `inicio.css`, `inicio.js`)

- Inicio con la foto real del lado frontal (B22, B30, B31) y botón «Abrir el visor».
- «Qué podés hacer»: ubicar, desarmar, consultar.
- **Placas de las 12 posiciones**, agrupadas por lado. Se generan desde
  `equipos-sector.js` (los mismos datos del visor, solo lectura); cada placa
  abre el expediente de esa bomba. B22 aparece como «Sin uso».
- «Cómo leer los datos»: qué tiene fuente y qué sigue pendiente.
- Una sola animación de entrada; respeta «reducir movimiento».

## Visor (solo `style.css`)

Bloque «Pulido visual 2026-10-09» al final del archivo: tipografía Archivo,
etiquetas pequeñas un punto más grandes, botones redondeados con estados de
hover/presión, lista de bombas y pestañas con transición, barras de
desplazamiento discretas. No cambia la distribución, la escena 3D ni el despiece.

## Tipografía

Archivo (licencia SIL OFL) servida desde `public/vendor/fonts/` con
`public/fonts.css`, para que funcione sin internet en la planta.

## Verificación

Capturas de escritorio (1440 px) y móvil (390 px), sin desplazamiento horizontal.
Pruebas `test-sector-confirmado`, `test-sector`, `test-despiece`, `test-layout`
y `test.mjs` (6/6): OK.

Relacionado: [[06-Sesion-2026-10-09]].
