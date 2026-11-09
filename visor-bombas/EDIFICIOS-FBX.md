# Edificios del plano de sitio

Fuentes: `FBX.zip` y `Baños3D-3DView-VOCATUS-Banos-3Dgeneral.fbx`, entregados el 14-oct-2026. Los cinco FBX se convirtieron a GLB sin alterar sus dimensiones; se centraron en su huella y se apoyaron en cota cero. Los colores son ilustrativos y no indican materiales instalados.

En la vista compartida por el usuario, el orden de izquierda a derecha es **bodega pequeña, baños, cuarto eléctrico y bodega de químicos**. La ubicación sobre el plano sigue siendo aproximada; las separaciones laterales de 1 a 4 m sirven para que los volúmenes no se superpongan. La torre se apartó unos 4 m adicionales de la bodega de químicos. Estos movimientos son de presentación, no coordenadas de levantamiento.

| Área del visor | Modelo | Huella FBX aproximada | Centro base del plano (px) |
|---|---|---:|---:|
| 1 | Oficina administrativa | 30,7 × 12,8 m | 359, 177 |
| 7 | Bodega pequeña | 8,1 × 8,1 m | 300, 66 |
| 4 | Baños | 11,1 × 8,0 m | 246, 95 |
| 5 | Cuarto eléctrico | 10,8 × 6,8 m | 194, 126 |
| 6 | Bodega de químicos | 14,0 × 8,5 m | 130, 151 |

El usuario confirmó el 14-oct-2026, mediante una captura, que la cara con cerramiento azul y escalones de la bodega pequeña debe mirar hacia la oficina administrativa. En el FBX esa cara corresponde al lado +X local; el visor gira el modelo 90° respecto del eje de la fila para orientarla hacia la oficina. Los números de área se mantienen como etiquetas del plano; la correspondencia final con los edificios debe verificarse con el CAD o en campo. No se agregaron bombas ni datos de equipos a estos edificios.

## Modelo integrado de Revit (20-oct-2026)

Fuente: `PLANTA_COMPLETA_ABRIR_EN_REVIT_2026.rvt` (copia de `Tanque de Agua.rvt`), vista **VOCATUS - Modelo general completo**, exportada a FBX con Revit 2027 el 20-oct-2026. Convertido con `tools/fbx-planta-a-glb.mjs` a `public/modelos/planta-integrada.glb` (pies → metros, centrado en su huella y apoyado en cota cero).

- 887 elementos del FBX; 4,19 M triángulos simplificados a unos 0,85 M; archivo de 5,5 MB con compresión meshopt.
- Huella aproximada 87,5 × 73,9 m; altura 28,1 m.
- Revit no exportó materiales: los colores se asignan por el nombre de cada elemento y son ilustrativos.
- Aparece en el menú como **Modelo integrado** y se ve solo (`aparte: true`): no se dibuja en la vista general, porque repite la torre y los edificios y su ubicación no está ligada al plano de sitio.
- **Sectores:** barra «Aislar sector» (Torre de destilación, Fermentación, Semilleros, Almacenamiento de alcohol, Cuatro tanques, Agua y enfriamiento, Calderas y nave, Edificios). Los pisos quedan como referencia y la cubierta común se oculta al aislar. La asignación de cada parte del FBX a un sector está en `public/planta-integrada.js`.
- **Bombas de la torre con ficha (B2–B21):** se ubican sobre el modelo con la misma posición que en la vista de la torre. La alineación torre → modelo integrado se calcula por mínimos cuadrados con las piezas DUSA de igual nombre en ambos modelos (110 piezas, error medio 0,66 m; giro y traslado en `planta-integrada.json`). Las bombas DUSA del FBX se omiten para no duplicarlas. Tocar una abre su ficha sin salir del modelo integrado.
- **Bombas sin ficha:** las 18 bombas modeladas en el FBX que no tienen TAG llevan la etiqueta «Sin ficha» con su nombre.
- Las 12 bombas del sector de tanques todavía no se ubican sobre el modelo integrado: falta confirmar a qué parte del modelo corresponde ese sector.
- Medidas provisionales, según el propio respaldo: no es levantamiento exacto.

## Naves del plano de conjunto A15 (9-nov-2026)

Archivo: `public/naves-sitio.js`. Se agregan sobre el modelo de Blender (vista por defecto) y entran en el sector **Edificios**.

- **Área 3 · Nave pequeña** — láminas A16 y A17 (S3 Ingenieros, abril 2024): ejes 7,97 × 13,65 m, columnas en ejes A–D (4,5 + 4,5 + 4,65 m), alero +4,65 m, cumbrera +6,012 m, portón 3,88 × 4,17 m en el eje A, losa 9,8 × 17,5 m, cubierta y paredes en lámina esmaltada.
- **Bodega de ron (nave grande existente)** — sin planos propios: huella medida en A15 (escala 1:500) de 26,9 × 18,1 m. Aspecto y alturas estimados con fotos de campo del 9-nov-2026: alero ≈8,6 m, cumbrera ≈10,3 m, zócalo de concreto ≈1,3 m, lámina plateada, ventanal alto en ambos frentes, portón ≈5,4 × 3,6 m con puerta peatonal. El portón va en el frente −X (corregido por el usuario). Queda recta con los ejes del modelo y a ≥8 m de la planta.
- La nave pequeña también se ajustó a las fotos: lámina blanca, esquineros azules, cubierta gris oscuro, portón de dos hojas y puertas de servicio en un costado y en el fondo.
- **Ubicación:** A15 se ajusta al modelo con los cinco edificios FBX (semejanza 2D; error máximo 0,23 m). Como el resto del modelo no sigue A15 al pie de la letra, una nave se aparta si pisa equipos y se acerca a la planta si su losa queda fuera del terreno (`window.__navesSitio.apartadas`, en metros).
- **Tanque junto a la nave pequeña** — círculo existente de A15 (Ø 12,3 m = dique de bloques). Tanque Ø ≈10 m y ≈12 m de alto, dique ≈2,6 m y escalera helicoidal amarilla, estimados con fotos. Va unido a la nave (se mueve con ella) a ≈1,8 m de su costado, como en las fotos; A15 lo dibuja a ≈4,5 m.
