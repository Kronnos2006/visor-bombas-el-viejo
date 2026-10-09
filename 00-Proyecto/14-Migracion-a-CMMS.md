# 14 — Diseñado para migrar a un CMMS

> [!info] Revisión documental 2026-10-07
> Leer [[Documentacion-visor/06-Pendientes-y-migracion]] antes de ejecutar o prometer una migración. El exportador local maneja cero activos, pero su carpeta/esquema de informes difieren del visor. Los IDs requieren revisión. No se garantiza tiempo de importación, compatibilidad universal ni clasificación normativa validada.

La planta no tiene software de mantenimiento. Lo que entregamos funciona
desde el día uno **y** está hecho para que el día que compren un CMMS sea una
importación, no un rehacer.

## El principio

No inventamos un modelo de datos propio. Usamos **las cuatro entidades que
todo CMMS maneja**, con nombres y relaciones limpios:

| Tabla | Qué es | Cómo se llama en los CMMS |
|---|---|---|
| `activos.csv` | Los equipos | Assets / Equipos / Technical Objects |
| `repuestos.csv` | Catálogo de repuestos | Parts / Items / Materiales |
| `lista_materiales.csv` | Qué repuesto lleva cada equipo | BOM / Lista técnica |
| `ordenes.csv` | Historial de intervenciones | Work Orders / Órdenes |

**Esto NO es un formato universal listo para importar en cualquier CMMS.**
Cada destino exige su propio mapeo de columnas, sus relaciones y sus
identificadores — Odoo, por ejemplo, documenta reglas propias de importación
(IDs externos, orden de carga, campos relacionales). Lo que estas cuatro
tablas garantizan es que el trabajo de mapeo sea de horas y no un rehacer:
las entidades y las relaciones ya están bien separadas.

## Taxonomía estándar

Los activos llevan el código de **clase de equipo de ISO 14224**:
`clase_iso14224: PU` (pump). Eso no admite duda para una bomba.

El **tipo** (`CE` centrífuga / `RE` desplazamiento positivo) solo se exporta
cuando está declarado explícitamente en el campo `tipo_bomba` de la ficha.
No se deduce del nombre del servicio: una "dosificadora" puede ser de
diafragma, de pistón o peristáltica, y asignarle `RE` a ciegas es inventar.
Cuando el tipo no mapea, el script lo deja vacío y lo avisa.

**Esto no es cumplimiento de ISO 14224.** La norma cubre mucho más: datos de
falla, modos, causas, consecuencias, acciones de mantenimiento y tiempos.
Usar su taxonomía de clase es un paso hacia esa dirección, nada más. Si la
planta quiere comparar su tasa de falla de sellos contra la referencia de la
industria, hace falta además levantar los datos de falla que hoy no existen.

## Cómo exportar

```bash
cd 00-Proyecto/scripts
python exportar_cmms.py
```

Lee las 15 fichas de `bombas/`, y escribe en `00-Proyecto/export/`:
los cuatro CSV más un `activos.json` para quien quiera consumirlo por API.

El script no necesita librerías: trae su propio lector de frontmatter.
Al final escribe `export/_revision.txt` con qué quedó incompleto y por qué.

### Reglas de integridad que respeta

- **Códigos deterministas.** El código de cada repuesto sale de un md5 de su
  identidad, o del número de parte del fabricante si existe. La misma pieza da
  el mismo código en toda corrida y en cualquier máquina. (Antes usaba
  `hash()` de Python, que cambia entre ejecuciones — era un bug real.)
- **El código de bodega de la bomba no se usa como código de repuesto.**
  Son cosas distintas; mezclarlas generaba repuestos duplicados y relaciones
  hacia códigos inexistentes.
- **Identidad completa.** Dos repuestos son el mismo solo si coinciden
  familia, fabricante, número de parte, medida, material, elastómero y dureza.
  Dos o-rings de 45x3 mm, uno Viton y otro EPDM, son dos repuestos distintos.
- **No se inventan cantidades.** Si la ficha no la declara, la celda queda
  vacía. Nunca se asume 1.
- **Verificación de integridad.** Si alguna relación apuntara a un repuesto
  que no está en el catálogo, el script aborta en vez de exportar basura.
- **Historial de dos fuentes.** La tabla dentro de la ficha, más los informes
  sueltos en `00-Proyecto/informes-mantenimiento/*.md` si esa carpeta existe.
  Cada orden lleva columna `fuente` para saber de dónde salió.

## Estado actual del export

- **activos.csv** → 15 filas, con TAG, servicio, área, clase ISO y referencia
  documental. Esto ya es importable hoy.
- **repuestos.csv**, **lista_materiales.csv**, **ordenes.csv** → vacíos.
  Se llenan solos conforme se complete el levantamiento: el script deriva
  cada repuesto de los campos `sello_*`, `empaque_*` y `orings` de la ficha.

Es decir: **el mecánico llena la ficha en Obsidian y el catálogo de repuestos
se genera solo.** Nadie digita dos veces.

## La migración, el día que llegue

1. Instalar el CMMS elegido.
2. Correr `exportar_cmms.py`.
3. Importar los cuatro CSV en ese orden: activos → repuestos → lista de
   materiales → órdenes. Ese orden importa: la lista de materiales necesita
   que activos y repuestos ya existan.
4. Mapear nombres de columna si el CMMS los llama distinto. Es un rato, no
   un proyecto.

El vault de Obsidian queda como documentación técnica y el CMMS toma la
operación diaria. No compiten.

## Por qué no instalamos un CMMS ahora

Tres razones, en orden de peso:

1. **El dato no existe todavía.** Un CMMS vacío no le sirve a nadie. Primero
   el levantamiento, después la herramienta.
2. **Instalar software en una planta no lo decide un practicante.** Necesita
   servidor, usuarios, respaldos, alguien que lo administre y una decisión de
   la empresa.
3. **Markdown no vence.** Si el proyecto de CMMS se cae o se posterga dos
   años, las fichas siguen sirviendo y siguen siendo legibles.

Cuando la planta decida, el camino está pavimentado.

## Candidatos de CMMS para recomendar

| Software | Licencia | Para este caso |
|---|---|---|
| Atlas CMMS | Open source, self-hosted | El más directo: activos, repuestos, OT, historial |
| openMAINT | Open source | Más completo, más pesado de administrar |
| Odoo Mantenimiento | Open source / SaaS | La mejor opción si la empresa ya usa Odoo |
| Fracttal | SaaS de pago | Latinoamericano, soporte en español |

No recomendar uno sin saber qué infraestructura tiene la empresa. Es la
pregunta 14 de [[11-Hoja-de-reunion-Dimas]].

Relacionado: [[13-Base-de-conocimiento-IA]] · [[03-Base-Activos-Bombas]] · [[09-Plan-de-Accion]]
