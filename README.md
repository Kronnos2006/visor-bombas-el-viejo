# Visor de bombas · Planta El Viejo

## Abrir en GitHub Codespaces

En GitHub, seleccionar **Code → Codespaces → Create codespace on main**. La configuración de `.devcontainer` inicia `visor-bombas` con datos de demostración, publica el puerto 8766 como vista privada y evita depender de la bóveda instalada en una PC.

Codespaces es el entorno de desarrollo. La publicación permanente se preparará por separado en Cloudflare Workers y D1. No guardar claves API en el repositorio.

Buscador 3D de bombas con su información de sellado, y la base de conocimiento
que lo alimenta. Práctica profesional de Ingeniería Mecatrónica en Vocatus
Holding / Azucarera El Viejo (Filadelfia, Guanacaste, Costa Rica), proyecto de
ingeniería **D-18033**.

El problema que resuelve: un mecánico parado frente a una bomba necesita saber
qué sello, qué empaquetadura y qué o-rings lleva. Hasta ahora eso no estaba en
ningún lado consultable.

## Qué hay acá

| Carpeta | Qué contiene |
|---|---|
| `visor-bombas/` | El visor: servidor Node, PDF con pdf-lib, página en Three.js, pruebas |
| `00-Proyecto/` | La base de conocimiento en Obsidian: 77 fichas de equipo, notas de proyecto, scripts |

### El visor

El visor local lee las fichas Bxx y guarda sus informes y PDF en la misma bóveda de Obsidian. Los lanzadores `Iniciar visor.cmd` e `Iniciar datos reales.cmd` detectan `Vacatos` junto a la instalación. `OBSIDIAN_VAULT` tiene prioridad para seleccionar una bóveda explícitamente. Sin una bóveda local junto al visor, se usa la base `00-Proyecto` del checkout.

Los informes se guardan en `00-Proyecto/Mantenimiento`; sus PDF quedan en `Adjuntos`. El historial muestra solo las mediciones registradas: un campo vacío no genera una lectura de ejemplo. Los reportes antiguos del navegador se pueden importar desde Historial cuando se abre el visor local. El responsable de una importación sin autor se identifica como no registrado.

En Vercel se mantienen los reportes en el navegador y se bloquea la escritura del sistema de archivos. Codespaces y `VOCATUS_CLOUD_DEV=1` fuerzan datos DEMO; los informes de demostración no se exportan como mantenimiento real.

Desde la raíz del repositorio, ejecutar `npm test` y `python -B 00-Proyecto/scripts/test_exportar_cmms.py` para comprobar persistencia, PDF, datos, acceso y exportación. Para exportar una bóveda externa, establecer `OBSIDIAN_VAULT` antes de ejecutar `python 00-Proyecto/scripts/exportar_cmms.py`.

El extractor acepta `--source`, `--output` y `--converter` para usar LibreDWG en Windows o Linux. `python 00-Proyecto/scripts/extract_tags.py --help` muestra las opciones; requiere `ezdxf` y el conversor `dwg2dxf` instalado.

Servidor local (`server.mjs`) que lee las fichas de Obsidian y las sirve a una
página de Three.js. Corre en `127.0.0.1`, sin internet salvo la consulta
opcional a Gemini, que hay que activar a mano.

- mapa del área y acercamiento a cada bomba
- despiece de 10 piezas según **ANSI/ASME B73.1** (desarme posterior), con
  deslizador de explosión
- panel con la ficha, el historial y los documentos vinculados
- capa de render con entorno PMREM, luz de tres puntos y materiales PBR

```
cd visor-bombas
node server.mjs          # http://127.0.0.1:8766
node --test test.mjs test-layout.mjs test-sector.mjs test-despiece.mjs
```

### La base de conocimiento

77 fichas de equipo (`00-Proyecto/equipos/B1.md` … `B77.md`) en Markdown con
frontmatter YAML, generadas desde el inventario de la empresa.

Scripts en `00-Proyecto/scripts/`:

- `extract_tags.py` — lee DWG sin AutoCAD (LibreDWG + ezdxf) y saca los TAG
- `crear_notas_bombas.py` — genera las fichas desde un CSV
- `consultar_bombas.py` — consulta en lenguaje natural sobre las fichas
  (Gemini, Claude u OpenAI)
- `exportar_cmms.py` — exporta cuatro tablas listas para migrar a un CMMS

## La regla de los datos

Esto es lo que hace al proyecto utilizable y conviene no romperlo. Cada dato
tiene un nivel, y los niveles no se mezclan:

| Nivel | Qué significa |
|---|---|
| **documental** | está escrito en la fuente o en una placa legible |
| **inferido** | conclusión técnica razonable, **no escrita** en la fuente |
| **pendiente** | necesita catálogo, placa, medición o confirmación en campo |

Un campo vacío en la fuente queda vacío. No se estima nada. La confianza está
partida en tres campos, porque una transcripción exacta no implica que se sepa
cuál bomba física es.

El motivo es concreto: un o-ring equivocado en una planta de alcohol es una
fuga de producto inflamable. El asistente de consulta tiene la instrucción
explícita de responder *«ese dato todavía no está levantado»* antes que
inventar una medida.

Ver `00-Proyecto/21-Datos-del-modelo.md`.

## Estado

- 77 equipos documentados, con tipo de sello en 46 y rodamientos en 62
- despiece con la arquitectura real de la norma, **sin dimensionar**
- 10 placas leídas en foto; **ninguna confirmada en campo**
- materiales de caras, elastómeros y medidas de o-rings: **pendientes del
  catálogo del fabricante**

El modelo 3D no es un plano de taller y ninguna medida sirve para comprar un
repuesto.

## Qué no está en este repositorio

Planos DWG, PDF, fotos de placas y el inventario original de la empresa. Son
documentación de Vocatus, no de este proyecto.

## Licencia

Sin licencia definida. Trabajo académico de práctica profesional.
