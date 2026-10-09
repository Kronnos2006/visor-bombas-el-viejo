---
tipo: guion
fecha: 2026-10-12
publico: Dimas Arrieta / Vocatus Holding
duracion: 10 min
---

# Guion de la presentación del lunes

**Entregable único: el visor funcionando.** No hay diapositivas. Se abre
`visor-bombas/Iniciar visor.cmd` y se maneja en vivo.

## Antes de entrar (5 min)

1. Abrir `Iniciar visor.cmd`. Esperar la línea `Visor local: http://127.0.0.1:8766`.
2. Confirmar que arriba a la izquierda dice **● LOCAL · OBSIDIAN** y el
   contador marca **15**. Si dice *PROPUESTA · DEMO*, cerrar y abrir
   `Iniciar datos reales.cmd`.
3. Dejar el modo en **Sector fotografiado**.
4. Tener la pestaña del navegador en pantalla completa.

Si algo no arranca: `node --test test.mjs test-layout.mjs test-sector.mjs test-despiece.mjs`
dice qué se rompió antes de que lo pregunten.

## 1 · De qué se trata (1 min)

«Lo que pidieron fue un plano consultable: que el mecánico toque una bomba
y vea qué sello, qué empaque y qué o-rings lleva. Esto es ese buscador,
funcionando, con los datos que hoy existen.»

No prometer el 2D editable todavía. Es la etapa siguiente.

## 2 · El sector fotografiado (2 min)

- Mostrar el mapa. Decir que son **posiciones aproximadas** levantadas de
  las 41 fotos del área, no del plano.
- Abrir el panel de **placas leídas · 10 equipos**: marca, modelo, tamaño,
  serie, caudal, altura, rpm, impulsor, material.
- Punto fuerte: «esto no lo inventó la computadora, está en la placa, y
  cada dato tiene la foto detrás.»

## 3 · El hallazgo técnico (2 min)

Es la parte que más conviene recalcar, porque cambia el costo del proyecto:

- Las placas dicen `1X1.5-8`, `3X4X8G`, Hidromac **2196**, Titan **4196**.
- Eso significa que son bombas **ANSI/ASME B73.1**: una norma dimensional.
- Consecuencia práctica: **el sello es intercambiable entre marcas** del
  mismo tamaño, y el diámetro de eje bajo el sello lo fija el grupo de
  potencia, no el modelo comercial.
- Traducción para bodega: se puede estandarizar el repuesto en vez de tener
  un sello distinto por marca.

## 4 · El despiece (2 min)

- Botón **Ver despiece ANSI B73.1**. Mover el deslizador de explosión.
- Tocar la pieza **06 · Sello mecánico de cartucho**: muestra los once
  campos que hay que tener para comprar, y dice **«Sin levantar»** en los
  que faltan.
- Decir la frase clave: «el sistema no adivina. Si el dato no está, lo dice.
  Un o-ring equivocado en una planta de alcohol es una fuga.»
- Tocar la pieza **10 · Motor brida JM**: ahí sí hay repuestos confirmados,
  rodamientos 6309-2Z-J/C3 y 6308-2Z-J/C3, leídos de placa.
- Aclarar sin que lo pregunten: la arquitectura es la de la norma, la
  geometría **no está dimensionada**, no es plano de taller.

## 5 · Qué falta y qué necesito de ustedes (2 min)

Esto es lo único que hay que pedir, y conviene pedirlo concreto:

1. **Asociar serie ↔ TAG.** Hay 10 placas leídas y 15 bombas en el P&ID.
   Nadie puede decir todavía cuál placa es cuál TAG. Media mañana en campo
   con alguien de mantenimiento lo resuelve.
2. **El catálogo Hidromac 2196.** Con ese PDF, las medidas de sello,
   empaque y o-rings del despiece se llenan solas.
3. **Confirmar** si las bombas fotografiadas son parte de las 15 del
   proyecto D-18033 o son equipos agregados después.
4. **La placa 210771-4**, que quedó sin leer.

## 6 · Hacia dónde va (1 min)

- Los datos ya salen en el formato de cuatro tablas (`activos`, `catálogo
  de repuestos`, `BOM`, `historial`) para cargarlos a un software de
  mantenimiento cuando la planta adopte uno. Hoy no hay ninguno.
- El 2D editable con bloques de atributos es la etapa siguiente, una vez
  que los TAG estén asociados.

## Preguntas que probablemente hagan

**¿Esto reemplaza AutoCAD?** No. AutoCAD sigue siendo la fuente del plano.
Esto es la capa de consulta encima.

**¿Por qué tantos campos dicen «Sin levantar»?** Porque todavía no están
documentados y preferimos que se vea el hueco antes que llenarlo con un
supuesto.

**¿Cuánto cuesta?** Hasta aquí, cero en licencias: todo con herramientas
libres y la bóveda de Obsidian.

**¿Funciona sin internet?** Sí. Corre en la máquina, en 127.0.0.1. Solo la
consulta opcional a Gemini sale a la red, y hay que activarla a mano.
