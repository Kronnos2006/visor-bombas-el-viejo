---
fecha: 2026-10-07
estado: revision-fotografica
---

# Levantamiento fotográfico del área

[[00-Inicio|Inicio]] · [[11-Placas-fabricantes-y-CAD|Investigación previa de fabricantes]]

## Alcance solicitado

Representar únicamente las bombas del sector delimitado en amarillo en la captura de Google Earth del usuario. Buscar semejanza exterior y ubicación relativa fiel a las fotos. La captura muestra 706,79 m² y perímetro 106,82 m: son lecturas de la herramienta, no medidas verificadas en campo. No se conoce todavía la correspondencia exacta entre ese polígono y cada punto fotografiado.

## Recepción y conservación

Origen: `<RUTA-LOCAL>/Downloads/fotos de bombas.zip`. Contiene 41 imágenes HEIC, no 41 bombas. Hay fotos repetidas de equipos, placas, motores y vistas generales.

Se conservaron los 41 archivos originales sin modificar en `Evidencia/Fotos-bombas-2026-10-07/Originales`. Se generaron 41 JPG de consulta (lado máximo 2200 píxeles) y cuatro hojas de contacto. `inventario.json` registra nombre, número, dimensiones originales y SHA-256 de cada original. Las copias JPG sirven para lectura; conservar HEIC para detalle y metadatos.

Herramienta reproducible: `<RUTA-LOCAL>/vocatus/auto cad/revisar_fotos.py`, con Pillow/pillow-heif instalados localmente en `.herramientas-fotos`. No modifica los archivos del ZIP.

## Observaciones visuales para el modelo

- En la foto 40 (`20261007_111845`) se distinguen cinco conjuntos de bombeo en la plataforma frente al muro blanco, próximos a la escalera amarilla. Esto es un conteo de esa vista; no establece el total del sector.
- Las vistas 23–27 y 31–41 muestran otros frentes, esquinas y pasillos. No sumar cada aparición como equipo nuevo.
- Las bombas fotografiadas están junto al exterior del muro de contención de los tanques y en pasillos de servicio. La geometría futura debe respetar estas referencias y la separación visible entre muro, bomba y tanque.
- Detalles para representar: carcasa azul, bridas y pernos, guarda de acoplamiento naranja o amarilla según equipo, base metálica sobre pedestal, motor y cubierta rojiza. No todos los equipos tienen la misma cubierta ni tamaño.
- Las fotos aportan referencias para orientación y proporción, pero no cotas exactas, coordenadas, interiores ni piezas de sello. Una reconstrucción desde ellas seguirá siendo aproximada.

## Placas legibles adicionales

Lectura visual de las imágenes ampliadas. Identificadores temporales de fotografía, no TAG oficiales. Las letras finales de SIZE deben confirmarse con catálogo/fabricante.

| Foto | Archivo (sin extensión) | Fabricante/modelo | Tamaño leído | Serie leída |
| --- | --- | --- | --- | --- |
| 7 | 20261007_110829 | Hidromac 2196 | 1×1.5–8 LF | 210771-5 |
| 9 | 20261007_110905 | Hidromac 2196 | 1×1.5–8 LF | 210771-2 |
| 10 | 20261007_110916 | Hidromac 2196 | 1×1.5–8 LF | 210771-1 |
| 15 | 20261007_110953 | Hidromac 2196 | 3×4–8G MTO I (sufijo por confirmar) | 220105-2 |
| 16 | 20261007_111014 | Hidromac 2196 | 3×4×8G MTO I (sufijo por confirmar) | 220105-1 |
| 35 | 20261007_111538 | Hidromac 2196 | 1×1.5–8 LF | 210771-3 |

Las fotos 1–4 incluyen el conjunto y las placas ya investigadas: Hidromac 210770-1 y Titan 4196. Su pertenencia al sector delimitado y posición dentro de él no están confirmadas por esta revisión. No asignarlas automáticamente a una ubicación por el orden de archivos. Tampoco asociar una placa con una vista general exclusivamente porque se tomaron consecutivamente.

## Estado de integración

Se revisaron las cuatro hojas de contacto y se ampliaron las placas y vistas generales. Documentación y fotografías disponibles en Obsidian. Las fichas oficiales de activos no se modificaron.

### Actualización del visor

La escena `Sector fotografiado` muestra ahora **10 posiciones temporales** (`BOMBA-A` a `BOMBA-J`) repartidas en tres frentes: cinco en el frente principal visible junto a la escalera, tres en el pasillo lateral y dos en el frente posterior. La distribución lateral y posterior es una reconstrucción provisional a partir de las fotografías; debe confirmarse en campo. Las letras no son TAG oficiales y ninguna placa se atribuye todavía a una posición.

Cada posición abre dos representaciones:

- **Exterior aproximado:** carcasa ANSI azul, bridas empernadas, descarga vertical, bancada de dos largueros, guarda naranja ventilada, motor TEFC y cubierta rojiza abierta por debajo. Se diferencian proporciones LF, MTO y Titan para evitar que todos los conjuntos parezcan idénticos.
- **Vista explosionada:** conserva los diez componentes ilustrativos y el control de separación. Está rotulada como arquitectura ANSI/ASME B73.1 con medidas pendientes; no es un CAD de fabricación ni autoriza selección de repuestos.

La escena utiliza tanques, muro, tuberías aéreas y escalera como referencias espaciales. Las coordenadas son locales y aproximadas. Fuente ejecutable: `visor-bombas/public/sector-fotos.js`; integración y cambio exterior/despiece: `visor-bombas/public/app.js`; verificación: `visor-bombas/test-sector.mjs`.

Para montar la escena se puede partir de los frentes visibles y referencias físicas (escalera, esquina del muro, pasillo), manteniendo una ubicación aproximada y números temporales. La vinculación serie ↔ conjunto fotografiado ↔ TAG debe confirmarse antes de reemplazar datos reales. Los modelos externos y los despieces internos tienen grados de evidencia distintos.

## Galería de revisión

![[Evidencia/Fotos-bombas-2026-10-07/contacto-1.jpg]]

![[Evidencia/Fotos-bombas-2026-10-07/contacto-2.jpg]]

![[Evidencia/Fotos-bombas-2026-10-07/contacto-3.jpg]]

![[Evidencia/Fotos-bombas-2026-10-07/contacto-4.jpg]]

### Referencia frontal: cinco conjuntos visibles

![[Evidencia/Fotos-bombas-2026-10-07/Consulta/20261007_111845.jpg]]
