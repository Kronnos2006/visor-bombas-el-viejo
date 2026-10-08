# Visor de bombas · Planta El Viejo

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
| `visor-bombas/` | El visor: servidor local en Node sin dependencias, página en Three.js, pruebas |
| `00-Proyecto/` | La base de conocimiento en Obsidian: 77 fichas de equipo, notas de proyecto, scripts |

### El visor

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
